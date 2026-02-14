import asyncio
import websockets
import json
import unittest

async def run_test():
    uri = "ws://localhost:8000/ws/game/test-session-weapon"
    async with websockets.connect(uri) as websocket:
        print("Connected to WebSocket")
        
        # Join Session
        await websocket.send(json.dumps({"type": "join_session", "role": "player"}))
        
        # Test 1: Longsword Attack (1d8 slashing)
        # We omit damage params to force lookup
        attack_payload = {
            "action": "attack",
            "attacker_id": "Fighter",
            "target_id": "Dummy",
            "weapon_id": "equipment_longsword", 
            "attack_bonus": 5,
            "target_ac": 10
        }
        
        print(f"Sending Longsword Attack: {attack_payload}")
        await websocket.send(json.dumps(attack_payload))
        
        # Wait for response
        while True:
            response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
            data = json.loads(response)
            
            if data.get("type") == "STATE_PATCH":
                print("\n[SUCCESS] Received State Patch for Longsword!")
                fact = data.get("fact_packet", {})
                print(json.dumps(fact, indent=2))
                
                # Check specifics
                if fact.get("damage_type") != "slashing":
                    print("FAILURE: Expected slashing damage")
                    exit(1)
                # We can't easily check dice sides from fact packet unless it exposes it,
                # but damage total should be variable.
                break

        # Test 2: Dagger Attack (1d4 piercing)
        attack_payload = {
            "action": "attack",
            "attacker_id": "Rogue",
            "target_id": "Dummy",
            "weapon_id": "equipment_dagger", 
            "attack_bonus": 5,
            "target_ac": 10
        }
        
        print(f"Sending Dagger Attack: {attack_payload}")
        await websocket.send(json.dumps(attack_payload))
        
        while True:
            response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
            data = json.loads(response)
            
            if data.get("type") == "STATE_PATCH":
                print("\n[SUCCESS] Received State Patch for Dagger!")
                fact = data.get("fact_packet", {})
                print(json.dumps(fact, indent=2))
                
                if fact.get("damage_type") != "piercing":
                    print("FAILURE: Expected piercing damage")
                    exit(1)
                break

if __name__ == "__main__":
    try:
        asyncio.run(run_test())
    except Exception as e:
        print(f"Test Failed: {e}")
        exit(1)
