import json
from uuid import uuid4
from .db import get_db
from .dice import roll

def create_inventory_item(character_id: str, template_id: str, location: str = "backpack") -> dict:
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
    visual_asset_url = "" # To be filled by Visual Vault later

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
        i.id, i.character_id, i.template_id, i.location, i.slot_type, i.current_charges,
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
        
        item = {
            "instance_id": row["id"],
            "template_id": row["template_id"],
            "name": srd_data.get("name", "Unknown Item"),
            "location": row["location"],
            "slot_type": row["slot_type"],
            "charges": row["current_charges"],
            "stats": srd_data # Embed full stats for frontend convenience
        }
        results.append(item)
        
    return results

def generate_loot(cr: int = 1) -> list[str]:
    """
    Generate random loot based on Challenge Rating.
    Returns a list of template_ids.
    """
    db = get_db()
    
    # Simple Logic for Phase 3f: 
    # Fetch random items from srd_mechanic
    # Higher CR = more items (very basic)
    
    count = max(1, roll(1, 4).total + (cr // 5)) # 1d4 items
    
    # Get random items
    # In a real system, we'd filter by rarity/tables.
    sql = "SELECT id FROM srd_mechanic WHERE type IN ('item', 'magic_item') ORDER BY RANDOM() LIMIT ?"
    
    rows = db.execute(sql, (count,)).fetchall()
    return [row["id"] for row in rows]

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
        
    # 2. Check if slot is occupied
    existing = db.execute("SELECT id FROM inventory_item WHERE character_id = ? AND location = ?", (character_id, slot)).fetchone()
    if existing:
        # Move existing item to backpack
        db.execute("UPDATE inventory_item SET location = 'backpack' WHERE id = ?", (existing["id"],))
        
    # 3. Equip new item
    db.execute("UPDATE inventory_item SET location = ? WHERE id = ?", (slot, item_id))
    db.commit()
    
    return {"message": f"Equipped item {item_id} to {slot}"}

def unequip_item(character_id: str, item_id: str) -> dict:
    """
    Unequip an item, moving it back to 'backpack'.
    """
    db = get_db()
    
    db.execute("UPDATE inventory_item SET location = 'backpack' WHERE id = ? AND character_id = ?", (item_id, character_id))
    db.commit()
    
    return {"message": f"Unequipped item {item_id}"}

