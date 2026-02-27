from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json
import os
import traceback
import uuid
from pydantic import ValidationError
from ..dice import roll
from ..srd_queries import get_weapon_stats, get_monster_stats, search_monsters, get_spell_mechanics, get_random_monster_by_cr
from ..inventory import get_inventory, generate_loot, create_inventory_item, equip_item, unequip_item, distribute_loot, add_gold, get_gold
from ..state import tracker, tracker_lock, save_game, load_game, list_saves, combatant_positions
from ..rules import validate_concentration
from ..schemas import (
    GetInventoryAction, GenerateLootAction, SearchMonstersAction, AddCombatantAction,
    EquipItemAction, UnequipItemAction, AttackAction, MonsterAttackAction, CastSpellAction,
    RollInitiativeAction, StartCombatAction, NextTurnAction, RollAction, GetSpellsAction,
    DistributeLootAction, CloseWidgetAction, MapInteractionAction, NarrativeActionAction,
    SaveGameAction, LoadGameAction,
    ConnectionEstablishedEvent, InventoryUpdateEvent, NarrativeChunkEvent,
    MonsterSearchResultsEvent, InitiativeUpdateEvent, StatePatchEvent, DiceResultEvent, AckEvent,
    InventoryItemModel, CombatantState, LogEvent, SpellBookUpdateEvent, SpellData,
    LootDistributedEvent, MapUpdateEvent, ListSavesAction, MapDataEvent, MapNode,
    NarrativeEvent, GetShopAction, GoldUpdateEvent, ShopInventoryEvent, ShopItemModel,
)
from ..maps import get_node, get_all_nodes
from ..combat import resolve_attack, resolve_saving_throw, resolve_aoe_spell, AttackResult
from ..spells import get_all_spells, get_spell
from ..ai.chronos import ChronosClient
from ..ai.visual_vault import VisualVaultClient
from ..ai.cartographer import CartographerClient
from ..ai.treasurer import TreasurerClient

router = APIRouter()

class ConnectionManager:
    """Manage active WebSocket connections for AG-UI streaming."""

    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_event(self, websocket: WebSocket, event: dict):
        """Send a typed AG-UI event to a specific client."""
        await websocket.send_json(event)

    async def broadcast(self, event: dict):
        """Broadcast an AG-UI event to all connected clients."""
        for connection in self.active_connections:
            await connection.send_json(event)


manager = ConnectionManager()
chronos = ChronosClient()
visual_vault = VisualVaultClient()
cartographer = CartographerClient()
treasurer = TreasurerClient()

# --- Rate Limiting Config (§ STRIDE-D1) ---
RATE_LIMIT_DELAY = 0.5  # Seconds between actions
last_action_times: dict[str, float] = {}


def build_combatant_states():
    """Helper to build consistent combatant state list."""
    current_actor = tracker.get_current_actor()
    current_id = current_actor.id if current_actor else None
    return [
        CombatantState(
            id=c.id, name=c.name, initiative=c.initiative,
            active=c.is_active, hp=c.hp_current, hp_max=c.hp_max, ac=c.ac,
            cr=c.cr, type=c.type, resistances=c.resistances, immunities=c.immunities,
            conditions=[cond.condition_id for cond in c.conditions],
            current=(c.id == current_id),
            position=combatant_positions.get(c.id)
        ) for c in tracker.combatants
    ]


async def stream_narrative(websocket: WebSocket, fact_packet: dict):
    """Refactored Narrative Streaming Helper with Indexing (§ Track A.2)"""
    chunk_index = 0
    async for text_chunk in chronos.generate_narrative(fact_packet):
        await manager.send_event(websocket, NarrativeChunkEvent(
            type="NARRATIVE_CHUNK", content=text_chunk, index=chunk_index, done=False
        ).model_dump(mode='json'))
        chunk_index += 1

    await manager.send_event(websocket, NarrativeChunkEvent(
        type="NARRATIVE_CHUNK", content="", index=chunk_index, done=True
    ).model_dump(mode='json'))


def _risk_to_cr(risk_level: int) -> tuple:
    """Map a node's risk level to a (min_cr, max_cr) band for monster selection."""
    if risk_level <= 2:   return (0.0, 1.0)
    elif risk_level <= 4: return (1.0, 3.0)
    elif risk_level <= 6: return (3.0, 6.0)
    elif risk_level <= 8: return (6.0, 10.0)
    else:                 return (10.0, 20.0)


async def _resolve_combat_end(websocket: WebSocket, defeated_enemies: list):
    """Award loot and gold after all enemies are defeated, then reset tracker."""
    player = next((c for c in tracker.combatants if c.is_player), None)
    if not player:
        return

    character_id = player.id
    avg_cr = (sum(e.cr for e in defeated_enemies) / len(defeated_enemies)) if defeated_enemies else 1.0

    # Reset tracker to exploration mode
    async with tracker_lock:
        tracker.has_started = False
        tracker.combatants = [c for c in tracker.combatants if c.is_player]
        tracker.turn_index = 0

    # Loot generation
    loot_ids = []
    try:
        loot_ids = generate_loot(max(1, int(avg_cr)))
    except Exception as e:
        print(f"Loot generation failed: {e}")

    created_ids = []
    for template_id in loot_ids:
        try:
            asset_url = await visual_vault.get_asset_url(template_id, "combat trophy")
        except Exception:
            asset_url = f"/assets/items/{template_id}.png"
        try:
            new_item = create_inventory_item(character_id, template_id, visual_asset_url=asset_url)
            created_ids.append(new_item["id"])
        except Exception as e:
            print(f"Item creation failed for {template_id}: {e}")

    # Gold via Treasurer
    world_rep = cartographer.memory.lore.get("world_state", {}).get("reputation", 0)
    enriched = treasurer.enrich_loot_packet(
        fact_packet={"action_type": "combat_victory", "cr": avg_cr},
        cr=max(1, int(avg_cr)),
        items=[i for i in get_inventory(character_id) if i["instance_id"] in created_ids],
        reputation=world_rep,
    )
    gold_delta = enriched.get("gold_reward", 0)
    if gold_delta > 0:
        new_total = add_gold(character_id, gold_delta)
        await manager.send_event(websocket, GoldUpdateEvent(
            type="GOLD_UPDATE", character_id=character_id, gold=new_total, delta=gold_delta,
        ).model_dump(mode='json'))

    # Send inventory + loot events
    all_items = get_inventory(character_id)
    new_items = [i for i in all_items if i["instance_id"] in created_ids]
    await manager.send_event(websocket, LootDistributedEvent(
        type="LOOT_DISTRIBUTED", character_id=character_id,
        items=[InventoryItemModel(**i) for i in new_items],
        message=f"Victory! Found {len(loot_ids)} item(s).",
    ).model_dump(mode='json'))
    await manager.send_event(websocket, InventoryUpdateEvent(
        type="INVENTORY_UPDATE", character_id=character_id,
        items=[InventoryItemModel(**i) for i in all_items],
    ).model_dump(mode='json'))

    # Victory narrative
    victory_fact = {
        "action_type": "combat_victory",
        "enemies_defeated": [e.name for e in defeated_enemies],
        "gold_reward": gold_delta,
        "items_found": len(loot_ids),
    }
    await stream_narrative(websocket, victory_fact)

    await manager.send_event(websocket, LogEvent(
        type="LOG",
        message=f"Victory! +{gold_delta} gp. {len(loot_ids)} item(s) recovered.",
        level="success",
    ).model_dump(mode='json'))

    # Final initiative update (now empty of enemies)
    await manager.send_event(websocket, InitiativeUpdateEvent(
        type="INITIATIVE_UPDATE", combatants=build_combatant_states(),
    ).model_dump(mode='json'))


