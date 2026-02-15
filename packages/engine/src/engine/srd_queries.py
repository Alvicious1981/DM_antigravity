"""
Dungeon Cortex — SRD Query Engine (§5)
Fetches and deserializes game mechanics from the single source of truth.
"""

import json
from functools import lru_cache
from httpx import HTTPError  # Not really needed for sqlite, just used standard exc
from fastapi import HTTPException
import re
from .db import get_db

@lru_cache(maxsize=128)

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
        # FALLBACK: Try searching by name if ID fails (Context Precision / Recall improvement)
        # Often LLMs or user input use human-readable names instead of slugified IDs
        search_term = mechanic_id.replace("_", " ").lower()
        row = db.execute(
            """
            SELECT id, type, data_json, data_es 
            FROM srd_mechanic 
            WHERE json_extract(data_json, '$.name') COLLATE NOCASE = ? 
            OR id LIKE ?
            LIMIT 1
            """,
            (search_term, f"%{mechanic_id}%")
        ).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail=f"Mechanic '{mechanic_id}' not found")

    # Select language column
    json_str = row["data_es"] if lang == "es" else row["data_json"]
    return json.loads(json_str)

@lru_cache(maxsize=512)

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
    
    # 1. Try structured "damage" object (dnd5eapi style)
    damage_info = data.get("damage", {})
    dice_str = damage_info.get("damage_dice")
    
    dtype_raw = damage_info.get("damage_type", {})
    if isinstance(dtype_raw, dict):
         damage_type = dtype_raw.get("index")
    else:
         damage_type = str(dtype_raw).lower() if dtype_raw else None

    # 2. Fallback to top-level Open5e style
    if not dice_str:
        dice_str = data.get("damage_dice", "1d4")
    
    if not damage_type:
        damage_type = data.get("damage_type", "bludgeoning")

    count, sides, modifier = parse_dice_string(dice_str)
    
    # Handle Properties (List[str] vs List[Dict])
    properties = []
    for p in data.get("properties", []):
        if isinstance(p, dict):
            properties.append(p.get("index", ""))
        else:
            properties.append(str(p))

    return {
        "name": data.get("name", "Unknown Weapon"),
        "damage_dice_count": count,
        "damage_dice_sides": sides,
        "damage_modifier": modifier,
        "damage_type": damage_type,
        "properties": properties
    }
    
# ...

def get_spell_mechanics(spell_id: str) -> dict:
    """
    Get core mechanics for a spell.
    """
    with open("debug_srd.log", "a") as f:
        f.write(f"Entering get_spell_mechanics for {spell_id}\\n")

    data = get_srd_mechanic(spell_id)
    
    mechanics = {
        "name": data.get("name", "Unknown Spell"),
        "level": data.get("level", 1),
        "components": data.get("components", []),
        "requires_concentration": data.get("concentration", False),
    }

    # Handle School
    school_raw = data.get("school", {})
    if isinstance(school_raw, dict):
        mechanics["school"] = school_raw.get("index", "evocation")
    else:
        mechanics["school"] = str(school_raw).lower()

    # Data Source 1: Nested "damage" object
    damage_info = data.get("damage", {})
    
    # Damage Type
    dtype_raw = damage_info.get("damage_type", {})
    if isinstance(dtype_raw, dict):
        mechanics["damage_type"] = dtype_raw.get("index", "force")
    else:
        mechanics["damage_type"] = str(dtype_raw).lower() if dtype_raw else "force"
    
    # Damage Dice
    damage_slots = damage_info.get("damage_at_slot_level", {})
    base_damage_str = "0d0"
    
    if damage_slots:
        levels = sorted([int(k) for k in damage_slots.keys()])
        if levels:
            base_damage_str = damage_slots[str(levels[0])]
    
    with open("debug_srd.log", "a") as f:
        f.write(f"DEBUG: Initial base_damage_str: '{base_damage_str}'\\n")

    # Data Source 2: Regex extraction from Description (Open5e Fallback)
    if base_damage_str == "0d0":
        with open("debug_srd.log", "a") as f:
            f.write(f"DEBUG: base_damage_str is 0d0. Checking fallbacks.\\n")
        if "damage_dice" in damage_info:
             base_damage_str = damage_info["damage_dice"]
        elif "dice" in data:
             base_damage_str = data["dice"]
        else:
            # Last Resort: Regex "8d6" from desc
            desc = data.get("desc", "")
            # print(f"DEBUG: Desc length: {len(desc)}")
            match = re.search(r"(\d+)d(\d+)", desc)
            if match:
                base_damage_str = match.group(0)
                print(f"DEBUG: Regex matched: {base_damage_str}")
                # Try to find damage type near it? Too complex.
                # Just default to force or try simplistic lookahead
                if "fire" in desc.lower(): mechanics["damage_type"] = "fire"
                elif "cold" in desc.lower(): mechanics["damage_type"] = "cold"
                elif "lightning" in desc.lower(): mechanics["damage_type"] = "lightning"
                elif "necrotic" in desc.lower(): mechanics["damage_type"] = "necrotic"
                elif "radiant" in desc.lower(): mechanics["damage_type"] = "radiant"
            else:
                print("DEBUG: Regex failed to match.")

    c, s, m = parse_dice_string(base_damage_str)
    mechanics["damage_dice_count"] = c
    mechanics["damage_dice_sides"] = s
    mechanics["damage_modifier"] = m
    
    # Parse Saving Throw
    dc_info = data.get("dc", {})
    if dc_info:
        dc_type_raw = dc_info.get("dc_type", {})
        if isinstance(dc_type_raw, dict):
             mechanics["save_stat"] = dc_type_raw.get("index", "dex")
        else:
             mechanics["save_stat"] = str(dc_type_raw).lower()
        mechanics["save_success"] = dc_info.get("dc_success", "half")
    else:
        # Fallback: check desc for "Make a Dexterity saving throw"
        desc = data.get("desc", "").lower()
        if "dexterity saving throw" in desc:
            mechanics["save_stat"] = "dex"
        elif "constitution saving throw" in desc:
             mechanics["save_stat"] = "con"
        elif "wisdom saving throw" in desc:
             mechanics["save_stat"] = "wis"
        else:
            mechanics["save_stat"] = None
        
        mechanics["save_success"] = "half" # Default assumption for damaging spells

    # Attack Roll?
    mechanics["requires_attack_roll"] = "attack_type" in data or "spell attack" in data.get("desc", "").lower()

    return mechanics

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
    
    # Extract Resistances and Immunities
    resistances = data.get("damage_resistances", [])
    if isinstance(resistances, list):
         # Normalize to simple strings
         # SRD sometimes has strings "Fire", sometimes objects?
         # Usually strings.
         resistances = [r for r in resistances if isinstance(r, str)]
    else:
        resistances = []

    immunities = data.get("damage_immunities", [])
    if isinstance(immunities, list):
        immunities = [i for i in immunities if isinstance(i, str)]
    else:
        immunities = []

    stats = {
        "name": data.get("name", "Unknown Monster"),
        "ac": ac,
        "hp_max": data.get("hit_points", 10),
        "cr": data.get("challenge_rating", 0),
        "type": data.get("type", "unknown"),
        "dex_modifier": dex_mod,
        "actions": actions,
        "resistances": resistances,
        "immunities": immunities
    }

    # Apply Errata / Patches
    return _apply_monster_errata(monster_id, stats)

