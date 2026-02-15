"""
Integration Tests — WebSocket Flows (websocket.py)
Verifying the full-loop from message to narrative response.
"""

import pytest
from fastapi.testclient import TestClient
from engine.server import app
import json

def test_websocket_attack_flow():
    """Verify the full-loop for an attack action via WebSocket."""
    client = TestClient(app)
    
    # Updated to match @router.websocket("/ws/game/{session_id}")
    with client.websocket_connect("/ws/game/test_session?role=dm&dm_token=AG-DM-2026") as websocket:
        # 1. Receive CONNECTION_ESTABLISHED
        conn_resp = websocket.receive_json()
        assert conn_resp["type"] == "CONNECTION_ESTABLISHED"

        # 2. Add combatants first (Server-side state needed)
        websocket.send_json({
            "action": "add_combatant",
            "instance_id": "player_1",
            "name": "Warrior",
            "is_player": True,
            "hp_max": 20,
            "ac": 15
        })
        websocket.send_json({
            "action": "add_combatant",
            "instance_id": "goblin_a",
            "name": "Goblin",
            "is_player": False,
            "hp_max": 7,
            "ac": 12
        })
        
        # Clear the ACKs or wait for state
        # (Assuming simple blocking send/receive for test)
        
        # 3. Send an attack action
        # Updated to match AttackAction schema
        attack_req = {
            "action": "attack",
            "attacker_id": "player_1",
            "target_id": "goblin_a",
            "weapon_id": "longsword" # Optional
        }
        websocket.send_json(attack_req)
        
        # 4. Receive response chunks
        responses = []
        for _ in range(20): 
            resp = websocket.receive_json()
            responses.append(resp)
            if resp.get("type") == "NARRATIVE_CHUNK" and resp.get("done") is True:
                break
        
        # 5. Assertions
        assert any(r.get("type") == "NARRATIVE_CHUNK" for r in responses)
        assert any(r.get("type") == "STATE_PATCH" for r in responses)
        
        # Verify state was updated in the fact packet sent to client
        final_packet = next(r for r in responses if "attack_result" in r)["attack_result"]
        assert "hit" in final_packet
        assert "damage_total" in final_packet
