import sys
import os
import json

# Path setup to find packages
sys.path.append(os.path.join(os.getcwd(), "packages", "engine", "src"))
sys.path.append(os.path.join(os.getcwd(), "packages"))

import engine.srd_queries
import importlib
importlib.reload(engine.srd_queries)
from engine.srd_queries import get_monster_stats, get_spell_mechanics, get_weapon_stats, search_monsters
import inspect

def verify():
    print("--- Verifying SRD Data ---")
    print(f"Loaded srd_queries from: {engine.srd_queries.__file__}")
    print("Source of get_spell_mechanics:")
    print(inspect.getsource(get_spell_mechanics))
    print(f"Loaded srd_queries from: {engine.srd_queries.__file__}")
    
    # 1. Search for Goblin
    print("\n1. Searching for 'Goblin'...")
    results = search_monsters("Goblin")
    print(f"Found {len(results)} results.")
    for r in results:
        print(f" - {r['name']} (ID: {r['id']}, CR: {r['cr']})")
    
    if not results:
        print("FAIL: Goblin not found via search.")
        return

    goblin_id = results[0]['id']
    
    # 2. Get Goblin Stats
    print(f"\n2. Fetching stats for {goblin_id}...")
    stats = get_monster_stats(goblin_id)
    print(f"Name: {stats['name']}")
    print(f"AC: {stats['ac']}")
    print(f"HP: {stats['hp_max']}")
    print(f"Actions: {[a['name'] for a in stats['actions']]}")
    
    # 3. Get Fireball Spell
    print("\n3. Fetching Fireball spell...")
    # ID format from import: spell_fireball (slug)
    spell = get_spell_mechanics("spell_fireball")
    print(f"Name: {spell['name']}")
    print(f"Level: {spell['level']}")
    print(f"Damage: {spell['damage_dice_count']}d{spell['damage_dice_sides']}")
    
    # 4. Get Longsword
    print("\n4. Fetching Longsword...")
    weapon = get_weapon_stats("equipment_longsword")
    print(f"Name: {weapon['name']}")
    print(f"Damage: {weapon['damage_dice_count']}d{weapon['damage_dice_sides']} {weapon['damage_type']}")

if __name__ == "__main__":
    verify()
