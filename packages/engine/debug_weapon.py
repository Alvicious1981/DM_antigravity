import sys
import os
import json

# Add packages/engine/src to sys.path
sys.path.append(os.path.join(os.getcwd(), "packages", "engine", "src"))

from engine.srd_queries import get_srd_mechanic, get_weapon_stats

try:
    print("Fetching equipment_longsword...")
    raw = get_srd_mechanic("equipment_longsword")
    print(json.dumps(raw, indent=2))
    
    print("\nParsed Stats:")
    stats = get_weapon_stats("equipment_longsword")
    print(json.dumps(stats, indent=2))

except Exception as e:
    print(f"Error: {e}")
