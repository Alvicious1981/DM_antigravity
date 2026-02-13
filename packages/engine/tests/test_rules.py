"""
Unit Tests — Rules Engine (rules.py)
SRD 5.1 rule validators — mathematical correctness is non-negotiable.
"""

import pytest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from engine.rules import ability_modifier, proficiency_bonus, validate_spell_slot


class TestAbilityModifier:
    """Tests for ability_modifier() — the foundation of D&D 5e math."""

    def test_standard_modifiers(self):
        """Core SRD modifier table."""
        assert ability_modifier(1) == -5
        assert ability_modifier(2) == -4
        assert ability_modifier(3) == -4
        assert ability_modifier(8) == -1
        assert ability_modifier(9) == -1
        assert ability_modifier(10) == 0
        assert ability_modifier(11) == 0
        assert ability_modifier(12) == 1
        assert ability_modifier(13) == 1
        assert ability_modifier(14) == 2
        assert ability_modifier(15) == 2
        assert ability_modifier(16) == 3
        assert ability_modifier(17) == 3
        assert ability_modifier(18) == 4
        assert ability_modifier(19) == 4
        assert ability_modifier(20) == 5

    def test_formula(self):
        """Verify formula: (score - 10) // 2"""
        for score in range(1, 30):
            assert ability_modifier(score) == (score - 10) // 2

    def test_high_scores(self):
        """Monster-level ability scores (up to 30)."""
        assert ability_modifier(24) == 7
        assert ability_modifier(30) == 10


class TestProficiencyBonus:
    """Tests for proficiency_bonus() — scales with character level."""

    def test_level_ranges(self):
        """SRD proficiency bonus by level."""
        assert proficiency_bonus(1) == 2
        assert proficiency_bonus(4) == 2
        assert proficiency_bonus(5) == 3
        assert proficiency_bonus(8) == 3
        assert proficiency_bonus(9) == 4
        assert proficiency_bonus(12) == 4
        assert proficiency_bonus(13) == 5
        assert proficiency_bonus(16) == 5
        assert proficiency_bonus(17) == 6
        assert proficiency_bonus(20) == 6

    def test_all_valid_levels(self):
        """Every level 1-20 should return a bonus between 2 and 6."""
        for level in range(1, 21):
            bonus = proficiency_bonus(level)
            assert 2 <= bonus <= 6, f"Level {level} gave bonus {bonus}"


class TestValidateSpellSlot:
    """Tests for validate_spell_slot() — prevents illegal casting."""

    def test_valid_casting(self):
        """A level 3 spell with a level 3 slot available should be valid."""
        slots = {1: 4, 2: 3, 3: 2}
        assert validate_spell_slot(spell_level=3, available_slots=slots) is True

    def test_no_slots_remaining(self):
        """No slots at the spell's level means casting is invalid."""
        slots = {1: 4, 2: 3, 3: 0}
        assert validate_spell_slot(spell_level=3, available_slots=slots) is False

    def test_missing_slot_level(self):
        """If the dict has no key for the spell level, return False."""
        slots = {1: 4, 2: 3}  # No level 5 slots at all
        assert validate_spell_slot(spell_level=5, available_slots=slots) is False

    def test_invalid_spell_level_raises(self):
        """Spell levels outside 1-9 should raise ValueError."""
        with pytest.raises(ValueError):
            validate_spell_slot(spell_level=0, available_slots={})
        with pytest.raises(ValueError):
            validate_spell_slot(spell_level=10, available_slots={})
