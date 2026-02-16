import requests
import json

BASE_URL = "http://localhost:8081/api/world/map"

def test_spawn_npc():
    print("--- Spawning NPC at start_town ---")
    response = requests.post(f"{BASE_URL}/nodes/start_town/spawn-npc?cr=0.5")
    if response.status_code == 200:
        npc = response.json()
        print(f"✅ Spawned: {npc['name']} ({npc['profile']['core_trait']})")
        return npc['id']
    else:
        print(f"❌ Failed to spawn NPC: {response.text}")
        return None

def test_get_actors():
    print("--- Fetching actors at start_town ---")
    response = requests.get(f"{BASE_URL}/nodes/start_town/actors")
    if response.status_code == 200:
        actors = response.json()
        print(f"✅ Found {len(actors)} actors:")
        for a in actors:
            print(f" - {a['name']} (ID: {a['id']}) - Trait: {a['profile']['core_trait']}")
    else:
        print(f"❌ Failed to fetch actors: {response.text}")

if __name__ == "__main__":
    npc_id = test_spawn_npc()
    if npc_id:
        test_get_actors()
