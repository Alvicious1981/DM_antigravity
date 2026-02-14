"""
Dungeon Cortex — SRD Query Engine (§5)
Fetches and deserializes game mechanics from the single source of truth.
"""

import json
from httpx import HTTPError  # Not really needed for sqlite, just used standard exc
from fastapi import HTTPException
import re
from .db import get_db

def get_srd_mechanic(mechanic_id: str, lang: str = "en") -> dict:
    """
    Fetch a single raw SRD mechanic by ID.
    Returns the deserialized JSON data.
    """
    db = get_db()
    row = db.execute(
        "SELECT id, type, data_json, data_es FROM srd_mechanic WHERE id = ?",
        (mechanic_id,)
    ).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail=f"Mechanic '{mechanic_id}' not found")

    # Select language column
    json_str = row["data_es"] if lang == "es" else row["data_json"]
    return json.loads(json_str)

def parse_dice_string(dice_str: str) -> tuple[int, int, int]:
    """
    Parse a dice string like "1d8", "2d6", "1d4+1", "1d6 + 2".
    Returns (count, sides, modifier).
    """
    if not dice_str:
        return 0, 0, 0
        
    # Remove whitespace
    dice_str = dice_str.replace(" ", "")
    
    # Regex for XdY(+Z) or XdY(-Z)
    match = re.search(r"(\d+)d(\d+)(?:([+-])(\d+))?", dice_str)
    if match:
        count = int(match.group(1))
        sides = int(match.group(2))
        modifier = 0
        if match.group(3) and match.group(4):
            mod_val = int(match.group(4))
            modifier = mod_val if match.group(3) == "+" else -mod_val
        return count, sides, modifier
    return 0, 0, 0 # Fallback

def get_weapon_stats(weapon_id: str) -> dict:
    """
    Get damage dice and properties for a weapon.
    e.g. 'equipment_longsword' -> {damage: '1d8', type: 'slashing'}
    """
    data = get_srd_mechanic(weapon_id)
    # Parse damage string "1d8" into components if needed, 
    # but for now just return the raw data structure 
    # The combat engine expects numeric inputs, so we might need parsing helpers here.
    
    # Example SRD structure for weapon damage:
    # "damage": {"damage_dice": "1d8", "damage_type": {"index": "slashing", ...}}
    
    damage_info = data.get("damage", {})
    dice_str = damage_info.get("damage_dice", "1d4")
    damage_type = damage_info.get("damage_type", {}).get("index", "bludgeoning")
    
    count, sides, modifier = parse_dice_string(dice_str)

    return {
        "name": data.get("name", "Unknown Weapon"),
        "damage_dice_count": count,
        "damage_dice_sides": sides,
        "damage_modifier": modifier,
        "damage_type": damage_type,
        "properties": [p["index"] for p in data.get("properties", [])]
    }

def get_monster_stats(monster_id: str) -> dict:
    """
    Get AC, HP, and relevant combat stats for a monster.
    """
    data = get_srd_mechanic(monster_id)
    
    # AC in SRD is a list of objects usually: [{'value': 15, 'type': 'armor'}]
    ac_list = data.get("armor_class", [])
    ac = 10
    if ac_list and isinstance(ac_list, list):
        ac = ac_list[0].get("value", 10)
    elif isinstance(ac_list, int): # sometimes it's just int in older data
        ac = ac_list
        
    actions = []
    if "actions" in data:
        for action in data["actions"]:
            action_data = {
                "name": action.get("name", "Unknown Action"),
                "desc": action.get("desc", ""),
                "attack_bonus": action.get("attack_bonus", 0),
            }
            
            # Parse damage from structured data if available
            # Parse damage from structured data if available
            damage_list = action.get("damage", [])
            dice_str = None
            dtype = None
            
            if damage_list:
                dmg = damage_list[0]
                dice_str = dmg.get("damage_dice")
                dtype = dmg.get("damage_type", {}).get("index")
            elif "damage_dice" in action: 
                # Sometimes at top level in older data / simplified format
                dice_str = action["damage_dice"] 
            
            c, s, m = parse_dice_string(dice_str)
            action_data["damage_dice_count"] = c
            action_data["damage_dice_sides"] = s
            action_data["damage_modifier"] = m
            action_data["damage_type"] = dtype or "bludgeoning"
            
            actions.append(action_data)

    dex_score = data.get("dexterity", 10)
    dex_mod = (dex_score - 10) // 2

    return {
        "name": data.get("name", "Unknown Monster"),
        "ac": ac,
        "hp_max": data.get("hit_points", 10),
        "cr": data.get("challenge_rating", 0),
        "dex_modifier": dex_mod,
        "actions": actions
    }

def get_spell_mechanics(spell_id: str) -> dict:
    """
    Get core mechanics for a spell:
    - Saving Throw (stat, DC type)
    - Damage (dice count, sides, type)
    - Attack Roll (bool)
    """
    data = get_srd_mechanic(spell_id)
    
    mechanics = {
        "name": data.get("name", "Unknown Spell"),
        "level": data.get("level", 1),
        "school": data.get("school", {}).get("index", "evocation"),
        "components": data.get("components", []),
        "requires_concentration": data.get("concentration", False),
    }

    # Parse Damage
    # SRD format: "damage": {"damage_at_slot_level": {"3": "8d6"}, "damage_type": {"index": "fire"}}
    damage_info = data.get("damage", {})
    mechanics["damage_type"] = damage_info.get("damage_type", {}).get("index", "force")
    
    # damage_at_slot_level is key for scalable damage
    damage_slots = damage_info.get("damage_at_slot_level", {})
    base_damage_str = "0d0"
    
    # Find list of damage keys (levels) and pick the lowest as base
    if damage_slots:
        levels = sorted([int(k) for k in damage_slots.keys()])
        if levels:
            base_damage_str = damage_slots[str(levels[0])]
    
    c, s, m = parse_dice_string(base_damage_str)
    mechanics["damage_dice_count"] = c
    mechanics["damage_dice_sides"] = s
    mechanics["damage_modifier"] = m

    # Parse Saving Throw
    dc_info = data.get("dc", {})
    if dc_info:
        mechanics["save_stat"] = dc_info.get("dc_type", {}).get("index", "dex")
        mechanics["save_success"] = dc_info.get("dc_success", "half") # "half" or "none"
    else:
        mechanics["save_stat"] = None

    # Attack Roll?
    mechanics["requires_attack_roll"] = "attack_type" in data

    return mechanics
