import sys
import unittest
from unittest.mock import MagicMock
import json
import sqlite3
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent / "src"))

from engine.spells import _parse_spell, Spell

class TestSpells(unittest.TestCase):
    def test_parse_fireball(self):
        # Mock a row
        data_json = {
            "name": "Fireball",
            "level": 3,
            "school": {"name": "Evocation"},
            "casting_time": "1 action",
            "range": "150 feet",
            "components": ["V", "S", "M"],
            "duration": "Instantaneous",
            "desc": ["A bright streak flashes...", "Each creature... must make a Dexterity saving throw."],
            "damage": {
                "damage_type": {"name": "Fire"},
                "damage_at_slot_level": {"3": "8d6"}
            }
        }
        
        row = MagicMock(spec=sqlite3.Row)
        row.__getitem__ = MagicMock(side_effect=lambda k: {
            "id": "spell_fireball",
            "data_json": json.dumps(data_json),
            "data_es": None
        }[k])
        
        spell = _parse_spell(row)
        
        self.assertEqual(spell.name, "Fireball")
        self.assertEqual(spell.level, 3)
        self.assertEqual(spell.school, "Evocation")
        self.assertEqual(spell.damage_dice_count, 8)
        self.assertEqual(spell.damage_dice_sides, 6)
        self.assertEqual(spell.damage_type, "fire")
        self.assertTrue(spell.is_save) # "saving throw" not in desc? Wait.

    def test_mechanics_inference(self):
        # parsing depends on description text
        data_json = {
            "name": "Test Spell",
            "desc": ["Make a melee spell attack...", "Target must make a Dexterity saving throw."],
        }
        row = MagicMock(spec=sqlite3.Row)
        row.__getitem__ = MagicMock(side_effect=lambda k: {
            "id": "test", 
            "data_json": json.dumps(data_json), 
            "data_es": None
        }[k])

        spell = _parse_spell(row)
        self.assertTrue(spell.is_attack)
        self.assertTrue(spell.is_save)
        self.assertEqual(spell.save_stat, "dex")

if __name__ == '__main__':
    unittest.main()
