from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict
import uuid
import json
import random
from datetime import datetime

from ..db import get_db
from ..schemas import CharacterCreationRequest, GameSession, SaveInfo, CombatantState

router = APIRouter(
    prefix="/api/game",
    tags=["game"]
)

@router.post("/new", response_model=GameSession)
async def new_game(request: CharacterCreationRequest):
    """
    Create a new game session with a generated character.
    """
    # 1. Roll Stats if not provided (3d6 standard)
    stats = request.stats
    if not stats:
        stats = {
            "str": sum([random.randint(1, 6) for _ in range(3)]),
            "dex": sum([random.randint(1, 6) for _ in range(3)]),
            "con": sum([random.randint(1, 6) for _ in range(3)]),
            "int": sum([random.randint(1, 6) for _ in range(3)]),
            "wis": sum([random.randint(1, 6) for _ in range(3)]),
            "cha": sum([random.randint(1, 6) for _ in range(3)]),
        }
    
    # 2. Determine HP/AC based on Class (Simplified for prototype)
    # TODO: Fetch real class data from SRD
    base_hp = 10 + ((stats["con"] - 10) // 2)
    ac = 10 + ((stats["dex"] - 10) // 2)
    
    character_id = str(uuid.uuid4())
    
    # 3. Create Initial State
    state = {
        "save_id": str(uuid.uuid4()),
        "created_at": datetime.now().isoformat(),
        "character": {
            "id": character_id,
            "name": request.name,
            "class_id": request.class_id,
            "background_id": request.background_id,
            "stats": stats,
            "hp": base_hp,
            "hp_max": base_hp,
            "ac": ac,
            "initiative": 0,
            "active": True,
            "conditions": [],
            "resistances": [],
            "immunities": [],
            "inventory": [] # Initial inventory could be added here
        },
        "location": "The Crossroads",
        "scene": "You stand at the crossroads of destiny..."
    }
    
    # 4. Save to DB
    db = get_db()
    db.execute(
        "INSERT INTO game_saves (save_id, data_json) VALUES (?, ?)",
        (state["save_id"], json.dumps(state))
    )
    db.commit()
    
    return GameSession(
        save_id=state["save_id"],
        character=CombatantState(
            id=state["character"]["id"],
            name=state["character"]["name"],
            hp=state["character"]["hp"],
            hp_max=state["character"]["hp_max"],
            ac=state["character"]["ac"],
            initiative=0,
            active=True
        ),
        location=state["location"],
        scene=state["scene"]
    )

@router.get("/list", response_model=List[SaveInfo])
async def list_saves():
    """List all available save games."""
    db = get_db()
    rows = db.execute("SELECT save_id, created_at FROM game_saves ORDER BY created_at DESC").fetchall()
    return [SaveInfo(save_id=row["save_id"], created_at=row["created_at"]) for row in rows]

@router.post("/load/{save_id}")
async def load_game(save_id: str):
    """Load a specific game save."""
    db = get_db()
    row = db.execute("SELECT data_json FROM game_saves WHERE save_id = ?", (save_id,)).fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="Save not found")
        
    data = json.loads(row["data_json"])
    
    # Return full state for client hydration
    return data
