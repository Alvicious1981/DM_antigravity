from dataclasses import dataclass
from typing import List, Optional, Tuple, Dict, Any
import sqlite3
import json
from pathlib import Path

# Database path
ROOT = Path(__file__).resolve().parent.parent.parent.parent.parent
DB_PATH = ROOT / "packages" / "engine" / "dungeon_cortex_dev.db"

@dataclass(frozen=True)
class Spell:
    id: str
    name: str
    level: int
    school: str
    casting_time: str
    range: str
    components: str
    duration: str
    description: str
    
    # Spanish Localization
    name_es: Optional[str] = None
    description_es: Optional[str] = None
    
    # Mechanics
    is_attack: bool = False
    is_save: bool = False
    save_stat: Optional[str] = None
    damage_dice_sides: int = 0
    damage_dice_count: int = 0
    damage_type: str = ""
    aoe_radius: int = 0
    condition: Optional[str] = None

def get_db_connection():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def _parse_spell(row: sqlite3.Row) -> Spell:
    data = json.loads(row["data_json"])
    data_es = _load_spanish_data(row)
    
    mechanics = _extract_mechanics(data)
    spanish_info = _extract_spanish_info(data_es)
    damage_info = _extract_damage(data)
    
    return Spell(
        id=row["id"],
        name=_safe_get(data, "name", "Unknown"),
        level=_safe_get(data, "level", 0),
        school=_extract_school(data),
        casting_time=_safe_get(data, "casting_time", "Unknown"),
        range=_safe_get(data, "range", "Unknown"),
        components=_extract_components(data),
        duration=_safe_get(data, "duration", "Unknown"),
        description=_extract_description(data),
        name_es=spanish_info["name"],
        description_es=spanish_info["description"],
        is_attack=mechanics["is_attack"],
        is_save=mechanics["is_save"],
        save_stat=mechanics["save_stat"],
        damage_dice_sides=damage_info["sides"],
        damage_dice_count=damage_info["count"],
        damage_type=damage_info["type"],
        aoe_radius=_extract_aoe(data)
    )

def _extract_aoe(data: Dict) -> int:
    aoe = data.get("area_of_effect", {})
    return aoe.get("size", 0)

def _load_spanish_data(row: sqlite3.Row) -> Dict[str, Any]:
    if not row["data_es"]:
        return {}
    return json.loads(row["data_es"])

def _safe_get(data: Dict, key: str, default: Any) -> Any:
    return data.get(key, default)

def _extract_school(data: Dict) -> str:
    school_data = data.get("school", {})
    if isinstance(school_data, dict):
        return school_data.get("name", "Unknown")
    return str(school_data)

def _extract_components(data: Dict) -> str:
    components = data.get("components", [])
    if isinstance(components, list):
        return ",".join(components)
    return str(components)

def _extract_description(data: Dict) -> str:
    lines = data.get("desc", [])
    return "\n".join(lines)

def _extract_spanish_info(data_es: Dict) -> Dict[str, Optional[str]]:
    name = data_es.get("name")
    desc_lines = data_es.get("desc")
    
    if not desc_lines:
        return {"name": name, "description": None}
        
    return {"name": name, "description": "\n".join(desc_lines)}

def _extract_mechanics(data: Dict) -> Dict[str, Any]:
    desc = _extract_description(data).lower()
    is_attack = "attack" in desc or "spell attack" in desc
    is_save = "saving throw" in desc
    save_stat = _find_save_stat(desc) if is_save else None
    
    return {
        "is_attack": is_attack,
        "is_save": is_save,
        "save_stat": save_stat
    }

def _find_save_stat(description: str) -> Optional[str]:
    stats = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"]
    for stat in stats:
        if stat in description:
            return stat[:3]
    return None

def _extract_damage(data: Dict) -> Dict[str, Any]:
    damage_data = data.get("damage", {})
    if not damage_data:
        return {"sides": 0, "count": 0, "type": ""}
    
    return _parse_damage_data(damage_data)

def _parse_damage_data(damage_data: Dict) -> Dict[str, Any]:
    dtype_obj = damage_data.get("damage_type", {})
    if isinstance(dtype_obj, dict):
        dtype = dtype_obj.get("name", "").lower()
    else:
        dtype = str(dtype_obj).lower() if dtype_obj else ""
    
    damage_at_slot = damage_data.get("damage_at_slot_level")
    character_damage = damage_data.get("damage_at_character_level")
    damage_dict = damage_at_slot or character_damage
    
    if not damage_dict:
        return {"sides": 0, "count": 0, "type": dtype}
        
    return _parse_dice_from_slots(damage_dict, dtype)

def _get_sort_key(k: str) -> int:
    if k.isdigit():
        return int(k)
    return 99

def _parse_dice_from_slots(damage_dict: Dict, dtype: str) -> Dict[str, Any]:
    keys = list(damage_dict.keys())
    sorted_keys = sorted(keys, key=_get_sort_key)
    first_key = sorted_keys[0]
    dice_str = damage_dict[first_key]
    
    return _parse_dice_string(dice_str, dtype)

def _parse_dice_string(dice_str: str, dtype: str) -> Dict[str, Any]:
    if not dice_str:
        return {"sides": 0, "count": 0, "type": dtype}
        
    # Remove all whitespace
    dice_str = dice_str.replace(" ", "")
    
    # Simple regex for XdY
    import re
    match = re.search(r"(\d+)d(\d+)", dice_str)
    if match:
        return {
            "sides": int(match.group(2)),
            "count": int(match.group(1)),
            "type": dtype
        }
        
    return {"sides": 0, "count": 0, "type": dtype}

def get_all_spells() -> List[Spell]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, data_json, data_es FROM srd_mechanic WHERE type = 'spell'")
    rows = cursor.fetchall()
    conn.close()
    
    return [_parse_spell(row) for row in rows]

def get_spell(spell_id: str) -> Optional[Spell]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, data_json, data_es FROM srd_mechanic WHERE id = ?", (spell_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return None
        
    return _parse_spell(row)
