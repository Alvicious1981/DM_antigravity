"""
Dungeon Cortex — FastAPI Server Bootstrap (§3.1)
HTTP + WebSocket server for the AG-UI protocol.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db import get_db, close_db
from .routers import srd, combat, websocket, game, maps
from .ai.chronos import ChronosClient
from .ai.visual_vault import VisualVaultClient

# Agent Instances
chronos_client = ChronosClient()
visual_vault_client = VisualVaultClient()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle: startup and shutdown hooks."""
    db = get_db()
    
    # Ensure essential tables exist
    db.execute("""
        CREATE TABLE IF NOT EXISTS game_saves (
            save_id TEXT PRIMARY KEY,
            data_json TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    db.execute("""
        CREATE TABLE IF NOT EXISTS actors (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL, -- person, monster, object
            location_node_id TEXT, -- Added for map positioning
            data_json TEXT NOT NULL DEFAULT '{}',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    db.execute("""
        CREATE TABLE IF NOT EXISTS items (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            actor_id TEXT, -- Owner ID
            data_json TEXT NOT NULL DEFAULT '{}',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (actor_id) REFERENCES actors(id)
        )
    """)
    db.execute("""
        CREATE TABLE IF NOT EXISTS inventory_item (
            id TEXT PRIMARY KEY,
            character_id TEXT,
            template_id TEXT,
            location TEXT DEFAULT 'backpack',
            slot_type TEXT,
            grid_index INTEGER DEFAULT 0,
            current_charges INTEGER DEFAULT 0,
            is_identified INTEGER DEFAULT 1,
            visual_asset_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    db.commit()
    try:
        count = db.execute("SELECT COUNT(*) FROM srd_mechanic").fetchone()[0]
        print(f"🎲 Dungeon Cortex Engine starting... ({count} SRD mechanics loaded)")
    except Exception as e:
         print(f"🎲 Dungeon Cortex Engine starting... (DB Error: {e})")
    
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

# Include Routers
app.include_router(srd.router)
app.include_router(combat.router)
app.include_router(websocket.router)
app.include_router(game.router)
app.include_router(maps.router)


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
            "logic_core": True,
            "chronos": not chronos_client.is_mock,
            "visual_vault": not visual_vault_client.is_mock,
        },
    }
