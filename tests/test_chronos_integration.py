

from fastapi.testclient import TestClient
from engine.server import app
from engine.schemas import AttackAction, NarrativeChunkEvent, LogEvent, ConnectionEstablishedEvent

client = TestClient(app)

def test_chronos_narrative_streaming():
    """
    Verify that an attack action triggers Chronos to stream NarrativeChunkEvents.
    """
    with client.websocket_connect("/ws/game/test_session?role=dm&dm_token=AG-DM-2026") as websocket:
        # 1. Receive Connection Event
        data = websocket.receive_json()
        assert data["type"] == "CONNECTION_ESTABLISHED"
        
        import time
        time.sleep(0.6) # Wait for rate limit

        # 2. Setup: Add generic combatants (Hero vs Goblin)
        # We rely on the server state having these or adding them. 
        # Let's add them via the websocket to be sure.
        websocket.send_json({
            "action": "add_combatant",
            "instance_id": "Hero",
            "name": "Hero",
            "is_player": True,
            "hp_max": 20,
            "ac": 15
        })
        time.sleep(0.6) # Wait for rate limit
        websocket.receive_json() # InitiativeUpdate

        websocket.send_json({
            "action": "add_combatant",
            "instance_id": "Goblin",
            "name": "Goblin",
            "is_player": False,
            "hp_max": 10,
            "ac": 12
        })
        time.sleep(0.6) # Wait for rate limit
        websocket.receive_json() # InitiativeUpdate

        # 3. Trigger Attack (Hero attacks Goblin)
        attack_payload = {
            "action": "attack",
            "attacker_id": "Hero",
            "target_id": "Goblin",
            "weapon_id": "longsword", # Should default if not found
            "target_ac": 12,
            "target_current_hp": 10
        }
        websocket.send_json(attack_payload)

        # 4. Expect Narrative Chunks
        # We expect a series of NARRATIVE_CHUNK events, followed by a LOG event and STATE_PATCH
        
        chunks_received = []
        narrative_complete = False
        state_patch_received = False
        log_received = False

        # We'll read until we get the confirmation or timeout
        # Using a loop with a safety break
        max_messages = 50 
        for _ in range(max_messages):
            data = websocket.receive_json()
            event_type = data.get("type")
            print(f"Received Event: {event_type} - {data.get('content') or data.get('message') or ''}")

            if event_type == "NARRATIVE_CHUNK":
                chunks_received.append(data["content"])
                if data["done"]:
                    narrative_complete = True
            elif event_type == "LOG":
                log_received = True
            elif event_type == "STATE_PATCH":
                state_patch_received = True
            
            if narrative_complete and state_patch_received and log_received:
                print("All expected events received!")
                break
        
        # Assertions
        assert narrative_complete, "Did not receive 'done=True' narrative chunk"
        assert len(chunks_received) > 0, "No narrative chunks received"
        full_narrative = "".join(chunks_received)
        print(f"Captured Narrative: {full_narrative}")
        
        assert len(full_narrative) > 5, "Narrative too short"
        assert state_patch_received, "Did not receive STATE_PATCH"
        assert log_received, "Did not receive LOG event"

if __name__ == "__main__":
    test_chronos_narrative_streaming()
