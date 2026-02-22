from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json
import traceback
from pydantic import ValidationError
from ..dice import roll
from ..srd_queries import get_weapon_stats, get_monster_stats, search_monsters, get_spell_mechanics
from ..inventory import get_inventory, generate_loot, create_inventory_item, equip_item, unequip_item, distribute_loot
from ..state import tracker, tracker_lock, save_game, load_game, combatant_positions
from ..schemas import (
    GetInventoryAction, GenerateLootAction, SearchMonstersAction, AddCombatantAction,
    EquipItemAction, UnequipItemAction, AttackAction, MonsterAttackAction, CastSpellAction,
    RollInitiativeAction, StartCombatAction, NextTurnAction, RollAction, GetSpellsAction,
    DistributeLootAction, CloseWidgetAction, MapInteractionAction, SaveGameAction, LoadGameAction,
    ConnectionEstablishedEvent, InventoryUpdateEvent, NarrativeChunkEvent,
    MonsterSearchResultsEvent, InitiativeUpdateEvent, StatePatchEvent, DiceResultEvent, AckEvent,
    InventoryItemModel, CombatantState, LogEvent, SpellBookUpdateEvent, SpellData,
    LootDistributedEvent, MapUpdateEvent, ListSavesAction, MapDataEvent, MapNode,
    NarrativeEvent
)
from ..maps import get_node, get_all_nodes
from ..combat import resolve_attack, resolve_saving_throw, resolve_aoe_spell, AttackResult
from ..spells import get_all_spells, get_spell
from ..ai.chronos import ChronosClient
from ..ai.visual_vault import VisualVaultClient

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


@router.websocket("/ws/game/{session_id}")
async def game_websocket(websocket: WebSocket, session_id: str, role: str = "player", dm_token: str | None = None):
    """
    AG-UI WebSocket endpoint (§6).
    Handles bidirectional streaming of typed Pydantic events.
    Roles: 'player' (default), 'dm' (requires valid dm_token).
    """
    print(f"DEBUG: WS Connection attempt - Session: {session_id}, Role: {role}")
    # Simple DM authentication
    final_role = "player"
    if role == "dm" and dm_token == "AG-DM-2026": # Hardcoded secret for now (§ STRIDE-E1)
        final_role = "dm"
    
    await manager.connect(websocket)
    print(f"DEBUG: WS Connected - Session: {session_id}, Final Role: {final_role}")
    try:
        # Send initial connection confirmation with assigned role
        event = ConnectionEstablishedEvent(
            type="CONNECTION_ESTABLISHED",
            session_id=session_id,
            role=final_role,
            message=f"Connected to Dungeon Cortex Engine as {final_role.upper()}"
        )
        await manager.send_event(websocket, event.model_dump(mode='json'))
