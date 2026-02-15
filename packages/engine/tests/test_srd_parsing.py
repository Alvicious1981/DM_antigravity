"""
Robust Unit Tests — SRD Parsing (srd_queries.py)
Focus on whitespace resilience and varied JSON formats.
"""

import pytest
from engine.srd_queries import parse_dice_string

@pytest.mark.parametrize("dice_str, expected", [
    ("1d8", (1, 8, 0)),
    ("2d10+5", (2, 10, 5)),
    ("1d4-1", (1, 4, -1)),
    ("1d6 + 2", (1, 6, 2)),
    ("2d4 - 3", (2, 4, -3)),
    (" 1 d 8 ", (1, 8, 0)),  # Extreme whitespace
    ("1d20+10", (1, 20, 10)),
    ("", (0, 0, 0)),
    (None, (0, 0, 0)),
    ("invalid", (0, 0, 0)),
    ("10", (0, 0, 0)),
    ("d20", (0, 0, 0)),
])
def test_parse_dice_string_robustness(dice_str, expected):
    """Verify that parsing handles whitespace and edge cases gracefully."""
    assert parse_dice_string(dice_str) == expected

def test_parse_dice_string_large_values():
    """Verify parsing large dice counts and sides."""
    assert parse_dice_string("100d100+100") == (100, 100, 100)
