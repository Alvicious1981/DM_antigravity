"""
Verification script for SRD Data.
Ensures that monsters, spells, and weapons are correctly loaded and parsed.
"""
import os
import sys

# Ensure packages/engine/src is in path
sys.path.append(os.path.join(os.getcwd(), "packages", "engine", "src"))
sys.path.append(os.path.join(os.getcwd(), "packages"))

from engine.srd_queries import get_monster_stats, get_spell_mechanics, get_weapon_stats, search_monsters

def verify():
    print("--- Verifying SRD Data ---\n")
    
    # 1. Search for Goblin
    print("1. Searching for 'Goblin'...")
    results = search_monsters("Goblin")
    print(f"Found {len(results)} results.")
    for r in results:
        print(f" - {r['name']} (ID: {r['id']}, CR: {r['cr']})")

    # 2. Fetch specific monster stats
    print("\n2. Fetching stats for monster_goblin...")
    goblin = get_monster_stats("monster_goblin")
    print(f"Name: {goblin['name']}")
    print(f"AC: {goblin['ac']}")
    print(f"HP: {goblin['hp_max']}")
    print(f"Actions: {[a['name'] for a in goblin['actions']]}")

    # 3. Fetch Fireball spell
    print("\n3. Fetching Fireball spell...")
    fireball = get_spell_mechanics("spell_fireball")
    print(f"Name: {fireball['name']}")
    print(f"Level: {fireball['level']}")
    print(f"Damage: {fireball['damage_dice_count']}d{fireball['damage_dice_sides']}")
    print(f"Damage Type: {fireball['damage_type']}")

    # 4. Fetch Longsword
    print("\n4. Fetching Longsword...")
    longsword = get_weapon_stats("equipment_longsword")
    print(f"Name: {longsword['name']}")
    print(f"Damage: {longsword['damage_dice_count']}d{longsword['damage_dice_sides']} {longsword['damage_type']}")

if __name__ == "__main__":
    verify()
