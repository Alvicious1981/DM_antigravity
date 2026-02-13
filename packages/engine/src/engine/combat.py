"""
Dungeon Cortex — Combat Resolution Engine (§8.2)
Deterministic attack and damage resolution following D&D 5e SRD 5.1 rules.
First Law: Code is Law — the AI narrates, the Engine resolves.
"""

from dataclasses import dataclass
from typing import Optional

from .dice import d20, damage


@dataclass(frozen=True)
class AttackResult:
    """Immutable result of an attack action — the 'Fact Packet' for Chronos."""
    action_type: str = "attack"
    attacker_id: str = ""
    target_id: str = ""
    roll_natural: int = 0
    roll_total: int = 0
    ac_target: int = 0
    hit: bool = False
    critical: bool = False
    fumble: bool = False
    damage_total: int = 0
    damage_type: str = ""
    target_remaining_hp: int = 0
    target_status: str = "alive"

    def to_fact_packet(self) -> dict:
        """Serialize to JSON Fact Packet for the Narrative Agent."""
        return {
            "action_type": self.action_type,
            "attacker": self.attacker_id,
            "target": self.target_id,
            "roll_natural": self.roll_natural,
            "roll_total": self.roll_total,
            "ac_target": self.ac_target,
            "hit": self.hit,
            "critical": self.critical,
            "fumble": self.fumble,
            "damage_total": self.damage_total,
            "damage_type": self.damage_type,
            "target_remaining_hp": self.target_remaining_hp,
            "target_status": self.target_status,
        }


def resolve_attack(
    attacker_id: str,
    target_id: str,
    attack_bonus: int,
    target_ac: int,
    damage_dice_sides: int,
    damage_dice_count: int,
    damage_modifier: int,
    damage_type: str,
    target_current_hp: int,
    advantage: bool = False,
    disadvantage: bool = False,
) -> AttackResult:
    """
    Resolve a melee or ranged attack following SRD 5.1 rules.

    Flow (Manifesto §2.1):
      1. Roll d20 + attack_bonus
      2. Compare against target AC
      3. On hit, roll damage dice + modifier
      4. On critical (nat 20), double damage dice
      5. Return immutable Fact Packet

    Args:
        attacker_id: Unique ID of the attacking character/creature
        target_id: Unique ID of the target
        attack_bonus: Total attack modifier (proficiency + ability mod)
        target_ac: Target's Armor Class
        damage_dice_sides: Faces on each damage die (e.g. 8 for longsword)
        damage_dice_count: Number of damage dice (e.g. 1 for longsword)
        damage_modifier: Flat damage bonus (usually ability modifier)
        damage_type: Damage type string (e.g. "slashing", "piercing", "fire")
        target_current_hp: Target's current HP before this attack
        advantage: Roll 2d20 take highest
        disadvantage: Roll 2d20 take lowest

    Returns:
        Immutable AttackResult (Fact Packet)
    """
    # --- Step 1: Attack Roll ---
    if advantage and not disadvantage:
        roll_1 = d20(attack_bonus)
        roll_2 = d20(attack_bonus)
        attack_roll = max(roll_1, roll_2, key=lambda r: r.rolls[0])
    elif disadvantage and not advantage:
        roll_1 = d20(attack_bonus)
        roll_2 = d20(attack_bonus)
        attack_roll = min(roll_1, roll_2, key=lambda r: r.rolls[0])
    else:
        attack_roll = d20(attack_bonus)

    natural = attack_roll.rolls[0]
    is_critical = natural == 20
    is_fumble = natural == 1

    # --- Step 2: Hit Determination ---
    # Natural 20 always hits; Natural 1 always misses (SRD 5.1)
    hit = is_critical or (not is_fumble and attack_roll.total >= target_ac)

    # --- Step 3: Damage Calculation ---
    total_damage = 0
    if hit:
        dice_count = damage_dice_count * 2 if is_critical else damage_dice_count
        damage_roll = damage(damage_dice_sides, dice_count, damage_modifier)
        total_damage = max(0, damage_roll.total)  # Damage cannot be negative

    # --- Step 4: Apply Damage to State ---
    remaining_hp = max(0, target_current_hp - total_damage)
    status = "dead" if remaining_hp <= 0 else "alive"

    return AttackResult(
        action_type="attack",
        attacker_id=attacker_id,
        target_id=target_id,
        roll_natural=natural,
        roll_total=attack_roll.total,
        ac_target=target_ac,
        hit=hit,
        critical=is_critical,
        fumble=is_fumble,
        damage_total=total_damage,
        damage_type=damage_type,
        target_remaining_hp=remaining_hp,
        target_status=status,
    )
