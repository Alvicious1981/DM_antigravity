import unittest
import sqlite3
import json
from unittest.mock import patch, MagicMock

# Import generic models to setup schema
# We need to make sure we can import these. 
# run_tests.py sets up the path for 'engine', but maybe not 'db_schema'?
# We'll see. 
# Ideally we should use the same init_db logic.

from engine.inventory import create_inventory_item, get_inventory, generate_loot

class TestInventory(unittest.TestCase):
    
    def setUp(self):
        # Create in-memory DB
        self.conn = sqlite3.connect(":memory:")
        self.conn.row_factory = sqlite3.Row
        
        # Initialize Schema (Manual simplified for raw SQL testing)
        # We don't want to depend on SQLModel in unit tests if we can avoid complex setup
        # Just creating the tables we need.
        
        self.conn.execute("""
        CREATE TABLE srd_mechanic (
            id TEXT PRIMARY KEY,
            type TEXT,
            data_json JSON,
            data_es JSON
        )
        """)
        
        self.conn.execute("""
        CREATE TABLE inventory_item (
            id TEXT PRIMARY KEY,
            character_id TEXT,
            template_id TEXT,
            location TEXT,
            slot_type TEXT,
            grid_index INTEGER,
            current_charges INTEGER,
            is_identified BOOLEAN,
            visual_asset_url TEXT,
            FOREIGN KEY(template_id) REFERENCES srd_mechanic(id)
        )
        """)
        
        # Seed Data
        self.conn.execute("""
        INSERT INTO srd_mechanic (id, type, data_json) VALUES
        ('item_potion', 'item', '{"name": "Potion of Healing"}'),
        ('item_sword', 'magic_item', '{"name": "Vorpal Sword"}')
        """)
        self.conn.commit()
        
        # Patch get_db
        self.patcher = patch('engine.inventory.get_db', return_value=self.conn)
        self.mock_get_db = self.patcher.start()
        
    def tearDown(self):
        self.patcher.stop()
        self.conn.close()
        
    def test_create_and_get_inventory(self):
        # Create
        item = create_inventory_item("char1", "item_potion")
        self.assertEqual(item["character_id"], "char1")
        self.assertEqual(item["template_id"], "item_potion")
        
        # Get
        inventory = get_inventory("char1")
        self.assertEqual(len(inventory), 1)
        self.assertEqual(inventory[0]["name"], "Potion of Healing")
        self.assertEqual(inventory[0]["location"], "backpack")
        
    def test_generate_loot(self):
        # Patched dice roll would be better reliability, but let's trust the random
        # CR 1 -> 1d4 items
        # We just check it returns IDs that exist in DB
        
        # We need to make sure generate_loot uses our DB
        loot = generate_loot(1)
        self.assertTrue(len(loot) >= 1)
        self.assertIn(loot[0], ['item_potion', 'item_sword'])
        
if __name__ == '__main__':
    unittest.main()
