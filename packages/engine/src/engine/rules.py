"""
Dungeon Cortex — Rules Validator (§3.2)
Validates actions against SRD 5.1 mechanical constraints.
Second Law: State is Truth — if the DB says no, the action is rejected.
"""

from typing import Optional


def ability_modifier(score: int) -> int:
    """Calculate ability modifier from ability score (SRD 5.1 formula)."""
    return (score - 10) // 2


def proficiency_bonus(level: int) -> int:
    """
    Calculate proficiency bonus from character level (SRD 5.1).
    Levels 1-4: +2, 5-8: +3, 9-12: +4, 13-16: +5, 17-20: +6
    """
    if level < 1:
        raise ValueError("Character level must be at least 1")
    return (level - 1) // 4 + 2


def validate_spell_slot(
    spell_level: int,
    available_slots: dict[int, int],
) -> bool:
    """
    Check if the character has an available spell slot of the given level.
    Second Law enforcement: no slot = no spell, regardless of narrative.

    Args:
        spell_level: Level of the spell being cast (1-9)
        available_slots: Dict mapping slot level -> remaining count

    Returns:
        True if a slot is available at the requested level or higher
    """
    if spell_level < 1 or spell_level > 9:
        raise ValueError(f"Invalid spell level: {spell_level}")

    return available_slots.get(spell_level, 0) > 0


def validate_item_usage(
    item_charges: int,
    charges_required: int = 1,
) -> bool:
    """
    Validate that an item has sufficient charges for use.
    Second Law: if current_charges < required, the action is REJECTED.
    """
    return item_charges >= charges_required


def calculate_armor_class(
    base_ac: int,
    dex_modifier: int,
    shield_bonus: int = 0,
    max_dex_bonus: Optional[int] = None,
) -> int:
    """
    Calculate total Armor Class.

    Args:
        base_ac: Base AC from armor (10 for unarmored)
        dex_modifier: Character's DEX modifier
        shield_bonus: +2 if shield equipped, else 0
        max_dex_bonus: Max DEX bonus allowed by armor type (None = unlimited)
    """
    effective_dex = min(dex_modifier, max_dex_bonus) if max_dex_bonus is not None else dex_modifier
    return base_ac + effective_dex + shield_bonus
