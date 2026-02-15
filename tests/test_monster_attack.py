

import pytest
import shutil
import os
from pathlib import Path
from fastapi.testclient import TestClient
from engine import db  # Import the module to patch
from engine.server import app

# Path setup
ORIGINAL_DB = Path(db.DB_PATH)
TEST_DB = ORIGINAL_DB.parent / f"test_db_{os.getpid()}.db"

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    """Create a copy of the DB for testing to avoid locks."""
    if ORIGINAL_DB.exists():
        shutil.copy(ORIGINAL_DB, TEST_DB)
    else:
        pytest.fail(f"Original DB not found at {ORIGINAL_DB}")
    
    # Patch the DB_PATH in the module
    original_path = db.DB_PATH
    db.DB_PATH = TEST_DB
    
    # Reset the global connection to force new connect
    db.close_db()
    
    yield
    
    # Teardown
    db.close_db()
    db.DB_PATH = original_path
    if TEST_DB.exists():
        try:
            os.remove(TEST_DB)
        except PermissionError:
            print(f"Warning: Could not remove {TEST_DB} due to lock.")

client = TestClient(app)

def test_monster_attack_flow():
    """Test the full flow of a monster attacking a player."""
    with client.websocket_connect("/ws/game/test_combat_session") as websocket:
        # 1. Connection Established
        data = websocket.receive_json()
        assert data["type"] == "CONNECTION_ESTABLISHED"
        
        # 2. Add Player (Target)
        websocket.send_json({
            "action": "add_combatant",
            "instance_id": "player_1",
            "name": "Hero",
            "is_player": True,
            "hp_max": 20,
            "ac": 10 # Low AC to ensure hits are likely
        })
        # Consume Init Update
        # Consume Init Update with robust loop
        max_loops = 10
        count = 0
        while True:
            resp = websocket.receive_json()
            print(f"Received: {resp}")
            if resp.get("type") == "INITIATIVE_UPDATE":
                break
            if resp.get("type") == "ACK" and resp.get("status") == "error":
                pytest.fail(f"Server Error: {resp.get('message')}")
            count += 1
            if count > max_loops:
                pytest.fail("Timeout waiting for INITIATIVE_UPDATE")

        # 3. Add Monster (Attacker)
        # Search for a valid monster first
        websocket.send_json({
            "action": "search_monsters",
            "query": "goblin"
        })
        
        search_response = websocket.receive_json()
        while search_response["type"] != "MONSTER_SEARCH_RESULTS":
            search_response = websocket.receive_json()
        
        if not search_response["results"]:
             # Fallback to orc
            websocket.send_json({
                "action": "search_monsters",
                "query": "orc"
            })
            search_response = websocket.receive_json()
            while search_response["type"] != "MONSTER_SEARCH_RESULTS":
                search_response = websocket.receive_json()
                
        if not search_response["results"]:
            pytest.fail("No monsters found in DB to test with.")
            
        monster = search_response["results"][0]
        print(f"Using monster: {monster['name']} ({monster['id']})")

        websocket.send_json({
            "action": "add_combatant",
            "instance_id": "monster_1",
            "template_id": monster["id"], 
            "name": monster["name"]
        })
        
        # Consume Init Update
        # Consume Init Update
        count = 0
        while True:
            resp = websocket.receive_json()
            print(f"Received (Loop 2): {resp}")
            if resp.get("type") == "INITIATIVE_UPDATE":
                break
            if resp.get("type") == "ACK" and resp.get("status") == "error":
                pytest.fail(f"Server Error: {resp.get('message')}")
            count += 1
            if count > max_loops:
                 pytest.fail("Timeout 2 waiting for INITIATIVE_UPDATE")
            
        # 4. Execute Attack
        websocket.send_json({
            "action": "monster_attack",
            "attacker_id": "monster_1",
            "target_id": "player_1",
            "action_index": 0,
            "target_ac": 10,
            "target_current_hp": 20
        })
        
        # 5. Verify Response
        # We expect NARRATIVE_CHUNKs
        response = websocket.receive_json()
        # Collect narrative until STATE_PATCH or timeout
        narrative_text = ""
        loop_count = 0
        while response["type"] == "NARRATIVE_CHUNK":
            narrative_text += response["content"]
            response = websocket.receive_json()
            loop_count += 1
            if loop_count > 200: # Safety break
                break
            
        print(f"\nNarrative: {narrative_text}")

        if response["type"] == "STATE_PATCH":
            assert "patches" in response
            # Check if HP was updated. 
            patches = response["patches"]
            hp_patch = next((p for p in patches if p["path"] == "/targets/player_1/hp"), None)
            assert hp_patch is not None
            
            print(f"Attack Result Packet: {response.get('fact_packet')}")
            if response.get('fact_packet', {}).get('hit'):
                assert hp_patch['value'] < 20
            else:
                assert hp_patch['value'] == 20
        else:
            pytest.fail(f"Expected STATE_PATCH, got {response['type']}")