async def _run_combat_loop(websocket: WebSocket, advance_first: bool = True):
    """
    Auto-advance turns after a player action.
    - advance_first=True  → called after a player attack (need to end player's turn first)
    - advance_first=False → called at encounter start (process current actor if it's a monster)
    Loops through monster turns until the player's turn comes up or combat ends.
    """
    if not tracker.has_started:
        return

    max_steps = 20  # Safety cap
    first = True

    for _ in range(max_steps):
        player = next((c for c in tracker.combatants if c.is_player), None)
        if not player or not player.is_active:
            return  # Player dead — frontend HP watch handles death screen

        enemies_alive = [c for c in tracker.combatants if not c.is_player and c.is_active]
        if not enemies_alive:
            all_enemies = [c for c in tracker.combatants if not c.is_player]
            await _resolve_combat_end(websocket, all_enemies)
            return

        # Advance turn or inspect current
        if advance_first or not first:
            async with tracker_lock:
                current = tracker.next_turn()
        else:
            current = tracker.get_current_actor()
        first = False

        await manager.send_event(websocket, InitiativeUpdateEvent(
            type="INITIATIVE_UPDATE", combatants=build_combatant_states(),
        ).model_dump(mode='json'))

        if not current or current.is_player:
            return  # Player's turn — stop and wait for input

        if not current.is_active or not current.actions:
            continue  # Skip dead/actionless monster

        # --- Auto-resolve monster attack ---
        act = current.actions[0]
        result = resolve_attack(
            attacker_id=current.id,
            target_id=player.id,
            attack_bonus=act.get("attack_bonus", 0),
            target_ac=player.ac,
            damage_dice_sides=act.get("damage_dice_sides", 6),
            damage_dice_count=act.get("damage_dice_count", 1),
            damage_modifier=act.get("damage_modifier", 0),
            damage_type=act.get("damage_type", "slashing"),
            target_current_hp=player.hp_current,
        )
        async with tracker_lock:
            player.hp_current = result.target_remaining_hp
            if result.target_status == "dead":
                player.is_active = False

        fp = result.to_fact_packet()
        fp.update({"attacker_name": current.name, "action_name": act.get("name", "attack"), "is_player": False})
        await stream_narrative(websocket, fp)

        await manager.send_event(websocket, LogEvent(
            type="LOG",
            message=f"{current.name}: {'HIT' if result.hit else 'MISS'} ({result.damage_total} dmg)",
            level="warning",
        ).model_dump(mode='json'))

        await manager.send_event(websocket, StatePatchEvent(
            type="STATE_PATCH",
            patches=[{"op": "replace", "path": f"/targets/{player.id}/hp", "value": result.target_remaining_hp}],
            fact_packet=fp,
        ).model_dump(mode='json'))

        if not player.is_active:
            return  # Player died — frontend will detect HP <= 0


