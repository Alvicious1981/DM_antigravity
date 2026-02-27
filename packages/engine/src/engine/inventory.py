import json
from uuid import uuid4
from .db import get_db
from .dice import roll

def create_inventory_item(character_id: str, template_id: str, location: str = "backpack", visual_asset_url: str = "") -> dict:
    """
    Create a new inventory item instance from an SRD template.
    """
    db = get_db()
    item_id = str(uuid4())
    
    # Verify template exists and get default name/data if needed
    row = db.execute("SELECT data_json FROM srd_mechanic WHERE id = ?", (template_id,)).fetchone()
    if not row:
         # Placeholder fallback if template missing (shouldn't happen with full DB)
         print(f"Warning: Template {template_id} not found.")
         
    # Insert new item
    sql = """
    INSERT INTO inventory_item (id, character_id, template_id, location, slot_type, grid_index, current_charges, is_identified, visual_asset_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    # Defaults
    slot_type = None
    grid_index = 0 # Simple auto-increment logic could go here, or handled by UI
    current_charges = 0
    is_identified = True # Auto-identify for now

    db.execute(sql, (
        item_id, 
        character_id, 
        template_id, 
        location,
        slot_type,
        grid_index,
        current_charges,
        is_identified,
        visual_asset_url
    ))
    db.commit()
    
    return {
        "id": item_id,
        "character_id": character_id,
        "template_id": template_id,
        "location": location
    }

def get_inventory(character_id: str) -> list[dict]:
    """
    Get all items for a character, joined with SRD data for display.
    """
    db = get_db()
    
    sql = """
    SELECT 
        i.id, i.character_id, i.template_id, i.location, i.slot_type, i.grid_index, i.current_charges, i.visual_asset_url,
        s.data_json
    FROM inventory_item i
    LEFT JOIN srd_mechanic s ON i.template_id = s.id
    WHERE i.character_id = ?
    """
    
    rows = db.execute(sql, (character_id,)).fetchall()
    results = []
    
    for row in rows:
        # row is a sqlite3.Row object
        srd_data = json.loads(row["data_json"]) if row["data_json"] else {}
        rarity_raw = srd_data.get("rarity", "Common")
        rarity_value = rarity_raw.get("name", "Common") if isinstance(rarity_raw, dict) else rarity_raw

        item = {
            "instance_id": row["id"],
            "template_id": row["template_id"],
            "name": srd_data.get("name", "Unknown Item"),
            "location": row["location"],
            "slot_type": row["slot_type"],
            "grid_index": row["grid_index"],
            "charges": row["current_charges"],
            "stats": srd_data,
            "visual_asset_url": row["visual_asset_url"],
            "rarity": rarity_value or "Common",
            "attunement": True if srd_data.get("requires_attunement") else False
        }
        results.append(item)
        
    return results


def generate_loot(cr: int = 1) -> list[str]:
    """
    Generate random loot based on Challenge Rating.
    Returns a list of template_ids.
    """
    db = get_db()
    import random
    
    # Fetch all items to filter in python (dataset is small)
    rows = db.execute("SELECT id, data_json FROM srd_mechanic WHERE type IN ('item', 'magic_item')").fetchall()
    
    candidates = []
    for row in rows:
        data = json.loads(row["data_json"])
        rarity_raw = data.get("rarity", "Common")
        rarity = rarity_raw.get("name", "Common") if isinstance(rarity_raw, dict) else rarity_raw
        candidates.append({"id": row["id"], "rarity": rarity})
    
    if not candidates:
        return []

    # Simple Tier Logic
    # CR 0-4: Common
    # CR 5-10: Uncommon
    # CR 11-16: Rare
    # CR 17+: Very Rare / Legendary
    target_rarity = "Common"
    if cr >= 17: target_rarity = "Very Rare"
    elif cr >= 11: target_rarity = "Rare"
    elif cr >= 5: target_rarity = "Uncommon"
    
    # Filter (allow lower tiers too)
    possible = [c for c in candidates if c["rarity"] == target_rarity or c["rarity"] == "Common"]
    if not possible:
        possible = candidates # Fallback
        
    # Count: 1d4 + CR/5
    count = max(1, roll(1, 4).total + (cr // 5))
    
    selected = random.choices(possible, k=count)
    return [s["id"] for s in selected]

def distribute_loot(target_character_id: str, item_ids: list[str]) -> list[dict]:
    """
    Add list of items to character's inventory and return the full item objects.
    """
    db = get_db()
    created_items = []
    
    for template_id in item_ids:
        # Create
        new_item = create_inventory_item(target_character_id, template_id)
        
        # Hydrate with SRD data for the event
        row = db.execute("SELECT data_json FROM srd_mechanic WHERE id = ?", (template_id,)).fetchone()
        srd_data = json.loads(row["data_json"]) if row and row["data_json"] else {}
        rarity_raw = srd_data.get("rarity", "Common")
        rarity_value = rarity_raw.get("name", "Common") if isinstance(rarity_raw, dict) else rarity_raw
        
        full_item = {
            "instance_id": new_item["id"],
            "template_id": template_id,
            "name": srd_data.get("name", "Unknown Item"),
            "location": new_item["location"],
            "slot_type": None, # Default
            "charges": 0,
            "stats": srd_data,
            "visual_asset_url": "",
            "rarity": rarity_value,
            "attunement": True if srd_data.get("requires_attunement") else False
        }
        created_items.append(full_item)
        
    return created_items

def _ensure_gold_table():
    db = get_db()
    db.execute("""
        CREATE TABLE IF NOT EXISTS character_gold (
            character_id TEXT PRIMARY KEY,
            gold INTEGER NOT NULL DEFAULT 0
        )
    """)
    db.commit()


def add_gold(character_id: str, amount: int) -> int:
    """Add gold to a character's wallet. Returns new total."""
    _ensure_gold_table()
    db = get_db()
    db.execute("""
        INSERT INTO character_gold (character_id, gold) VALUES (?, ?)
        ON CONFLICT(character_id) DO UPDATE SET gold = gold + excluded.gold
    """, (character_id, max(0, amount)))
    db.commit()
    row = db.execute("SELECT gold FROM character_gold WHERE character_id = ?", (character_id,)).fetchone()
    return row["gold"] if row else 0