def _apply_monster_errata(monster_id: str, stats: dict) -> dict:
    """Apply hardcoded fixes for specific monsters based on Errata."""
    # Blue Dracolich (example ID assumption, checking name mostly)
    if "dracolich" in stats["name"].lower() and "blue" in stats["name"].lower():
         if "lightning" not in stats["immunities"]:
             stats["immunities"].append("lightning")
         stats["type"] = "undead"

    # Assassin (often missing poison damage on shortsword/crossbow)
    if stats["name"].lower() == "assassin":
        # Ensure poison damage is accounted for? 
        # For now, just ensuring type is Humanoid
        if stats["type"] == "unknown":
             stats["type"] = "humanoid (any race)"
    
    # Banshee (Wail DC often 13, check if needs adjustment)
    if stats["name"].lower() == "banshee":
        # SRD Banshee is usually fine, but example fix:
        stats["type"] = "undead"
        
    return stats

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
        "components": data.get("components", []),
        "requires_concentration": data.get("concentration", False),
    }

    # Handle School (Dict vs String)
    school_raw = data.get("school", {})
    if isinstance(school_raw, dict):
        mechanics["school"] = school_raw.get("index", "evocation")
    else:
        mechanics["school"] = str(school_raw).lower()

    # Parse Damage
    # SRD format: "damage": {"damage_at_slot_level": {"3": "8d6"}, "damage_type": {"index": "fire"}}
    damage_info = data.get("damage", {})
    
    # Handle Damage Type
    dtype_raw = damage_info.get("damage_type", {})
    if isinstance(dtype_raw, dict):
        mechanics["damage_type"] = dtype_raw.get("index", "force")
    else:
         mechanics["damage_type"] = str(dtype_raw).lower()
    
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
        # Handle DC Type
        dc_type_raw = dc_info.get("dc_type", {})
        if isinstance(dc_type_raw, dict):
             mechanics["save_stat"] = dc_type_raw.get("index", "dex")
        else:
             mechanics["save_stat"] = str(dc_type_raw).lower()
             
        mechanics["save_success"] = dc_info.get("dc_success", "half") # "half" or "none"
    else:
        mechanics["save_stat"] = None

    # Attack Roll?
    mechanics["requires_attack_roll"] = "attack_type" in data

    return mechanics

def search_monsters(query: str, limit: int = 10) -> list[dict]:
    """
    Search for monsters by name.
    Returns a list of simplified monster objects {id, name, cr, type}.
    """
    db = get_db()
    # Safe parameter substitution for MATCH
    # FTS4/5 search: SELECT ... FROM table_fts WHERE table_fts MATCH 'query'
    # The srd_mechanic_fts usually contains the content/name of the mechanic
    
    rows = db.execute(
        """
        SELECT m.id, m.data_json 
        FROM srd_mechanic m
        JOIN srd_mechanic_fts fts ON m.id = fts.id
        WHERE m.type = 'monster' 
        AND srd_mechanic_fts MATCH ?
        LIMIT ?
        """,
        (query, limit)
    ).fetchall()
    
    results = []
    for row in rows:
        data = json.loads(row["data_json"])
        results.append({
            "id": row["id"],
            "name": data.get("name", "Unknown"),
            "cr": data.get("challenge_rating", 0),
            "type": data.get("type", "monster"),
            "hp": data.get("hit_points", 0),
            "ac": data.get("armor_class", [{"value": 0}])[0].get("value", 0) if isinstance(data.get("armor_class"), list) else data.get("armor_class", 0)
        })
        
    return results
