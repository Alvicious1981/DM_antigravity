from fastapi import APIRouter, HTTPException
from typing import List
import uuid
import json
from dataclasses import asdict
from datetime import datetime

from ..db import get_db
from ..schemas import CharacterCreationRequest, GameSession, SaveInfo, CombatantState
from ..state import tracker, tracker_lock, combatant_positions, load_game as restore_tracker
from ..dice import roll

router = APIRouter(
    prefix="/api/game",
    tags=["game"]
)


def _stat_mod(value: int) -> int:
    return (value - 10) // 2


@router.post("/new", response_model=GameSession)
async def new_game(request: CharacterCreationRequest):
    """
    Create a new game session. Populates the in-memory tracker so the
    WebSocket connection finds the player immediately on connect.
    """
    # 1. Roll stats if not provided
    stats = request.stats
    if not stats:
        stats = {
            "str": roll(6, 3).total,
            "dex": roll(6, 3).total,
            "con": roll(6, 3).total,
            "int": roll(6, 3).total,
            "wis": roll(6, 3).total,
            "cha": roll(6, 3).total,
        }

    base_hp = 10 + _stat_mod(stats["con"])
    ac = 10 + _stat_mod(stats["dex"])
    character_id = str(uuid.uuid4())
    save_id = str(uuid.uuid4())

    # 2. Populate tracker (single-session prototype: reset first)
    async with tracker_lock:
        tracker.combatants.clear()
        tracker.round = 1
        tracker.turn_index = 0
        tracker.has_started = False
        tracker.add_combatant(
            id=character_id,
            name=request.name,
            dex_modifier=_stat_mod(stats["dex"]),
            is_player=True,
            hp_max=base_hp,
            ac=ac,
            str_mod=_stat_mod(stats["str"]),
            con_mod=_stat_mod(stats["con"]),
            int_mod=_stat_mod(stats["int"]),
            wis_mod=_stat_mod(stats["wis"]),
            cha_mod=_stat_mod(stats["cha"]),
        )
        combatant_positions[character_id] = "start_town"

    # 3. Persist — unified format understood by both state.load_game() and /list
    save_data = {
        # Metadata (for /list and session display)
        "save_id": save_id,
        "created_at": datetime.now().isoformat(),
        "character_name": request.name,
        "character_class": request.class_id.replace("class_", "").capitalize(),
        "race_id": request.race_id,
        "level": 1,
        "location": "The Crossroads",
        # Tracker state (for state.load_game())
        "round": tracker.round,
        "turn_index": tracker.turn_index,
        "has_started": tracker.has_started,
        "combatants": [asdict(c) for c in tracker.combatants],
        "positions": dict(combatant_positions),
    }

    db = get_db()
    db.execute(
        "INSERT INTO game_saves (save_id, data_json) VALUES (?, ?)",
        (save_id, json.dumps(save_data))
    )
    db.commit()

    return GameSession(
        save_id=save_id,
        character=CombatantState(
            id=character_id,
            name=request.name,
            hp=base_hp,
            hp_max=base_hp,
            ac=ac,
            initiative=0,
            active=True,
        ),
        location="The Crossroads",
        scene="You stand at the crossroads of destiny...",
    )


@router.get("/list", response_model=List[SaveInfo])
async def list_saves():
    """List all available save games. Handles both old and new save formats."""
    db = get_db()
    rows = db.execute(
        "SELECT save_id, created_at, data_json FROM game_saves ORDER BY created_at DESC"
    ).fetchall()

    saves = []
    for row in rows:
        data = json.loads(row["data_json"])

        # New unified format has top-level keys; old format nested under "character"
        old_char = data.get("character", {})
        saves.append(SaveInfo(
            save_id=row["save_id"],
            created_at=row["created_at"],
            character_name=data.get("character_name") or old_char.get("name", "Unknown"),
            character_class=data.get("character_class") or old_char.get("class_id", "adventurer").replace("class_", "").capitalize(),
            level=data.get("level", 1),
            location=data.get("location", "Unknown Lands"),
        ))
    return saves


@router.post("/load/{save_id}")
async def load_game(save_id: str):
    """
    Load a save. Restores the in-memory tracker so the WebSocket connection
    finds the player immediately after the client calls connect(save_id).
    """
    db = get_db()
    row = db.execute(
        "SELECT data_json FROM game_saves WHERE save_id = ?", (save_id,)
    ).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Save not found")

    data = json.loads(row["data_json"])

    # Restore tracker from the combatants array in the save
    success = restore_tracker(save_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to restore game state")

    # Find the player in the now-restored tracker
    player = next((c for c in tracker.combatants if c.is_player), None)
    if not player:
        raise HTTPException(status_code=500, detail="No player found in save")

    return GameSession(
        save_id=save_id,
        character=CombatantState(
            id=player.id,
            name=player.name,
            hp=player.hp_current,
            hp_max=player.hp_max,
            ac=player.ac,
            initiative=player.initiative,
            active=player.is_active,
        ),
        location=data.get("location", "Unknown Lands"),
        scene=data.get("scene", "Your adventure continues..."),
    )
