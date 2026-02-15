import time
import sys
import os

# Add src to path
sys.path.append(os.path.join(os.getcwd(), "packages", "engine", "src"))

from engine.srd_queries import search_monsters, get_srd_mechanic

def profile():
    print("--- Performance Profiling ---")
    
    # 1. Test Search Speed (FTS)
    start = time.perf_counter()
    results = search_monsters("Goblin")
    end = time.perf_counter()
    print(f"Initial Search 'Goblin': {(end - start)*1000:.2f}ms (Found {len(results)})")

    # 2. Test Search Speed (Cached/Second run)
    start = time.perf_counter()
    results = search_monsters("Goblin")
    end = time.perf_counter()
    print(f"Repeated Search 'Goblin': {(end - start)*1000:.2f}ms")

    # 3. Test Mechanic Fetch (Initial)
    start = time.perf_counter()
    data = get_srd_mechanic("monster_goblin")
    end = time.perf_counter()
    print(f"Initial Fetch 'monster_goblin': {(end - start)*1000:.2f}ms")

    # 4. Test Mechanic Fetch (Cached)
    start = time.perf_counter()
    data = get_srd_mechanic("monster_goblin")
    end = time.perf_counter()
    print(f"Cached Fetch 'monster_goblin': {(end - start)*1000:.2f}ms")

if __name__ == "__main__":
    profile()
