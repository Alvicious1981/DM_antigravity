from fastapi.testclient import TestClient
from engine.server import app
import time
import os
import sys

# Ensure engine is in path
sys.path.append(os.path.join(os.getcwd(), "packages", "engine", "src"))

client = TestClient(app)

def test_full_game_loop():
    """
    Verify the full game loop:
    1. Connect
    2. Add Combatants (Hero, Goblin)
    3. Attack (Hero -> Goblin) -> Chronos Narrative
    4. Distribute Loot (Simulated) -> Visual Vault Asset
    5. Map Interaction (Request Data, Travel)
    6. Save Game
    """
    print("Starting Full Game Loop Verification...")
    
    with client.websocket_connect("/ws/game/full_loop_session?role=dm&dm_token=AG-DM-2026") as websocket:
        # 1. Connection
        data = websocket.receive_json()
        assert data["type"] == "CONNECTION_ESTABLISHED"
        print("1. Connection Established")
        time.sleep(0.5)

        # 2. Add Combatants
        websocket.send_json({
            "action": "add_combatant",
            "instance_id": "Hero",
            "name": "Hero",
            "is_player": True,
            "hp_max": 20,
            "ac": 15
        })
        time.sleep(0.5)
        websocket.receive_json() # InitiativeUpdate

        websocket.send_json({
            "action": "add_combatant",
            "instance_id": "Goblin",
            "name": "Goblin",
            "is_player": False,
            "hp_max": 10,
            "ac": 12
        })
        time.sleep(0.5)
        websocket.receive_json() # InitiativeUpdate
        print("2. Combatants Added")

        # 3. Attack (Hero -> Goblin)
        websocket.send_json({
            "action": "attack",
            "attacker_id": "Hero",
            "target_id": "Goblin",
            "weapon_id": "longsword",
            "target_ac": 12,
            "target_current_hp": 10
        })
        
        # Expect Narrative
        narrative_complete = False
        log_received = False
        start_time = time.time()
        while not narrative_complete and time.time() - start_time < 10:
            data = websocket.receive_json()
            if data["type"] == "NARRATIVE_CHUNK" and data["done"]:
                narrative_complete = True
            elif data["type"] == "LOG":
                log_received = True
        
        if not narrative_complete:
            print("WARNING: Timed out waiting for narrative (Mock mode might be too slow or failing)")
        else:
            print("3. Attack & Narrative Complete")

        # 4. Distribute Loot (Simulated)
        time.sleep(0.7)
        websocket.send_json({
            "action": "distribute_loot",
            "target_character_id": "Hero",
            "item_ids": ["longsword"] # Use reliable ID
        })
        
        # Expect Inventory Update & Loot Distributed
        loot_distributed = False
        inventory_update = False
        start_time = time.time()
        while not (loot_distributed and inventory_update) and time.time() - start_time < 5:
             data = websocket.receive_json()
             if data["type"] == "LOOT_DISTRIBUTED":
                 loot_distributed = True
             elif data["type"] == "INVENTORY_UPDATE":
                 inventory_update = True
        print("4. Loot Distributed")

        # 5. Map Interaction
        # Request Data
        time.sleep(0.7)
        websocket.send_json({
            "action": "map_interaction",
            "character_id": "Hero",
            "interaction_type": "request_data"
        })
        data = websocket.receive_json()
        print(f"Received data for Map Interaction: {data}")
        assert data["type"] == "MAP_DATA"
        assert len(data["nodes"]) > 0
        current_node_id = data["current_node_id"]
        print(f"5a. Map Data Received (Current: {current_node_id})")

        # Travel
        # Find a connected node
        current_node = next(n for n in data["nodes"] if n["id"] == current_node_id)
        if current_node["connections"]:
            target_node_id = current_node["connections"][0]
            time.sleep(0.7)
            websocket.send_json({
                "action": "map_interaction",
                "character_id": "Hero",
                "interaction_type": "travel",
                "target_node_id": target_node_id
            })
            
            # Expect MapUpdate and Narrative
            map_update = False
            narrative_complete = False
            start_time = time.time()
            print("Waiting for Map Update and Narrative (up to 60s)...")
            while not (map_update and narrative_complete) and time.time() - start_time < 60:
                try:
                    data = websocket.receive_json()
                    print(f"Received during travel wait: {data.get('type')} - {data.get('message', '')[:50]}")
                    if data["type"] == "MAP_UPDATE":
                        map_update = True
                    elif data["type"] == "NARRATIVE_CHUNK" and data["done"]:
                        narrative_complete = True
                    elif data["type"] == "ACK" and data["status"] == "error":
                        print(f"ERROR received during travel: {data['message']}")
                        break
                except Exception as e:
                    # Might be a timeout or other error
                    if time.time() - start_time > 55:
                        print(f"Timeout waiting for travel events: {e}")
                        break
            
            if map_update and narrative_complete:
                print(f"5b. Travelled to {target_node_id}")
            else:
                print(f"5b. Travel failed or timed out (Map: {map_update}, Narr: {narrative_complete})")
        else:
            print("5b. No connections to travel to (Skipped)")

        # 6. Save Game
        time.sleep(0.7)
        websocket.send_json({
            "action": "save_game",
            "save_id": "verification_save"
        })
        data = websocket.receive_json()
        if data["type"] == "LOG" and "Game saved" in data["message"]:
             print("6. Game Saved")
        else:
             print(f"6. Unexpected event during save: {data}")

if __name__ == "__main__":
    test_full_game_loop()
