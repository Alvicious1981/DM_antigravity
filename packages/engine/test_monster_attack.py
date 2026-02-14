import asyncio
import websockets
import json

async def test_monster_attack():
    uri = "ws://localhost:8000/ws/game/test-session-monster"
    async with websockets.connect(uri) as websocket:
        print("Connected to WebSocket")
        
        # 1. Spawn Goblin (via Roll Initiative)
        print("\n--- Spawning Goblin (monster_goblin) ---")
        await websocket.send(json.dumps({
            "action": "roll_initiative",
            "combatant_id": "monster_goblin",
            "name": "Grug",
            "dex_modifier": 0, # Should be ignored/overridden by SRD (+2)
            "is_player": False
        }))
        
        # Wait for update
        goblin_stats = None
        try:
            while True:
                resp = json.loads(await asyncio.wait_for(websocket.recv(), timeout=5.0))
                if resp.get("type") == "INITIATIVE_UPDATE":
                    print("\nReceived Initiative Update")
                    combatants = resp["combatants"]
                    goblin = next((c for c in combatants if c["id"] == "monster_goblin"), None)
                    if goblin:
                        print(f"Goblin Data: {json.dumps(goblin, indent=2)}")
                        goblin_stats = goblin
                        break
                elif resp.get("type") == "NARRATIVE_CHUNK":
                    # Ignore narrative
                    pass
        except asyncio.TimeoutError:
            print("Timed out waiting for Initiative Update")
        
        if not goblin_stats:
            print("FAILED: Goblin not found in tracker.")
            return

        # Verify Stats
        if goblin_stats["hp_max"] == 7 and goblin_stats["ac"] == 15:
            print("SUCCESS: Goblin stats match SRD (HP 7, AC 15).")
        else:
            print("FAILED: Goblin stats mismatch.")

        # 2. Attack with Scimitar
        print("\n--- Triggering Scimitar Attack ---")
        await websocket.send(json.dumps({
            "action": "attack",
            "attacker_id": "monster_goblin",
            "action_name": "Scimitar",
            "target_id": "dummy_target",
            "target_ac": 10,
            "target_current_hp": 20
        }))

        # Listen for narrative
        narrative_accumulated = ""
        try:
            while True:
                resp = await asyncio.wait_for(websocket.recv(), timeout=3.0)
                data = json.loads(resp)
                if data.get("type") == "NARRATIVE_CHUNK":
                    chunk = data.get("content", "")
                    print(chunk, end="", flush=True)
                    narrative_accumulated += chunk
                    if data.get("done"):
                        break
        except asyncio.TimeoutError:
            print("\nStream finished or timed out.")
        
        # Verify Narrative contains expected damage info
        # Scimitar: 1d6+2. Min 3, Max 8.
        # Narrative format: "Infliges X puntos de daño slashing."
        print("\n\nTest Complete.")

if __name__ == "__main__":
    asyncio.run(test_monster_attack())
