import asyncio
import websockets
import json

async def test_spellcasting():
    uri = "ws://localhost:8000/ws/game/test-session"
    async with websockets.connect(uri) as websocket:
        print("Connected to WebSocket")
        
        # 1. Join Session
        await websocket.send(json.dumps({"type": "join_session", "role": "dm"}))
        print("Joined session")

        # 2. Add Combatants (Target)
        # We need a target with known stats to verify saving throw
        # But for now, we just rely on default "enemy" if not present, 
        # or we might need to initialize combat first?
        # The cast_spell handler uses data.get("target_id", "enemy")
        # Let's hope the backend handles "enemy" gracefully without prior init.
        
        # 3. Cast Fireball (spell_fireball)
        # SRD: 8d6 fire, DEX save
        cast_payload = {
            "action": "cast_spell",
            "spell_id": "spell_fireball",
            "attacker_id": "Wizard",
            "target_id": "Goblin",
            "save_dc": 15, 
            # "damage_dice_sides": 6,  <-- verify these are fetched from SRD
            # "damage_dice_count": 8,
            # "damage_type": "fire"
        }
        
        print(f"Sending Cast Spell: {cast_payload}")
        await websocket.send(json.dumps(cast_payload))

        # 4. Listen for responses
        while True:
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                data = json.loads(response)
                
                if data.get("type") == "NARRATIVE_CHUNK":
                    print(f"Narrative: {data.get('content')}", end="", flush=True)
                elif data.get("type") == "STATE_PATCH":
                    print("\n\n[SUCCESS] Received State Patch!")
                    print(json.dumps(data, indent=2))
                    break
            except asyncio.TimeoutError:
                print("\n[TIMEOUT] No response received.")
                break

if __name__ == "__main__":
    asyncio.run(test_spellcasting())
