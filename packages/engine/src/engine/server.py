"""
Dungeon Cortex — FastAPI Server Bootstrap (§3.1)
HTTP + WebSocket server for the AG-UI protocol.
"""

import json
import sqlite3
import asyncio
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .combat import resolve_attack
from .dice import roll, d20

# Database path
DB_PATH = Path(__file__).resolve().parent.parent.parent / "dungeon_cortex_dev.db"

# Module-level DB connection (dev only — use async pool for prod)
_db: sqlite3.Connection | None = None


def get_db() -> sqlite3.Connection:
    """Get SQLite connection (lazy singleton)."""
    global _db
    if _db is None:
        _db = sqlite3.connect(str(DB_PATH))
        _db.row_factory = sqlite3.Row
    return _db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle: startup and shutdown hooks."""
    global _db
    _db = sqlite3.connect(str(DB_PATH))
    _db.row_factory = sqlite3.Row
    count = _db.execute("SELECT COUNT(*) FROM srd_mechanic").fetchone()[0]
    print(f"🎲 Dungeon Cortex Engine starting... ({count} SRD mechanics loaded)")
    yield
    if _db:
        _db.close()
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
async def get_srd_mechanic(mechanic_id: str, lang: str = "en"):
    """
    Fetch a single SRD mechanic by ID.
    Second Law: State is Truth — this IS the canonical game data.

    Args:
        mechanic_id: e.g. "spell_fireball", "monster_goblin"
        lang: "en" for English data, "es" for Spanish data
    """
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

    Returns: name + index for each entry (lightweight listing).
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
        data = json.loads(row["data_es"] if lang == "es" else row["data_json"])
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

            if action == "attack":
                # Route to combat engine
                result = resolve_attack(
                    attacker_id=data.get("attacker_id", "player"),
                    target_id=data.get("target_id", "enemy"),
                    attack_bonus=data.get("attack_bonus", 0),
                    target_ac=data.get("target_ac", 10),
                    damage_dice_sides=data.get("damage_dice_sides", 6),
                    damage_dice_count=data.get("damage_dice_count", 1),
                    damage_modifier=data.get("damage_modifier", 0),
                    damage_type=data.get("damage_type", "bludgeoning"),
                    target_current_hp=data.get("target_current_hp", 20),
                )

                # Stream narrative chunks with typewriter effect
                fact_packet = result.to_fact_packet()
                if result.hit:
                    narrative = f"⚔️ ¡Impacto! Tu ataque golpea con un {result.roll_natural} natural (+{data.get('attack_bonus', 0)} = {result.roll_total} vs AC {result.ac_target}). Infliges {result.damage_total} puntos de daño {result.damage_type}."
                else:
                    narrative = f"🛡️ ¡Fallo! Tu ataque con un {result.roll_natural} natural (+{data.get('attack_bonus', 0)} = {result.roll_total}) no supera la AC {result.ac_target}."

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
