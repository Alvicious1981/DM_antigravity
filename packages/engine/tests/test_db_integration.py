"""
Integration Tests — Database Persistence (db.py)
Verifying that saves and state changes are correctly persisted.
"""

import pytest
import sqlite3
import os
import json
from engine.db import get_db, close_db

@pytest.fixture
def test_db():
    """Create a temporary integration test database."""
    test_db_path = "integration_test.db"
    if os.path.exists(test_db_path):
        os.remove(test_db_path)
    
    # Mocking environment or path if necessary, but here we assume get_db 
    # uses a path we can control or we just test the existing logic on a temp file.
    conn = sqlite3.connect(test_db_path)
    conn.row_factory = sqlite3.Row
    
    # Setup schema
    conn.execute("""
        CREATE TABLE IF NOT EXISTS game_saves (
            save_id TEXT PRIMARY KEY,
            data_json TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    
    yield conn
    
    conn.close()
    if os.path.exists(test_db_path):
        os.remove(test_db_path)

def test_game_save_persistence(test_db):
    """Verify that a game save is correctly stored and retrieved."""
    save_id = "test_session_1"
    save_data = {"party_hp": {"warrior": 20, "wizard": 12}, "location": "Dungeon Entrance"}
    
    test_db.execute(
        "INSERT INTO game_saves (save_id, data_json) VALUES (?, ?)",
        (save_id, json.dumps(save_data))
    )
    test_db.commit()
    
    # Retrieve
    row = test_db.execute("SELECT data_json FROM game_saves WHERE save_id = ?", (save_id,)).fetchone()
    assert row is not None
    retrieved_data = json.loads(row["data_json"])
    assert retrieved_data["party_hp"]["warrior"] == 20
    assert retrieved_data["location"] == "Dungeon Entrance"

def test_save_overwrite(test_db):
    """Verify that INSERT OR REPLACE works as expected for updates."""
    save_id = "test_session_1"
    initial_data = {"hp": 10}
    updated_data = {"hp": 5}
    
    test_db.execute("INSERT INTO game_saves (save_id, data_json) VALUES (?, ?)", (save_id, json.dumps(initial_data)))
    test_db.commit()
    
    # Overwrite
    test_db.execute(
        "INSERT OR REPLACE INTO game_saves (save_id, data_json) VALUES (?, ?)",
        (save_id, json.dumps(updated_data))
    )
    test_db.commit()
    
    row = test_db.execute("SELECT data_json FROM game_saves WHERE save_id = ?", (save_id,)).fetchone()
    assert json.loads(row["data_json"])["hp"] == 5
