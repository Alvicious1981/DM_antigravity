
import sys
import os
import json

# Add package root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))

from engine.inventory import generate_loot, distribute_loot, get_inventory
from engine.db import get_db

def test_loot():
    print("Testing Loot Generation...")
    
    # Test CR 1 Loot
    loot_cr1 = generate_loot(cr=1)
    print(f"CR 1 Loot: {len(loot_cr1)} items")
    assert len(loot_cr1) > 0, "CR 1 should generate at least 1 item"
    
    # Test CR 10 Loot
    loot_cr10 = generate_loot(cr=10)
    print(f"CR 10 Loot: {len(loot_cr10)} items")
    assert len(loot_cr10) >= 1, "CR 10 should generate items"
    
    # Test Distribute
    print("Testing Loot Distribution...")
    test_char_id = "test_char_loot"
    
    # Clean up previous test
    db = get_db()
    db.execute("DELETE FROM inventory_item WHERE character_id = ?", (test_char_id,))
    db.commit()
    
    distributed = distribute_loot(test_char_id, loot_cr1)
    print(f"Distributed {len(distributed)} items to {test_char_id}")
    
    inventory = get_inventory(test_char_id)
    print(f"Inventory Count: {len(inventory)}")
    
    assert len(inventory) == len(loot_cr1), "Inventory count mismatch"
    
    # Check Rarity in distributed items
    for item in distributed:
        print(f"Item: {item['name']} ({item['rarity']})")
        assert "rarity" in item, "Item missing rarity"
        
    print("Loot Tests Passed!")

if __name__ == "__main__":
    try:
        test_loot()
    except Exception as e:
        print(f"Test Failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
