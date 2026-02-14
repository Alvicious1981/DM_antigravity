import unittest
from unittest.mock import patch, MagicMock
from src.engine.srd_queries import get_spell_mechanics, get_monster_stats

class TestSRDQueries(unittest.TestCase):

    @patch('src.engine.srd_queries.get_db')
    def test_get_spell_fireball(self, mock_get_db):
        # Mock DB response for Fireball
        mock_row = {
            "id": "spell_fireball",
            "type": "spell",
            "data_json": """{
                "name": "Fireball",
                "level": 3,
                "school": {"index": "evocation"},
                "components": ["V", "S", "M"],
                "concentration": false,
                "damage": {
                    "damage_type": {"index": "fire"},
                    "damage_at_slot_level": {"3": "8d6", "4": "9d6"}
                },
                "dc": {
                    "dc_type": {"index": "dex"},
                    "dc_success": "half"
                }
            }""",
            "data_es": "{}"
        }
        
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = mock_row
        mock_get_db.return_value.execute.return_value = mock_cursor

        mechanics = get_spell_mechanics("spell_fireball")
        
        self.assertEqual(mechanics["name"], "Fireball")
        self.assertEqual(mechanics["level"], 3)
        self.assertEqual(mechanics["damage_dice_count"], 8)
        self.assertEqual(mechanics["damage_dice_sides"], 6)
        self.assertEqual(mechanics["save_stat"], "dex")
        self.assertEqual(mechanics["save_success"], "half")

    @patch('src.engine.srd_queries.get_db')
    def test_get_spell_magic_missile(self, mock_get_db):
        # Magic Missile: 1d4+1 per dart. SRD usually says "1d4 + 1" or similar
        mock_row = {
            "id": "spell_magic_missile",
            "type": "spell",
            "data_json": """{
                "name": "Magic Missile",
                "level": 1,
                "damage": {
                    "damage_type": {"index": "force"},
                    "damage_at_slot_level": {"1": "1d4 + 1"}
                }
            }""",
            "data_es": "{}"
        }
        
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = mock_row
        mock_get_db.return_value.execute.return_value = mock_cursor

        mechanics = get_spell_mechanics("spell_magic_missile")
        
        # Current logic might fail on "1d4 + 1"
        # Let's see what happens. If it fails, we fix the code.
        self.assertEqual(mechanics["name"], "Magic Missile")
        # Expecting failure or naive parsing here if code is not robust
        # The current code: parts = "1d4 + 1".split("d") -> "1", "4 + 1" -> int("4 + 1") -> ERROR

    @patch('src.engine.srd_queries.get_db')
    def test_get_spell_utility(self, mock_get_db):
        # Light (Cantrip) - No damage
        mock_row = {
            "id": "spell_light",
            "type": "spell",
            "data_json": """{
                "name": "Light",
                "level": 0,
                "school": {"index": "evocation"}
            }""",
            "data_es": "{}"
        }
        
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = mock_row
        mock_get_db.return_value.execute.return_value = mock_cursor

        mechanics = get_spell_mechanics("spell_light")
        
        self.assertEqual(mechanics["name"], "Light")
        self.assertEqual(mechanics["damage_dice_count"], 0)
        self.assertEqual(mechanics["damage_dice_sides"], 0)


    @patch('src.engine.srd_queries.get_db')
    def test_get_monster_goblin(self, mock_get_db):
        # Mock DB response for Goblin
        # Actions: Scimitar. Melee Weapon Attack: +4 to hit... Hit: 5 (1d6 + 2) slashing damage.
        mock_row = {
            "id": "monster_goblin",
            "type": "monster",
            "data_json": """{
                "name": "Goblin",
                "hit_points": 7,
                "armor_class": [{"value": 15, "type": "armor"}],
                "challenge_rating": 0.25,
                "actions": [
                    {
                        "name": "Scimitar",
                        "desc": "Melee Weapon Attack: +4 to hit...",
                        "attack_bonus": 4,
                        "damage": [
                            {
                                "damage_dice": "1d6+2",
                                "damage_type": {"index": "slashing"}
                            }
                        ]
                    }
                ]
            }""",
            "data_es": "{}"
        }
        
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = mock_row
        mock_get_db.return_value.execute.return_value = mock_cursor

        stats = get_monster_stats("monster_goblin")
        
        self.assertEqual(stats["name"], "Goblin")
        self.assertEqual(stats["hp_max"], 7)
        self.assertEqual(stats["ac"], 15)
        
        # Verify Actions
        self.assertEqual(len(stats["actions"]), 1)
        action = stats["actions"][0]
        self.assertEqual(action["name"], "Scimitar")
        self.assertEqual(action["attack_bonus"], 4)
        # Detailed damage parsing check
        self.assertEqual(action["damage_dice_count"], 1)
        self.assertEqual(action["damage_dice_sides"], 6)
        self.assertEqual(action["damage_modifier"], 2)
        self.assertEqual(action["damage_type"], "slashing")

if __name__ == '__main__':
    unittest.main()
