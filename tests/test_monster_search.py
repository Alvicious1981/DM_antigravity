import pytest
from fastapi.testclient import TestClient
from engine.server import app
from engine.srd_queries import search_monsters
from engine.db import get_db

client = TestClient(app)

def test_search_monsters_direct():
    """Test the search_monsters function directly."""
    # Assuming the DB is populated. usage of 'orc' is common.
    results = search_monsters("orc")
    assert isinstance(results, list)
    # If DB is empty, this might be empty, but it shouldn't error.
    # We hope there's seed data.
    print(f"Direct Search Results: {results}")

def test_websocket_monster_search():
    """Test the WebSocket search_monsters action."""
    with client.websocket_connect("/ws/game/test_session") as websocket:
        # Receive connection established
        data = websocket.receive_json()
        assert data["type"] == "CONNECTION_ESTABLISHED"
        
        # Send search action
        websocket.send_json({
            "action": "search_monsters",
            "query": "goblin"
        })
        
        # Expect results
        response = websocket.receive_json()
        # Might receive other events first (like state patch maybe?), but usually it replies directly.
        # The server code sends immediately.
        
        # Filter for search results if there's noise
        while response["type"] != "MONSTER_SEARCH_RESULTS":
            response = websocket.receive_json()
            
        assert response["type"] == "MONSTER_SEARCH_RESULTS"
        assert "results" in response
        print(f"WS Search Results: {response['results']}")

def test_websocket_add_combatant():
    """Test the WebSocket add_combatant action."""
    with client.websocket_connect("/ws/game/test_session_2") as websocket:
        # Receive connection established
        websocket.receive_json()
        
        # search first to get a valid ID
        websocket.send_json({
            "action": "search_monsters",
            "query": "goblin"
        })
        
        search_response = websocket.receive_json()
        while search_response["type"] != "MONSTER_SEARCH_RESULTS":
            search_response = websocket.receive_json()
            
        results = search_response["results"]
        if not results:
            pytest.skip("No monsters found to add.")
            
        monster = results[0]
        
        # Add combatant
        websocket.send_json({
            "action": "add_combatant",
            "instance_id": "test_monster_1",
            "template_id": monster["id"],
            "name": monster["name"]
        })
        
        # Expect INITIATIVE_UPDATE
        response = websocket.receive_json()
        while response["type"] != "INITIATIVE_UPDATE":
            response = websocket.receive_json()
            
        assert response["type"] == "INITIATIVE_UPDATE"
        combatants = response["combatants"]
        found = any(c["id"] == "test_monster_1" for c in combatants)
        assert found, "Added monster not found in combatants list"