def get_gold(character_id: str) -> int:
    """Return current gold balance for a character (0 if none recorded)."""
    _ensure_gold_table()
    row = get_db().execute(
        "SELECT gold FROM character_gold WHERE character_id = ?", (character_id,)
    ).fetchone()
    return row["gold"] if row else 0


def equip_item(character_id: str, item_id: str, slot: str) -> dict:
    """
    Equip an item to a specific slot (e.g. 'main_hand', 'armor').
    If slot is occupied, unequip the current item first.
    """
    db = get_db()
    
    # 1. Check if item exists and belongs to character
    item = db.execute("SELECT id, location FROM inventory_item WHERE id = ? AND character_id = ?", (item_id, character_id)).fetchone()
    if not item:
        raise ValueError("Item not found or does not belong to character.")
        
    # 2. Check if specific slot is occupied
    existing = db.execute(
        "SELECT id FROM inventory_item WHERE character_id = ? AND location = 'EQUIPPED' AND slot_type = ?", 
        (character_id, slot)
    ).fetchone()
    
    if existing:
        # Move existing item to backpack
        db.execute(
            "UPDATE inventory_item SET location = 'BACKPACK', slot_type = NULL, grid_index = 0 WHERE id = ?", 
            (existing["id"],)
        )
        
    # 3. Equip new item
    db.execute(
        "UPDATE inventory_item SET location = 'EQUIPPED', slot_type = ?, grid_index = NULL WHERE id = ?", 
        (slot, item_id)
    )
    db.commit()
    
    return {"message": f"Equipped item {item_id} to {slot}"}

def unequip_item(character_id: str, item_id: str) -> dict:
    """
    Unequip an item, moving it back to 'backpack'.
    """
    db = get_db()
    
    db.execute(
        "UPDATE inventory_item SET location = 'BACKPACK', slot_type = NULL, grid_index = 0 WHERE id = ? AND character_id = ?", 
        (item_id, character_id)
    )
    db.commit()
    
    return {"message": f"Unequipped item {item_id}"}

