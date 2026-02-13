"""
Unit Tests — Dice Engine (dice.py)
Testing the First Law: Code is Law.
Deterministic dice mechanics must be provably correct.
"""

import pytest
import sys
from pathlib import Path

# Add engine src to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from engine.dice import roll, d20, damage, DiceResult


class TestDiceResult:
    """Tests for the DiceResult dataclass."""

    def test_dice_result_is_frozen(self):
        result = roll(6, count=1, modifier=0)
        with pytest.raises(AttributeError):
            result.total = 999  # type: ignore

    def test_natural_total_excludes_modifier(self):
        result = roll(6, count=2, modifier=5)
        assert result.natural_total == sum(result.rolls)
        assert result.total == result.natural_total + 5


class TestRoll:
    """Tests for the general-purpose roll() function."""

    def test_single_d6(self):
        result = roll(6)
        assert 1 <= result.total <= 6
        assert len(result.rolls) == 1
        assert result.modifier == 0
        assert "1d6" in result.notation

    def test_multiple_dice(self):
        result = roll(6, count=4)
        assert len(result.rolls) == 4
        assert all(1 <= r <= 6 for r in result.rolls)
        assert result.total == sum(result.rolls)

    def test_modifier_applied(self):
        result = roll(6, count=1, modifier=3)
        assert result.modifier == 3
        assert result.total == result.rolls[0] + 3
        assert "+3" in result.notation

    def test_negative_modifier(self):
        result = roll(6, count=1, modifier=-2)
        assert result.modifier == -2

    def test_d20_range(self):
        """Roll d20 1000 times and verify range."""
        for _ in range(1000):
            result = roll(20)
            assert 1 <= result.rolls[0] <= 20

    def test_large_roll(self):
        result = roll(6, count=8)
        assert 8 <= result.total <= 48
        assert len(result.rolls) == 8

    def test_notation_format(self):
        result = roll(8, count=2, modifier=5)
        assert result.notation == "2d8+5"


class TestD20:
    """Tests for the d20() convenience function."""

    def test_d20_no_modifier(self):
        result = d20()
        assert 1 <= result.total <= 20
        assert len(result.rolls) == 1
        assert result.modifier == 0

    def test_d20_with_modifier(self):
        result = d20(modifier=5)
        assert 6 <= result.total <= 25
        assert result.modifier == 5

    def test_d20_natural_20_possible(self):
        """Verify nat 20 can occur (statistical test, run enough times)."""
        results = [d20().rolls[0] for _ in range(1000)]
        assert 20 in results, "No natural 20 in 1000 rolls — RNG suspect"

    def test_d20_natural_1_possible(self):
        """Verify nat 1 can occur."""
        results = [d20().rolls[0] for _ in range(1000)]
        assert 1 in results, "No natural 1 in 1000 rolls — RNG suspect"


class TestDamage:
    """Tests for the damage() convenience function."""

    def test_basic_damage(self):
        result = damage(6, count=2, modifier=3)
        assert 5 <= result.total <= 15  # 2d6+3 = 5 to 15
        assert len(result.rolls) == 2
        assert result.modifier == 3

    def test_fireball_damage(self):
        """Fireball: 8d6 fire damage. Range = 8-48."""
        result = damage(6, count=8)
        assert 8 <= result.total <= 48

    def test_greatsword_damage(self):
        """Greatsword: 2d6 + STR mod."""
        result = damage(6, count=2, modifier=4)
        assert 6 <= result.total <= 16

    def test_damage_no_modifier(self):
        result = damage(8, count=1)
        assert 1 <= result.total <= 8
        assert result.modifier == 0
