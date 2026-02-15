from .initiative import InitiativeTracker, Combatant
from .db import get_db
import json
from dataclasses import asdict

# Global Initiative Tracker (single session for now)
# Global Initiative Tracker (single session for now)
tracker = InitiativeTracker()

# Track combatant positions: {character_id: cell_id (int) or node_id (str)}
combatant_positions: dict[str, any] = {}

def save_game(save_id: str):
    """Persist current tracker state to DB."""
    state = {
        "round": tracker.round,
        "turn_index": tracker.turn_index,
        "combatants": [asdict(c) for c in tracker.combatants],
        "has_started": tracker.has_started,
        "positions": combatant_positions
    }
    
    db = get_db()
    db.execute("INSERT OR REPLACE INTO game_saves (save_id, data_json) VALUES (?, ?)", 
               (save_id, json.dumps(state)))
    db.commit()
    print(f"💾 Game saved: {save_id}")

def load_game(save_id: str) -> bool:
    """Load tracker state from DB."""
    db = get_db()
    row = db.execute("SELECT data_json FROM game_saves WHERE save_id = ?", (save_id,)).fetchone()
    
    if not row:
        return False
        
    data = json.loads(row["data_json"])
    
    tracker.round = data.get("round", 1)
    tracker.turn_index = data.get("turn_index", 0)
    tracker.has_started = data.get("has_started", False)
    
    tracker.combatants.clear()
    for c_data in data.get("combatants", []):
        c = Combatant(**c_data)
        tracker.combatants.append(c)
    
    # Load positions
    global combatant_positions
    combatant_positions = data.get("positions", {})
        
    print(f"📂 Game loaded: {save_id}")
    return True

def list_saves() -> list[dict]:
    """List all available saves."""
    db = get_db()
    rows = db.execute("SELECT save_id, created_at FROM game_saves ORDER BY created_at DESC").fetchall()
    return [{"save_id": row["save_id"], "created_at": row["created_at"]} for row in rows]
