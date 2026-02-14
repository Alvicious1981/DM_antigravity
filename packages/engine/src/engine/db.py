"""
Dungeon Cortex — Database Connection (§3.1)
Shared SQLite connection logic for the engine.
"""

import sqlite3
from pathlib import Path

# Database path (relative to this file in src/engine)
# packages/engine/src/engine/db.py -> packages/engine (root of package)
DB_PATH = Path(__file__).resolve().parent.parent.parent / "dungeon_cortex_dev.db"

# Module-level DB connection (dev only — use async pool for prod)
_db: sqlite3.Connection | None = None


def get_db() -> sqlite3.Connection:
    """
    Get SQLite connection (lazy singleton).
    Ensures consistent Row factory deployment.
    """
    global _db
    if _db is None:
        _db = sqlite3.connect(str(DB_PATH))
        _db.row_factory = sqlite3.Row
    return _db


def close_db():
    """Close the global database connection."""
    global _db
    if _db:
        _db.close()
        _db = None
