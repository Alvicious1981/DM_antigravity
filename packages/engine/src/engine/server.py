"""
Dungeon Cortex — FastAPI Server Bootstrap (§3.1)
HTTP + WebSocket server for the AG-UI protocol.
"""

import json
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .combat import resolve_attack, resolve_saving_throw, AttackResult
from .dice import roll, d20
from .db import get_db, close_db
from .initiative import InitiativeTracker
from .srd_queries import get_srd_mechanic, get_spell_mechanics, get_weapon_stats, get_monster_stats
from .inventory import get_inventory, generate_loot, create_inventory_item, equip_item, unequip_item

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle: startup and shutdown hooks."""
    db = get_db()
    count = db.execute("SELECT COUNT(*) FROM srd_mechanic").fetchone()[0]
    print(f"🎲 Dungeon Cortex Engine starting... ({count} SRD mechanics loaded)")
    yield
    close_db()
    print("🎲 Dungeon Cortex Engine shutting down.")


app = FastAPI(
    title="Dungeon Cortex Engine",
    description="The deterministic heart of the D&D 5e Simulated Reality Engine",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — allow the Next.js frontend in development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Initiative Tracker (single session for now)
tracker = InitiativeTracker()


# --- REST Endpoints ---

@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "name": "Dungeon Cortex Engine",
        "version": "0.1.0",
        "status": "operational",
        "laws": [
            "Code is Law",
            "State is Truth",
            "Diegetic UI",
        ],
    }


@app.get("/api/health")
async def health_check():
    """Detailed health status for monitoring."""
    db = get_db()
    db_ok = False
    srd_count = 0
    try:
        srd_count = db.execute("SELECT COUNT(*) FROM srd_mechanic").fetchone()[0]
        db_ok = True
    except Exception:
        pass

    return {
        "status": "healthy",
        "engine": True,
        "database": db_ok,
        "srd_mechanics_count": srd_count,
        "agents": {
            "logic_core": False,
            "chronos": False,
            "visual_vault": False,
        },
    }


# --- SRD Query Endpoints (§5) ---

@app.get("/api/srd/{mechanic_id}")
async def get_srd_mechanic_endpoint(mechanic_id: str, lang: str = "en"):
    """
    Fetch a single SRD mechanic by ID.
    Second Law: State is Truth — this IS the canonical game data.
    """
    try:
        data = get_srd_mechanic(mechanic_id, lang)
        mechanic_type = data.get("index", mechanic_id) # Approximation if type missing in minimal parsing
        return {
            "id": mechanic_id,
            "data": data,
        }
    except Exception as e:
        # Fallback for manual query if helper fails or returns incomplete
        db = get_db()
        row = db.execute(
            "SELECT id, type, data_json, data_es FROM srd_mechanic WHERE id = ?",
            (mechanic_id,)
        ).fetchone()

        if not row:
            raise HTTPException(status_code=404, detail=f"Mechanic '{mechanic_id}' not found")

        data = json.loads(row["data_es"] if lang == "es" else row["data_json"])
        return {
            "id": row["id"],
            "type": row["type"],
            "data": data,
        }


@app.get("/api/srd/type/{mechanic_type}")
async def list_srd_by_type(mechanic_type: str, lang: str = "en", limit: int = 50, offset: int = 0):
    """
    List SRD mechanics by type (spell, monster, equipment, etc).
    """
    db = get_db()
    rows = db.execute(
        "SELECT id, data_json, data_es FROM srd_mechanic WHERE type = ? LIMIT ? OFFSET ?",
        (mechanic_type, limit, offset)
    ).fetchall()

    total = db.execute(
        "SELECT COUNT(*) FROM srd_mechanic WHERE type = ?",
        (mechanic_type,)
    ).fetchone()[0]

    items = []
    for row in rows:
        data_str = row["data_es"] if lang == "es" else row["data_json"]
        if not data_str:
             data_str = row["data_json"] # Fallback

        data = json.loads(data_str)
        items.append({
            "id": row["id"],
            "name": data.get("name", "Unknown"),
            "index": data.get("index", ""),
        })

    return {
        "type": mechanic_type,
        "total": total,
        "items": items,
    }


# --- Combat Simulation Endpoint ---

@app.post("/api/combat/attack")
async def simulate_attack(payload: dict):
    """
    Execute a deterministic attack roll.
    First Law: Code is Law — no narrative without mechanics.
    """
    result = resolve_attack(
        attacker_id=payload.get("attacker_id", "player"),
        target_id=payload.get("target_id", "enemy"),
        attack_bonus=payload.get("attack_bonus", 0),
        target_ac=payload.get("target_ac", 10),
        damage_dice_sides=payload.get("damage_dice_sides", 6),
        damage_dice_count=payload.get("damage_dice_count", 1),
        damage_modifier=payload.get("damage_modifier", 0),
        damage_type=payload.get("damage_type", "bludgeoning"),
        target_current_hp=payload.get("target_current_hp", 20),
        advantage=payload.get("advantage", False),
        disadvantage=payload.get("disadvantage", False),
    )
    return result.to_fact_packet()


@app.post("/api/combat/save")
async def simulate_save(payload: dict):
    """
    Execute a deterministic saving throw.
    """
    result = resolve_saving_throw(
        attacker_id=payload.get("attacker_id", "wizard"),
        target_id=payload.get("target_id", "goblin"),
        save_dc=payload.get("save_dc", 13),
        save_stat=payload.get("save_stat", "dex"),
        target_save_bonus=payload.get("target_save_bonus", 2),
        damage_dice_sides=payload.get("damage_dice_sides", 6),
        damage_dice_count=payload.get("damage_dice_count", 8),
        damage_modifier=payload.get("damage_modifier", 0),
        damage_type=payload.get("damage_type", "fire"),
        target_current_hp=payload.get("target_current_hp", 20),
        advantage=payload.get("advantage", False),
        disadvantage=payload.get("disadvantage", False),
        half_damage_on_success=payload.get("half_damage_on_success", True),
    )
    return result.to_fact_packet()


# --- WebSocket (AG-UI Protocol §6) ---

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


@app.websocket("/ws/game/{session_id}")
async def game_websocket(websocket: WebSocket, session_id: str):
    """
    AG-UI WebSocket endpoint (§6).
    Handles bidirectional streaming of:
      - NARRATIVE_CHUNK events (text streaming)
      - STATE_PATCH events (JSON Patch RFC 6902)
      - SHOW_WIDGET events (interactive UI injection)
    """
    await manager.connect(websocket)
    try:
        # Send initial connection confirmation
        await manager.send_event(websocket, {
            "type": "CONNECTION_ESTABLISHED",
            "session_id": session_id,
            "message": "Connected to Dungeon Cortex Engine",
        })

        while True:
            data = await websocket.receive_json()
            action = data.get("action")

            if action == "get_inventory":
                char_id = data.get("character_id", "player") 
                # For Phase 3f simplification, assuming "player" -> some UUID or just string "player"
                # If DB expects UUID, we might need to handle that. 
                # init_db.py created tables with UUID primary keys.
                # But for dev, we might be using strings if not enforced by SQLite strict types?
                # SQLModel uses strict types.
                # Let's assume character_id is passed correctly or we handle it.
                
                items = get_inventory(char_id)
                await manager.send_event(websocket, {
                    "type": "INVENTORY_UPDATE",
                    "character_id": char_id,
                    "items": items
                })
                continue

            if action == "generate_loot":
                # Debug/Admin action
                cr = data.get("cr", 1)
                loot_ids = generate_loot(cr)
                char_id = data.get("character_id", "player")
                
                new_items = []
                for template_id in loot_ids:
                    item = create_inventory_item(char_id, template_id)
                    new_items.append(item)
                
                # Send update immediately
                all_items = get_inventory(char_id)
                await manager.send_event(websocket, {
                    "type": "INVENTORY_UPDATE",
                    "character_id": char_id,
                    "items": all_items
                })
                
                # Narrative
                await manager.send_event(websocket, {
                    "type": "NARRATIVE_CHUNK",
                    "content": f"🎁 Loot Generated: {len(new_items)} items found!",
                    "index": 0,
                    "done": True
                })
                continue

                continue

            if action == "equip_item":
                char_id = data.get("character_id", "player")
                item_id = data.get("item_id")
                slot = data.get("slot", "main_hand")
                
                try:
                    equip_item(char_id, item_id, slot)
                    # Send update
                    items = get_inventory(char_id)
                    await manager.send_event(websocket, {
                        "type": "INVENTORY_UPDATE",
                        "character_id": char_id,
                        "items": items
                    })
                except Exception as e:
                    print(f"Equip error: {e}")
                    
                continue

            if action == "unequip_item":
                char_id = data.get("character_id", "player")
                item_id = data.get("item_id")
                
                try:
                    unequip_item(char_id, item_id)
                    # Send update
                    items = get_inventory(char_id)
                    await manager.send_event(websocket, {
                        "type": "INVENTORY_UPDATE",
                        "character_id": char_id,
                        "items": items
                    })
                except Exception as e:
                    print(f"Unequip error: {e}")
                    
                continue

            if action == "attack":
                # Resolve attack (PC vs NPC or NPC vs PC)
                attacker_id = data.get("attacker_id", "player")
                action_name = data.get("action_name")
                
                # Default params from payload
                atk_bonus = data.get("attack_bonus", 0)
                sides = data.get("damage_dice_sides", 6)
                count = data.get("damage_dice_count", 1)
                dmg_modifier = data.get("damage_modifier", 0)
                dmg_type = data.get("damage_type", "bludgeoning")
                
                # Weapon Lookup (Ag-UI §5.2)
                weapon_id = data.get("weapon_id")
                if weapon_id:
                    try:
                        w_stats = get_weapon_stats(weapon_id)
                        sides = w_stats.get("damage_dice_sides", sides)
                        count = w_stats.get("damage_dice_count", count)
                        dmg_type = w_stats.get("damage_type", dmg_type)
                    except Exception as e:
                        print(f"Error fetching weapon {weapon_id}: {e}")
                
                # Monster Action Lookup
                if action_name:
                    # Find attacker in tracker
                    attacker = next((c for c in tracker.combatants if c.id == attacker_id), None)
                    if attacker and attacker.actions:
                        # Find action by name
                        act = next((a for a in attacker.actions if a["name"] == action_name), None)
                        if act:
                            atk_bonus = act.get("attack_bonus", atk_bonus)
                            count = act.get("damage_dice_count", count)
                            sides = act.get("damage_dice_sides", sides)
                            dmg_modifier = act.get("damage_modifier", dmg_modifier)
                            dmg_type = act.get("damage_type", dmg_type)

                # Route to combat engine
                result = resolve_attack(
                    attacker_id=attacker_id,
                    target_id=data.get("target_id", "enemy"),
                    attack_bonus=atk_bonus,
                    target_ac=data.get("target_ac", 10),
                    damage_dice_sides=sides,
                    damage_dice_count=count,
                    damage_modifier=dmg_modifier,
                    damage_type=dmg_type,
                    target_current_hp=data.get("target_current_hp", 20),
                )

                # Stream narrative chunks with typewriter effect
                fact_packet = result.to_fact_packet()
                if result.hit:
                    narrative = f"⚔️ ¡Impacto! Tu ataque golpea con un {result.roll_natural} natural (+{atk_bonus} = {result.roll_total} vs AC {result.ac_target}). Infliges {result.damage_total} puntos de daño {result.damage_type}."
                else:
                    narrative = f"🛡️ ¡Fallo! Tu ataque con un {result.roll_natural} natural (+{atk_bonus} = {result.roll_total}) no supera la AC {result.ac_target}."

                # NARRATIVE_CHUNK — typewriter streaming
                for i, char in enumerate(narrative):
                    await manager.send_event(websocket, {
                        "type": "NARRATIVE_CHUNK",
                        "content": char,
                        "index": i,
                        "done": i == len(narrative) - 1,
                    })
                    await asyncio.sleep(0.02)  # 20ms per character

                # STATE_PATCH — update game state
                await manager.send_event(websocket, {
                    "type": "STATE_PATCH",
                    "patches": [
                        {"op": "replace", "path": f"/targets/{data.get('target_id', 'enemy')}/hp", "value": result.target_remaining_hp},
                        {"op": "replace", "path": f"/targets/{data.get('target_id', 'enemy')}/status", "value": result.target_status},
                    ],
                    "fact_packet": fact_packet,
                })


            elif action == "cast_spell":
                # Resolve spell attack or saving throw
                spell_id = data.get("spell_id") # e.g. "spell_fireball"
                
                # 1. Fetch baseline mechanics from SRD
                mechanics = {}
                if spell_id:
                    try:
                        mechanics = get_spell_mechanics(spell_id)
                    except Exception as e:
                        print(f"Error fetching spell mechanics for {spell_id}: {e}")

                # 2. Merge with frontend payload (Frontend Overrides > SRD)
                # This allow upcasting or custom modifications
                is_save = data.get("is_save", mechanics.get("save_stat") is not None)
                save_stat = data.get("save_stat", mechanics.get("save_stat", "dex"))
                save_dc = data.get("save_dc", 13) # DC is usually calculated by caster stats, so frontend should provide it
                
                damage_dice_sides = data.get("damage_dice_sides", mechanics.get("damage_dice_sides", 6))
                damage_dice_count = data.get("damage_dice_count", mechanics.get("damage_dice_count", 0))
                damage_type = data.get("damage_type", mechanics.get("damage_type", "fire"))

                if is_save:
                    result = resolve_saving_throw(
                        attacker_id=data.get("attacker_id", "player"),
                        target_id=data.get("target_id", "enemy"),
                        save_dc=save_dc,
                        save_stat=save_stat,
                        target_save_bonus=data.get("target_save_bonus", 0),
                        damage_dice_sides=damage_dice_sides,
                        damage_dice_count=damage_dice_count,
                        damage_modifier=data.get("damage_modifier", 0),
                        damage_type=damage_type,
                        target_current_hp=data.get("target_current_hp", 20),
                        half_damage_on_success=data.get("half_damage_on_success", True)
                    )
                    narrative = f"🔮 {data.get('attacker_id')} lanza {mechanics.get('name', 'un hechizo')}. {data.get('target_id')} resiste con {save_stat.upper()} (CD {save_dc})... {'¡Éxito!' if result.save_success else '¡Fallo!'} Daño: {result.damage_total} ({damage_type})."
                else:
                    # Spell Attack
                    result = resolve_attack(
                        attacker_id=data.get("attacker_id", "player"),
                        target_id=data.get("target_id", "enemy"),
                        attack_bonus=data.get("attack_bonus", 5),
                        target_ac=data.get("target_ac", 10),
                        damage_dice_sides=data.get("damage_dice_sides", 10),
                        damage_dice_count=data.get("damage_dice_count", 1),
                        damage_modifier=data.get("damage_modifier", 0),
                        damage_type=data.get("damage_type", "fire"),
                        target_current_hp=data.get("target_current_hp", 20),
                    )
                    if result.hit:
                        narrative = f"🔥 ¡Impacto de hechizo! ({result.roll_total} vs AC {result.ac_target}). Daño: {result.damage_total} ({result.damage_type})."
                    else:
                        narrative = f"💨 El hechizo falla ({result.roll_total} vs AC {result.ac_target})."

                # Stream narrative
                for i, char in enumerate(narrative):
                    await manager.send_event(websocket, {
                        "type": "NARRATIVE_CHUNK",
                        "content": char,
                        "index": i,
                        "done": i == len(narrative) - 1,
                    })
                    await asyncio.sleep(0.02)

                # State patch
                await manager.send_event(websocket, {
                    "type": "STATE_PATCH",
                    "patches": [
                        {"op": "replace", "path": f"/targets/{data.get('target_id', 'enemy')}/hp", "value": result.target_remaining_hp},
                        {"op": "replace", "path": f"/targets/{data.get('target_id', 'enemy')}/status", "value": result.target_status},
                    ],
                    "fact_packet": result.to_fact_packet(),
                })

            elif action == "roll_initiative":
                cid = data.get("combatant_id", "player")
                name = data.get("name", "Player")
                dex = data.get("dex_modifier", 0)
                is_pc = data.get("is_player", False)
                
                # Monster Auto-Load
                hp_max = 10
                ac = 10
                actions = []
                
                if cid.startswith("monster_") or not is_pc:
                    try:
                        stats = get_monster_stats(cid)
                        name = stats.get("name", name)
                        hp_max = stats.get("hp_max", 10)
                        ac = stats.get("ac", 10)
                        actions = stats.get("actions", [])
                        dex = stats.get("dex_modifier", dex)
                    except Exception as e:
                        print(f"Error fetching monster stats for {cid}: {e}")

                tracker.add_combatant(cid, name, dex, is_pc, hp_max, ac, actions)
                combatant = next(c for c in tracker.combatants if c.id == cid)
                init_val = tracker.roll_initiative(combatant)
                
                narrative = f"🎲 {name} tira Iniciativa: {init_val} (1d20+{dex})."
                
                for i, char in enumerate(narrative):
                    await manager.send_event(websocket, {
                        "type": "NARRATIVE_CHUNK",
                        "content": char,
                        "index": i,
                        "done": i == len(narrative) - 1,
                    })
                    await asyncio.sleep(0.02)
                    
                await manager.send_event(websocket, {
                    "type": "INITIATIVE_UPDATE",
                    "combatants": [
                        {"id": c.id, "name": c.name, "initiative": c.initiative, "active": c.is_active,
                         "hp": c.hp_current, "hp_max": c.hp_max, "ac": c.ac}
                        for c in tracker.combatants
                    ]
                })

            elif action == "start_combat":
                tracker.start_encounter()
                current = tracker.get_current_actor()
                narrative = f"⚔️ ¡El combate comienza! Turno de {current.name}." if current else "No hay combatientes."
                
                await manager.send_event(websocket, {
                    "type": "NARRATIVE_CHUNK",
                    "content": narrative,
                    "index": 0,
                    "done": True,
                })
                await manager.send_event(websocket, {
                    "type": "INITIATIVE_UPDATE",
                    "combatants": [
                        {"id": c.id, "name": c.name, "initiative": c.initiative, "active": c.is_active, "current": c.id == current.id}
                        for c in tracker.combatants
                    ]
                })

            elif action == "next_turn":
                current = tracker.next_turn()
                narrative = f"⏳ Fin de turno. {current.name}, es tu momento."
                
                await manager.send_event(websocket, {
                    "type": "NARRATIVE_CHUNK",
                    "content": narrative,
                    "index": 0,
                    "done": True,
                })
                
                await manager.send_event(websocket, {
                    "type": "INITIATIVE_UPDATE",
                    "combatants": [
                        {"id": c.id, "name": c.name, "initiative": c.initiative, "active": c.is_active, "current": c.id == current.id}
                        for c in tracker.combatants
                    ]
                })

            elif action == "roll":
                # Generic dice roll
                sides = data.get("sides", 20)
                count = data.get("count", 1)
                modifier = data.get("modifier", 0)
                result = roll(sides, count, modifier)
                await manager.send_event(websocket, {
                    "type": "DICE_RESULT",
                    "notation": result.notation,
                    "rolls": list(result.rolls),
                    "total": result.total,
                })

            else:
                await manager.send_event(websocket, {
                    "type": "ACK",
                    "action_id": data.get("action_id"),
                    "message": f"Unknown action: {action}",
                })

    except WebSocketDisconnect:
        manager.disconnect(websocket)