@router.websocket("/ws/game/{session_id}")
async def game_websocket(websocket: WebSocket, session_id: str, role: str = "player", dm_token: str | None = None):
    """
    AG-UI WebSocket endpoint (§6).
    Handles bidirectional streaming of typed Pydantic events.
    Roles: 'player' (default), 'dm' (requires valid dm_token).
    """
    # Simple DM authentication
    final_role = "player"
    _dm_token = os.environ.get("DM_TOKEN", "AG-DM-2026")
    if role == "dm" and dm_token == _dm_token:
        final_role = "dm"
    
    await manager.connect(websocket)
    try:
        # Determine the primary character for this session 
        # (In v1.0, we default to player_1, but we send it explicitly to the client)
        active_player = next((c for c in tracker.combatants if c.is_player), None)
        character_id = active_player.id if active_player else "player_1"

        # Send initial connection confirmation with assigned role and specific character_id
        event = ConnectionEstablishedEvent(
            type="CONNECTION_ESTABLISHED",
            session_id=session_id,
            character_id=character_id,
            role=final_role,
            message=f"Connected to Dungeon Cortex Engine as {final_role.upper()}"
        )
        await manager.send_event(websocket, event.model_dump(mode='json'))

        while True:
            try:
                data = await websocket.receive_json()
                print(f"DEBUG: Received WebSocket message: {data}")
                action_type = data.get("action") or data.get("type")

                if not action_type:
                    raise ValueError("Missing 'action' or 'type' field")
                
                # Ignore connection metadata if it somehow slips into the loop
                if action_type == "CONNECTION_REQUEST":
                    continue

                # --- Rate Limiting (§ STRIDE-D1) ---
                import time
                client_id = f"{session_id}_{websocket.client}"
                now = time.time()
                if client_id in last_action_times:
                    if now - last_action_times[client_id] < RATE_LIMIT_DELAY:
                         await manager.send_event(websocket, AckEvent(
                            type="ACK", status="error", message="Rate limit exceeded. Slow down!"
                        ).model_dump(mode='json'))
                         continue
                last_action_times[client_id] = now

                # --- Action Routing & Validation ---
                
                # --- ROLE CHECK (§ STRIDE-E1) ---
                dm_only_actions = {
                    "generate_loot", "distribute_loot", "add_combatant", 
                    "start_combat", "save_game", "load_game"
                }
                
                if action_type in dm_only_actions and final_role != "dm":
                    await manager.send_event(websocket, AckEvent(
                        type="ACK", status="error", message="Permission Denied: DM role required."
                    ).model_dump(mode='json'))
                    continue

                if action_type == "get_inventory":
                    payload = GetInventoryAction(**data)
                    items = get_inventory(payload.character_id)
                    
                    event = InventoryUpdateEvent(
                        type="INVENTORY_UPDATE",
                        character_id=payload.character_id,
                        items=[InventoryItemModel(**i) for i in items]
                    )
                    await manager.send_event(websocket, event.model_dump(mode='json'))

                elif action_type == "generate_loot":
                    payload = GenerateLootAction(**data)
                    loot_ids = generate_loot(payload.cr)
                    target_id = payload.target_character_id

                    if target_id:
                        # Implementation of §8.3 Skill: The Treasurer
                        created_instance_ids = []
                        for template_id in loot_ids:
                            try:
                                # Asset Generation Proxy with V6 Robustness
                                asset_url = await visual_vault.get_asset_url(template_id, "looted from a dungeon chest")
                            except Exception as e:
                                print(f"🎨 Visual Vault Error: {e}. Falling back to default.")
                                asset_url = f"/assets/items/{template_id}.png"
                            
                            # Create item with asset
                            new_item = create_inventory_item(target_id, template_id, visual_asset_url=asset_url)
                            created_instance_ids.append(new_item["id"])
                        
                        all_items = get_inventory(target_id)
                        
                        # Identify the new items for the notification specifically by instance ID
                        new_stuff = [i for i in all_items if i["instance_id"] in created_instance_ids]
                        
                        # Send Loot Event
                        await manager.send_event(websocket, LootDistributedEvent(
                            type="LOOT_DISTRIBUTED",
                            character_id=target_id,
                            items=[InventoryItemModel(**i) for i in new_stuff],
                            message=f"Found {len(loot_ids)} items!"
                        ).model_dump(mode='json'))

                        # Update Inventory UI
                        inventory_event = InventoryUpdateEvent(
                            type="INVENTORY_UPDATE",
                            character_id=target_id,
                            items=[InventoryItemModel(**i) for i in all_items]
                        )
                        await manager.send_event(websocket, inventory_event.model_dump(mode='json'))
                    
                    # Treasurer enriches fact_packet with gold and appraisal data
                    world_rep = cartographer.memory.lore.get("world_state", {}).get("reputation", 0)
                    hydrated_items = []
                    if target_id:
                        hydrated_items = [i for i in get_inventory(target_id)
                                         if i["template_id"] in loot_ids]
                    fact_packet = treasurer.enrich_loot_packet(
                        fact_packet={
                            "action_type": "generate_loot",
                            "cr": payload.cr,
                            "item_count": len(loot_ids),
                            "recipient": target_id,
                        },
                        cr=payload.cr,
                        items=hydrated_items,
                        reputation=world_rep,
                    )
                    # Persist gold reward (Iron Law §2 — State is Truth)
                    if target_id and fact_packet.get("gold_reward", 0) > 0:
                        gold_delta = fact_packet["gold_reward"]
                        new_total = add_gold(target_id, gold_delta)
                        await manager.send_event(websocket, GoldUpdateEvent(
                            type="GOLD_UPDATE",
                            character_id=target_id,
                            gold=new_total,
                            delta=gold_delta,
                        ).model_dump(mode='json'))

                    # Stream Narrative via Helper
                    await stream_narrative(websocket, fact_packet)

                elif action_type == "distribute_loot":
                    payload = DistributeLootAction(**data)
                    target_id = payload.target_character_id
                    
                    for template_id in payload.item_ids:
                         try:
                            asset_url = await visual_vault.get_asset_url(template_id, "looted item")
                         except Exception:
                            asset_url = ""
                         create_inventory_item(target_id, template_id, visual_asset_url=asset_url)

                    all_items = get_inventory(target_id)
                    inventory_event = InventoryUpdateEvent(
                        type="INVENTORY_UPDATE",
                        character_id=target_id,
                        items=[InventoryItemModel(**i) for i in all_items]
                    )
                    await manager.send_event(websocket, inventory_event.model_dump(mode='json'))
                    
                    await manager.send_event(websocket, LootDistributedEvent(
                            type="LOOT_DISTRIBUTED",
                            character_id=target_id,
                            items=[], # sending empty or full logic triggers refresh
                            message=f"Received {len(payload.item_ids)} items."
                        ).model_dump(mode='json'))



                elif action_type == "map_interaction":
                    payload = MapInteractionAction(**data)
                    
                    if payload.interaction_type == "request_data":
                        # Send the full graph
                        nodes = get_all_nodes()
                        current_pos = combatant_positions.get(payload.character_id, "start_town")
                        
                        await manager.send_event(websocket, MapDataEvent(
                            type="MAP_DATA",
                            nodes=nodes,
                            current_node_id=str(current_pos)
                        ).model_dump(mode='json'))
                        continue

                    if payload.interaction_type == "travel":
                        if not payload.target_node_id:
                             await manager.send_event(websocket, LogEvent(
                                type="LOG", message="No travel destination specified!", level="error"
                            ).model_dump(mode='json'))
                             continue

                        current_pos = combatant_positions.get(payload.character_id, "start_town")
                        
                        # Validate connection
                        current_node = get_node(str(current_pos))
                        if not current_node:
                             # Fallback if lost
                             current_node = get_node("start_town")
                             combatant_positions[payload.character_id] = "start_town"

                        if payload.target_node_id not in current_node.connections:
                             await manager.send_event(websocket, LogEvent(
                                type="LOG", message=f"Cannot travel directly to {payload.target_node_id} from {current_node.id}!", level="warning"
                            ).model_dump(mode='json'))
                             continue

                        async with tracker_lock:
                            combatant_positions[payload.character_id] = payload.target_node_id
                        target_node = get_node(payload.target_node_id)
                        
                        # Narrative
                        msg = f"Travelled to {target_node.name}"
                        await manager.send_event(websocket, LogEvent(
                            type="LOG", message=msg, level="success"
                        ).model_dump(mode='json'))

                        # Broadcast to all clients to update their map view
                        await manager.broadcast(MapUpdateEvent(
                            type="MAP_UPDATE",
                            character_id=payload.character_id,
                            node_id=payload.target_node_id,
                            interaction_type="travel",
                            message=msg
                        ).model_dump(mode='json'))
                        
                        # Cartographer builds enriched fact_packet (encounter injection, sensory seed)
                        world_ctx = cartographer.memory.lore.get("world_state")
                        fact_packet = cartographer.build_travel_fact_packet(
                            node=target_node,
                            world_context=world_ctx,
                        )
                        await stream_narrative(websocket, fact_packet)

                        # --- Encounter Auto-Start ---
                        if fact_packet.get("encounter_triggered") and not tracker.has_started:
                            cr_min, cr_max = _risk_to_cr(target_node.risk_level)
                            monster_raw = get_random_monster_by_cr(cr_min, cr_max)
                            if monster_raw:
                                try:
                                    stats = get_monster_stats(monster_raw["id"])
                                except Exception:
                                    stats = {
                                        "name": monster_raw.get("name", "Unknown Creature"),
                                        "ac": 10, "hp_max": 10, "cr": 0, "type": "unknown",
                                        "dex_modifier": 0, "actions": [],
                                        "resistances": [], "immunities": [],
                                    }
                                monster_instance_id = f"monster_{uuid.uuid4().hex[:8]}"
                                async with tracker_lock:
                                    tracker.add_combatant(
                                        id=monster_instance_id,
                                        name=stats["name"],
                                        dex_modifier=stats.get("dex_modifier", 0),
                                        is_player=False,
                                        hp_max=stats["hp_max"],
                                        ac=stats["ac"],
                                        actions=stats.get("actions", []),
                                        resistances=stats.get("resistances", []),
                                        immunities=stats.get("immunities", []),
                                        cr=stats.get("cr", 0),
                                        type=stats.get("type", "unknown"),
                                    )
                                    tracker.start_encounter()

                                await manager.send_event(websocket, LogEvent(
                                    type="LOG",
                                    message=f"⚔ Encounter! {stats['name']} (CR {stats.get('cr', 0)}) appears!",
                                    level="warning",
                                ).model_dump(mode='json'))
                                await manager.send_event(websocket, InitiativeUpdateEvent(
                                    type="INITIATIVE_UPDATE",
                                    combatants=build_combatant_states(),
                                ).model_dump(mode='json'))
                                # If monster won initiative, process their first turn
                                await _run_combat_loop(websocket, advance_first=False)

                    elif payload.interaction_type == "move":
                        # Legacy Grid Movement
                        old_pos = combatant_positions.get(payload.character_id, 0)
                        combatant_positions[payload.character_id] = payload.cell_id
                        
                        await manager.broadcast(MapUpdateEvent(
                            type="MAP_UPDATE",
                            character_id=payload.character_id,
                            cell_id=payload.cell_id,
                            interaction_type=payload.interaction_type,
                            message=f"{payload.character_id} moved to cell {payload.cell_id}"
                        ).model_dump(mode='json'))

                elif action_type == "save_game":
                    payload = SaveGameAction(**data)
                    save_game(payload.save_id)
                    await manager.send_event(websocket, LogEvent(
                        type="LOG", message=f"Game saved: {payload.save_id}", level="success"
                    ).model_dump(mode='json'))

                elif action_type == "load_game":
                    payload = LoadGameAction(**data)
                    success = load_game(payload.save_id)
                    if success:
                        # Broadcast full state update
                        await manager.broadcast(InitiativeUpdateEvent(
                            type="INITIATIVE_UPDATE",
                            combatants=build_combatant_states()
                        ).model_dump(mode='json'))
                        
                        await manager.send_event(websocket, LogEvent(
                            type="LOG", message=f"Game loaded: {payload.save_id}", level="success"
                        ).model_dump(mode='json'))
                    else:
                        await manager.send_event(websocket, LogEvent(
                            type="LOG", message=f"Save not found: {payload.save_id}", level="error"
                        ).model_dump(mode='json'))

                elif action_type == "search_monsters":
                    payload = SearchMonstersAction(**data)
                    results = search_monsters(payload.query)
                    event = MonsterSearchResultsEvent(
                        type="MONSTER_SEARCH_RESULTS",
                        results=results
                    )
                    await manager.send_event(websocket, event.model_dump(mode='json'))

                elif action_type == "add_combatant":
                    payload = AddCombatantAction(**data)
                    
                    # Resolve defaults if template provided
                    name = payload.name
                    hp_max = payload.hp_max
                    ac = payload.ac
                    dex = 0
                    actions = []

                    if payload.template_id:
                        try:
                            stats = get_monster_stats(payload.template_id)
                            name = stats.get("name", name)
                            hp_max = stats.get("hp_max", hp_max)
                            ac = stats.get("ac", ac)
                            actions = stats.get("actions", [])
                            dex = stats.get("dex_modifier", 0)
                            # New fields
                            payload.cr = stats.get("cr", payload.cr)
                            payload.type = stats.get("type", payload.type)
                            payload.resistances = stats.get("resistances", payload.resistances)
                            payload.immunities = stats.get("immunities", payload.immunities)
                        except Exception as e:
                            print(f"Error fetching stats for {payload.template_id}: {e}")

                    async with tracker_lock:
                        tracker.add_combatant(
                            payload.instance_id, name, dex, payload.is_player, hp_max, ac, actions,
                            payload.resistances, payload.immunities, payload.cr, payload.type
                        )

                    event = InitiativeUpdateEvent(
                        type="INITIATIVE_UPDATE",
                        combatants=build_combatant_states()
                    )
                    await manager.send_event(websocket, event.model_dump(mode='json'))

                elif action_type == "equip_item":
                    payload = EquipItemAction(**data)
                    try:
                        # Use character_id from payload (frontend now sends dynamic ID)
                        success = tracker.equip_item(payload.character_id, payload.item_id, payload.slot)
                        if success:
                            items = get_inventory(payload.character_id)
                            event = InventoryUpdateEvent(
                                type="INVENTORY_UPDATE",
                                character_id=payload.character_id,
                                items=[InventoryItemModel(**i) for i in items]
                            )
                            await manager.send_event(websocket, event.model_dump(mode='json'))
                    except Exception as e:
                        print(f"Equip error: {e}")

                elif action_type == "unequip_item":
                    payload = UnequipItemAction(**data)
                    try:
                        # Use character_id from payload
                        success = tracker.unequip_item(payload.character_id, payload.item_id)
                        if success:
                            items = get_inventory(payload.character_id)
                            event = InventoryUpdateEvent(
                                type="INVENTORY_UPDATE",
                                character_id=payload.character_id,
                                items=[InventoryItemModel(**i) for i in items]
                            )
                            await manager.send_event(websocket, event.model_dump(mode='json'))
                    except Exception as e:
                        print(f"Unequip error: {e}")

                elif action_type == "attack":
                    payload = AttackAction(**data)
                    
                    # 1. Fetch Attacker and Target from Tracker (Source of Truth)
                    attacker = next((c for c in tracker.combatants if c.id == payload.attacker_id), None)
                    target = next((c for c in tracker.combatants if c.id == payload.target_id), None)
                    
                    if not target:
                         await manager.send_event(websocket, LogEvent(
                            type="LOG", message=f"Target {payload.target_id} not found!", level="error"
                        ).model_dump(mode='json'))
                         continue

                    # 2. Check Conditions
                    if attacker:
                        disabling_conditions = {"Surprised", "Unconscious", "Paralyzed", "Petrified", "Stunned", "Incapacitated"}
                        active_disablers = [c for c in attacker.conditions if c.condition_id in disabling_conditions]
                        if active_disablers:
                             await manager.send_event(websocket, LogEvent(
                                type="LOG", message=f"Cannot act: You are {active_disablers[0].condition_id}!", level="warning"
                            ).model_dump(mode='json'))
                             continue

                    # 3. Resolve Attack Stats Server-Side
                    # Default to basic unarmed strike or similar if no weapon/action
                    atk_bonus = 0
                    if attacker:
                        # Simplified: assume player characters use STR for melee, DEX for ranged/finesse
                        # For monsters, this will be overridden by action stats
                        atk_bonus = attacker.str_mod if attacker.is_player else 0 # Placeholder, will be refined
                    
                    sides = 4
                    count = 1
                    dmg_type = "bludgeoning"
                    dmg_modifier = atk_bonus

                    # Weapon Lookup (Enforce SRD stats)
                    if payload.weapon_id:
                        try:
                            w_stats = get_weapon_stats(payload.weapon_id)
                            sides = w_stats.get("damage_dice_sides", sides)
                            count = w_stats.get("damage_dice_count", count)
                            dmg_type = w_stats.get("damage_type", dmg_type)
                            # modifier is usually STR/DEX, we calculate it here
                            if attacker:
                                if w_stats.get("finesse", False) or w_stats.get("ranged", False):
                                    dmg_modifier = attacker.dex_mod
                                else:
                                    dmg_modifier = attacker.str_mod
                                atk_bonus = dmg_modifier # For simplicity, attack bonus = damage modifier for now
                        except Exception as e:
                            print(f"Error fetching weapon {payload.weapon_id}: {e}")

                    # Monster Action Lookup (Enforce SRD stats)
                    if payload.action_name:
                        if attacker and attacker.actions:
                            act = next((a for a in attacker.actions if a["name"] == payload.action_name), None)
                            if act:
                                atk_bonus = act.get("attack_bonus", atk_bonus)
                                count = act.get("damage_dice_count", count)
                                sides = act.get("damage_dice_sides", sides)
                                dmg_modifier = act.get("damage_modifier", dmg_modifier)
                                dmg_type = act.get("damage_type", dmg_type)

                    result = resolve_attack(
                        attacker_id=payload.attacker_id,
                        target_id=payload.target_id,
                        attack_bonus=atk_bonus,
                        target_ac=target.ac, # Server-side AC
                        damage_dice_sides=sides,
                        damage_dice_count=count,
                        damage_modifier=dmg_modifier,
                        damage_type=dmg_type,
                        target_current_hp=target.hp_current, # Server-side HP
                    )

                    async with tracker_lock:
                        target.hp_current = result.target_remaining_hp
                        if result.target_status == "dead":
                            target.is_active = False

                    fact_packet = result.to_fact_packet()
                    fact_packet.update({
                        "attacker_name": payload.attacker_id,
                        "weapon_name": payload.action_name or "weapon",
                        "is_player": True
                    })
                    
                    # Chronos Narrative Stream
                    await stream_narrative(websocket, fact_packet)

                    # System Log
                    log_msg = f"You attack {payload.target_id}: {'HIT' if result.hit else 'MISS'} ({result.damage_total} dmg)"
                    await manager.send_event(websocket, LogEvent(
                        type="LOG", message=log_msg, level="info"
                    ).model_dump(mode='json'))

                    await manager.send_event(websocket, StatePatchEvent(
                        type="STATE_PATCH",
                        patches=[
                            {"op": "replace", "path": f"/targets/{payload.target_id}/hp", "value": result.target_remaining_hp},
                            {"op": "replace", "path": f"/targets/{payload.target_id}/status", "value": result.target_status},
                        ],
                        fact_packet=fact_packet
                    ).model_dump(mode='json'))

                    # Auto-advance: process monster turns until player's next turn
                    await _run_combat_loop(websocket, advance_first=True)

                elif action_type == "monster_attack":
                    payload = MonsterAttackAction(**data)
                    
                    attacker = next((c for c in tracker.combatants if c.id == payload.attacker_id), None)
                    target = next((c for c in tracker.combatants if c.id == payload.target_id), None)
                    
                    if not attacker or not attacker.actions:
                        print(f"Monster {payload.attacker_id} cannot attack")
                        continue
                    assert attacker is not None  # narrowing for type checker

                    if not target:
                        print(f"Monster target {payload.target_id} not found")
                        continue

                    # Check Conditions
                    disabling_conditions = {"Surprised", "Unconscious", "Paralyzed", "Petrified", "Stunned", "Incapacitated"}
                    active_disablers = [c for c in attacker.conditions if c.condition_id in disabling_conditions]
                    if active_disablers:
                            await manager.send_event(websocket, LogEvent(
                            type="LOG", message=f"{attacker.name} is {active_disablers[0].condition_id} and cannot act!", level="warning"
                        ).model_dump(mode='json'))
                            continue

                    try:
                        monster_action = attacker.actions[payload.action_index]
                    except IndexError:
                        print(f"Invalid action index {payload.action_index}")
                        continue

                    result = resolve_attack(
                        attacker_id=payload.attacker_id,
                        target_id=payload.target_id,
                        attack_bonus=monster_action.get("attack_bonus", 0),
                        target_ac=target.ac, # Server-side AC
                        damage_dice_sides=monster_action.get("damage_dice_sides", 6),
                        damage_dice_count=monster_action.get("damage_dice_count", 1),
                        damage_modifier=monster_action.get("damage_modifier", 0),
                        damage_type=monster_action.get("damage_type", "slashing"),
                        target_current_hp=target.hp_current, # Server-side HP
                    )

                    async with tracker_lock:
                        target.hp_current = result.target_remaining_hp
                        if result.target_status == "dead":
                            target.is_active = False

                    fact_packet = result.to_fact_packet()
                    fact_packet.update({
                        "attacker_name": attacker.name if attacker else "Monster",
                        "action_name": monster_action.get("name", "attack"),
                        "is_player": False
                    })
                    await stream_narrative(websocket, fact_packet)

                    # System Log
                    assert attacker is not None
                    log_msg = f"{attacker.name} attacks YOU: {'HIT' if result.hit else 'MISS'} ({result.damage_total} dmg)"
                    await manager.send_event(websocket, LogEvent(
                        type="LOG", message=log_msg, level="warning"
                    ).model_dump(mode='json'))

                    await manager.send_event(websocket, StatePatchEvent(
                        type="STATE_PATCH",
                        patches=[
                             {"op": "replace", "path": f"/targets/{payload.target_id}/hp", "value": result.target_remaining_hp},
                        ],
                        fact_packet=fact_packet
                    ).model_dump(mode='json'))

                elif action_type == "get_spells":
                    payload = GetSpellsAction(**data)
                    # Send full spell registry for now (everyone knows everything in v1)
                    # But we target the character_id requested
                    spells_list = get_all_spells()
                    spell_data_list = [
                        SpellData(
                            id=s.id, name=s.name, level=s.level, school=s.school,
                            casting_time=s.casting_time, range=s.range, components=s.components,
                            duration=s.duration, description=s.description,
                            is_attack=s.is_attack, is_save=s.is_save, save_stat=s.save_stat,
                            damage_dice_sides=s.damage_dice_sides, damage_dice_count=s.damage_dice_count,
                            damage_type=s.damage_type, aoe_radius=s.aoe_radius,
                            name_es=s.name_es, description_es=s.description_es
                        ) for s in spells_list
                    ]
                    
                    await manager.send_event(websocket, SpellBookUpdateEvent(
                        type="SPELL_BOOK_UPDATE",
                        character_id=payload.character_id,
                        spells=spell_data_list
                    ).model_dump(mode='json'))

                elif action_type == "cast_spell":
                    payload = CastSpellAction(**data)

                    # 1. Fetch Attacker from Tracker
                    attacker = next((c for c in tracker.combatants if c.id == payload.attacker_id), None)
                    if attacker:
                        disabling_conditions = {"Surprised", "Unconscious", "Paralyzed", "Petrified", "Stunned", "Incapacitated"}
                        active_disablers = [c for c in attacker.conditions if c.condition_id in disabling_conditions]
                        if active_disablers:
                             await manager.send_event(websocket, LogEvent(
                                type="LOG", message=f"Cannot cast spell: You are {active_disablers[0].condition_id}!", level="warning"
                            ).model_dump(mode='json'))
                             continue
                    
                    # 2. Registry Lookup (MANDATORY § STRIDE-T1)
                    spell_def = get_spell(payload.spell_id)
                    if not spell_def:
                        await manager.send_event(websocket, LogEvent(
                            type="LOG", message=f"Spell {payload.spell_id} not found in registry!", level="error"
                        ).model_dump(mode='json'))
                        continue

                    # 2b. Concentration Check (§ Iron Law I — Code is Law)
                    requires_concentration = "Concentration" in (spell_def.duration or "")
                    async with tracker_lock:
                        validate_concentration(payload.attacker_id, tracker, requires_concentration)

                    # 3. Resolve Spell Stats from Registry
                    sides = spell_def.damage_dice_sides
                    count = spell_def.damage_dice_count
                    dmg_type = spell_def.damage_type
                    save_stat = spell_def.save_stat
                    is_save = spell_def.is_save
                    save_dc = 10 + (attacker.int_mod if attacker else 0) # Basic DC logic
                    atk_bonus = 5 + (attacker.int_mod if attacker else 0) # Basic Atk logic
                    half_dmg = True # Standard

                    results = []

                    is_aoe = payload.target_ids and len(payload.target_ids) > 0
                    
                    if is_aoe:
                         # AOE Resolution
                        targets_hp = {}
                        targets_save = {}
                        for tid in payload.target_ids:
                            t = next((c for c in tracker.combatants if c.id == tid), None)
                            if t:
                                targets_hp[tid] = t.hp_current
                                # Simplified save bonus for now
                                if save_stat == "dex":
                                    targets_save[tid] = t.dex_mod
                                elif save_stat == "con":
                                    targets_save[tid] = t.con_mod
                                elif save_stat == "int":
                                    targets_save[tid] = t.int_mod
                                elif save_stat == "wis":
                                    targets_save[tid] = t.wis_mod
                                elif save_stat == "cha":
                                    targets_save[tid] = t.cha_mod
                                else:
                                    targets_save[tid] = 0 # Default if stat not found
                            else:
                                # If target not in combat, assume 0 HP and 0 save bonus
                                targets_hp[tid] = 0
                                targets_save[tid] = 0

                        results = resolve_aoe_spell(
                            attacker_id=payload.attacker_id,
                            target_ids=payload.target_ids,
                            save_dc=save_dc,
                            save_stat=save_stat,
                            damage_dice_sides=sides,
                            damage_dice_count=count,
                            damage_modifier=0, # Damage modifier is usually 0 for spells unless specified
                            damage_type=dmg_type,
                            targets_current_hp=targets_hp,
                            targets_save_bonuses=targets_save
                        )
                    else:
                        # Single Target Resolution (Legacy/Specific)
                        target_id = payload.target_id or "enemy"
                        t = next((c for c in tracker.combatants if c.id == target_id), None)
                        if not t:
                            print(f"Spell target {target_id} not found in combat tracker.")
                            await manager.send_event(websocket, LogEvent(
                                type="LOG", message=f"Spell target {target_id} not found!", level="error"
                            ).model_dump(mode='json'))
                            continue

                        if is_save:
                            # Simplified save bonus for now
                            target_save_bonus = 0
                            if save_stat == "dex":
                                target_save_bonus = t.dex_mod
                            elif save_stat == "con":
                                target_save_bonus = t.con_mod
                            elif save_stat == "int":
                                target_save_bonus = t.int_mod
                            elif save_stat == "wis":
                                target_save_bonus = t.wis_mod
                            elif save_stat == "cha":
                                target_save_bonus = t.cha_mod

                            res = resolve_saving_throw(
                                attacker_id=payload.attacker_id,
                                target_id=target_id,
                                save_dc=save_dc,
                                save_stat=save_stat,
                                target_save_bonus=target_save_bonus,
                                damage_dice_sides=sides,
                                damage_dice_count=count,
                                damage_modifier=0, # Damage modifier is usually 0 for spells unless specified
                                damage_type=dmg_type,
                                target_current_hp=t.hp_current,
                                half_damage_on_success=half_dmg
                            )
                        else:
                            res = resolve_attack(
                                attacker_id=payload.attacker_id,
                                target_id=target_id,
                                attack_bonus=atk_bonus,
                                target_ac=t.ac,
                                damage_dice_sides=sides,
                                damage_dice_count=count,
                                damage_modifier=0, # Damage modifier is usually 0 for spells unless specified
                                damage_type=dmg_type,
                                target_current_hp=t.hp_current,
                            )
                        results = [res]

                    # Apply damage to tracker (Iron Law §2 — State is Truth)
                    async with tracker_lock:
                        for res in results:
                            cbt = next((c for c in tracker.combatants if c.id == res.target_id), None)
                            if cbt:
                                cbt.hp_current = res.target_remaining_hp
                                if res.target_status == "dead":
                                    cbt.is_active = False

                    # --- Events & Narrative ---

                    # 1. State Patches & Condition Application
                    patches = []
                    for res in results:
                        # Update HP/Status
                        patches.append({"op": "replace", "path": f"/targets/{res.target_id}/hp", "value": res.target_remaining_hp})
                        patches.append({"op": "replace", "path": f"/targets/{res.target_id}/status", "value": res.target_status})
                        
                        # Apply Condition if present and save failed (or hit)
                        # Logic: If it's a save-based spell, failure = condition.
                        # If it's an attack-based spell, hit = condition.
                        should_apply_condition = False
                        if payload.condition:
                            if payload.is_save or is_aoe:
                                if not res.save_success:
                                    should_apply_condition = True
                            else:
                                if res.hit:
                                    should_apply_condition = True
                        
                        if should_apply_condition and payload.condition:
                            tracker.add_condition(res.target_id, payload.condition)
                            # Patch the conditions list for the frontend
                            # Get current conditions from tracker
                            combatant = next((c for c in tracker.combatants if c.id == res.target_id), None)
                            current_conditions = [cond.condition_id for cond in combatant.conditions] if combatant else [payload.condition]
                            
                            patches.append({
                                "op": "replace",
                                "path": f"/targets/{res.target_id}/conditions",
                                "value": current_conditions
                            })


                    # 2. Fact Packet Construction
                    # We send a "primary" fact packet for narrative.
                    # For AOE, we might want to summarize.
                    primary_res = results[0] if results else None
                    fact_packet = {}
                    if primary_res:
                        fact_packet = primary_res.to_fact_packet()
                    
                    fact_packet.update({
                        "action_type": "spell_cast",
                        "spell_name": payload.spell_id,
                        "is_save": payload.is_save or is_aoe,
                        "save_stat": payload.save_stat,
                        "targets_count": len(results),
                        "total_hits": sum(1 for r in results if r.hit), # logic varies for saves
                        "total_damage_dealt": sum(r.damage_total for r in results)
                    })

                    # 3. Narrative Streaming
                    await stream_narrative(websocket, fact_packet)

                    # 4. State Patch Event
                    await manager.send_event(websocket, StatePatchEvent(
                        type="STATE_PATCH",
                        patches=patches,
                        fact_packet=fact_packet
                    ).model_dump(mode='json'))

                    # 5. Log Event
                    msg = ""
                    if is_aoe:
                        avg_dmg = sum(r.damage_total for r in results)
                        msg = f"Cast {payload.spell_id} on {len(results)} targets. {avg_dmg} total damage."
                    else:
                        r = results[0]
                        msg = f"Cast {payload.spell_id} on {r.target_id}: {'HIT' if r.hit else 'MISS'} ({r.damage_total} dmg)"
                        
                    await manager.send_event(websocket, LogEvent(
                        type="LOG", message=msg, level="info"
                    ).model_dump(mode='json'))

                    # Mark caster as Concentrating if spell requires it
                    if requires_concentration:
                        async with tracker_lock:
                            tracker.add_condition(payload.attacker_id, "Concentrating")

                    # Auto-resolve monster turns
                    await _run_combat_loop(websocket, advance_first=True)

                elif action_type == "roll_initiative":
                    payload = RollInitiativeAction(**data)
                    
                    # Logic core resolution
                    name = payload.name
                    hp_max = 10
                    ac = 10
                    actions = []
                    dex = payload.dex_modifier

                    if (payload.combatant_id.startswith("monster_") or not payload.is_player):
                         try:
                            stats = get_monster_stats(payload.combatant_id)
                            name = stats.get("name", name)
                            hp_max = stats.get("hp_max", 10)
                            ac = stats.get("ac", 10)
                            actions = stats.get("actions", [])
                            dex = stats.get("dex_modifier", dex)
                         except Exception:
                             pass

                    async with tracker_lock:
                        tracker.add_combatant(payload.combatant_id, name, dex, payload.is_player, hp_max, ac, actions)
                        combatant = next(c for c in tracker.combatants if c.id == payload.combatant_id)
                        init_val = tracker.roll_initiative(combatant)
                    
                    # Narrative with Chronos
                    fact_packet = {
                        "action_type": "initiative", 
                        "actor": name, 
                        "total": init_val,
                        "combatant_id": payload.combatant_id,
                        "is_player": payload.is_player
                    }
                    chunk_index = 0
                    async for text_chunk in chronos.generate_narrative(fact_packet):
                        await manager.send_event(websocket, NarrativeChunkEvent(
                            type="NARRATIVE_CHUNK", content=text_chunk, index=chunk_index, done=False
                        ).model_dump(mode='json'))
                        chunk_index += 1
                    
                    await manager.send_event(websocket, NarrativeChunkEvent(
                        type="NARRATIVE_CHUNK", content="", index=chunk_index, done=True
                    ).model_dump(mode='json'))
                    
                    await manager.send_event(websocket, InitiativeUpdateEvent(
                        type="INITIATIVE_UPDATE",
                        combatants=build_combatant_states()
                    ).model_dump(mode='json'))

                elif action_type == "start_combat":
                    payload = StartCombatAction(**data)
                    async with tracker_lock:
                        tracker.start_encounter()
                    current = tracker.get_current_actor()
                    
                    fact_packet = {
                        "action_type": "start_combat", 
                        "current_actor": current.name if current else "Unknown",
                        "combatant_count": len(tracker.combatants)
                    }
                    chunk_index = 0
                    async for text_chunk in chronos.generate_narrative(fact_packet):
                        await manager.send_event(websocket, NarrativeChunkEvent(
                            type="NARRATIVE_CHUNK", content=text_chunk, index=chunk_index, done=False
                        ).model_dump(mode='json'))
                        chunk_index += 1
                    
                    await manager.send_event(websocket, NarrativeChunkEvent(
                        type="NARRATIVE_CHUNK", content="", index=chunk_index, done=True
                    ).model_dump(mode='json'))
                    
                    await manager.send_event(websocket, InitiativeUpdateEvent(
                        type="INITIATIVE_UPDATE",
                        combatants=build_combatant_states()
                    ).model_dump(mode='json'))

                elif action_type == "next_turn":
                    payload = NextTurnAction(**data)
                    async with tracker_lock:
                        current = tracker.next_turn()
                    
                    fact_packet = {"action_type": "next_turn", "current_actor": current.name if current else "Unknown"}
                    chunk_index = 0
                    async for text_chunk in chronos.generate_narrative(fact_packet):
                        await manager.send_event(websocket, NarrativeChunkEvent(
                            type="NARRATIVE_CHUNK", content=text_chunk, index=chunk_index, done=False
                        ).model_dump(mode='json'))
                        chunk_index += 1
                    
                    await manager.send_event(websocket, NarrativeChunkEvent(
                        type="NARRATIVE_CHUNK", content="", index=chunk_index, done=True
                    ).model_dump(mode='json'))
                     
                    await manager.send_event(websocket, InitiativeUpdateEvent(
                        type="INITIATIVE_UPDATE",
                        combatants=build_combatant_states()
                    ).model_dump(mode='json'))

                elif action_type == "roll":
                    payload = RollAction(**data)
                    result = roll(payload.sides, payload.count, payload.modifier)
                    
                    await manager.send_event(websocket, DiceResultEvent(
                        type="DICE_RESULT",
                        notation=result.notation,
                        rolls=list(result.rolls),
                        total=result.total
                    ).model_dump(mode='json'))

                elif action_type == "close_widget":
                    payload = CloseWidgetAction(**data)
                    async with tracker_lock:
                        if hasattr(tracker, "active_widgets") and payload.widget_id in tracker.active_widgets:
                            tracker.active_widgets.remove(payload.widget_id)
                    await manager.send_event(websocket, AckEvent(
                        type="ACK", status="ok", message=f"Widget {payload.widget_id} closed."
                    ).model_dump(mode='json'))

                elif action_type == "narrative_action":
                    # Frontend sends `type` key, not `action` — extract content directly
                    content = data.get("content", "").strip()
                    if not content:
                        await manager.send_event(websocket, AckEvent(
                            type="ACK", status="error", message="No content provided."
                        ).model_dump(mode='json'))
                        continue
                    player = next((c for c in tracker.combatants if c.is_player), None)
                    fact_packet = {
                        "action_type": "narrative_action",
                        "player_input": content,
                        "player_name": player.name if player else "Adventurer",
                        "location": combatant_positions.get(player.id if player else "", "Unknown"),
                        "hp_current": player.hp_current if player else None,
                        "hp_max": player.hp_max if player else None,
                    }
                    await stream_narrative(websocket, fact_packet)

                elif action_type == "narrative_action":
                    payload = NarrativeActionAction(**data)
                    fact_packet = {
                        "action_type": "narrative_action",
                        "player_intent": payload.content,
                    }
                    await stream_narrative(websocket, fact_packet)

                elif action_type == "list_saves":
                    saves = list_saves()
                    await manager.send_event(websocket, {"type": "SAVE_LIST", "saves": saves})

                elif action_type == "get_shop":
                    payload = GetShopAction(**data)
                    node = get_node(payload.node_id)
                    if not node:
                        await manager.send_event(websocket, AckEvent(
                            type="ACK", status="error", message=f"Unknown node: {payload.node_id}"
                        ).model_dump(mode='json'))
                        continue

                    if not treasurer.has_shop(node.type):
                        await manager.send_event(websocket, ShopInventoryEvent(
                            type="SHOP_INVENTORY",
                            node_id=node.id,
                            node_type=node.type,
                            has_shop=False,
                            items=[],
                        ).model_dump(mode='json'))
                        continue

                    world_rep = cartographer.memory.lore.get("world_state", {}).get("reputation", 0)
                    rarities = treasurer.get_shop_rarities(node.type)
                    shop_items = [
                        ShopItemModel(
                            rarity=r,
                            buy_price=treasurer.buy_price(r, world_rep),
                        )
                        for r in rarities
                    ]
                    await manager.send_event(websocket, ShopInventoryEvent(
                        type="SHOP_INVENTORY",
                        node_id=node.id,
                        node_type=node.type,
                        has_shop=True,
                        items=shop_items,
                    ).model_dump(mode='json'))

                else:
                    print(f"Unknown action: {action_type}")
                    await manager.send_event(websocket, AckEvent(
                        type="ACK", status="error", message=f"Unknown action: {action_type}"
                    ).model_dump(mode='json'))

            except ValidationError as e:
                print(f"Validation Error: {e}")
                await manager.send_event(websocket, AckEvent(
                    type="ACK", status="error", message="Invalid action data."
                ).model_dump(mode='json'))

            except Exception as e:
                print(f"Unexpected Error: {e}")
                traceback.print_exc()
                # Sanitize error for client (§ STRIDE-I1)
                await manager.send_event(websocket, AckEvent(
                    type="ACK", status="error", message="A server error occurred."
                ).model_dump(mode='json'))

    except WebSocketDisconnect:
        manager.disconnect(websocket)
