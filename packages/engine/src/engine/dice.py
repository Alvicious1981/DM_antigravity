"""
Dungeon Cortex — Dice Engine (§3.2)
Cryptographically secure random number generation for all game mechanics.
The AI NEVER rolls dice. Only this module does.
"""

import secrets
from dataclasses import dataclass


@dataclass(frozen=True)
class DiceResult:
    """Immutable result of a dice roll."""
    rolls: tuple[int, ...]
    modifier: int
    total: int
    notation: str  # e.g. "2d6+3"

    @property
    def natural_total(self) -> int:
        """Sum of dice without modifier."""
        return sum(self.rolls)


def roll(sides: int, count: int = 1, modifier: int = 0) -> DiceResult:
    """
    Roll `count` dice with `sides` faces each, plus a flat modifier.
    Uses secrets.randbelow for cryptographically secure RNG.

    Args:
        sides: Number of faces per die (e.g. 20 for d20)
        count: Number of dice to roll (e.g. 2 for 2d6)
        modifier: Flat bonus/penalty to add to total

    Returns:
        Immutable DiceResult with individual rolls and computed total
    """
    if sides < 1 or count < 1:
        raise ValueError(f"Invalid dice: {count}d{sides}")

    rolls = tuple(secrets.randbelow(sides) + 1 for _ in range(count))
    total = sum(rolls) + modifier
    notation = f"{count}d{sides}" + (f"+{modifier}" if modifier > 0 else f"{modifier}" if modifier < 0 else "")

    return DiceResult(rolls=rolls, modifier=modifier, total=total, notation=notation)


def d20(modifier: int = 0) -> DiceResult:
    """Standard d20 roll (ability checks, attacks, saves)."""
    return roll(20, 1, modifier)


def damage(sides: int, count: int, modifier: int = 0) -> DiceResult:
    """Roll damage dice (e.g. 2d6+3 for greatsword)."""
    return roll(sides, count, modifier)
