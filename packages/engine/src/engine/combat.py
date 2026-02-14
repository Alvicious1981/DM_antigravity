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
    save_dc: int = 0
    save_stat: str = ""
    save_success: bool = False
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
            "save_dc": self.save_dc,
            "save_stat": self.save_stat,
            "save_success": self.save_success,
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
    Resolve a melee or ranged weapon attack following SRD 5.1 rules.
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


def resolve_spell_attack(
    attacker_id: str,
    target_id: str,
    spell_attack_bonus: int,
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
    Resolve a spell attack roll (e.g. Fire Bolt, Scorching Ray).
    Mechanically identical to weapon attacks but uses spell attack bonus.
    """
    # Reuse the core combat logic as it's identical for spell attacks in 5e
    result = resolve_attack(
        attacker_id, target_id, spell_attack_bonus, target_ac,
        damage_dice_sides, damage_dice_count, damage_modifier,
        damage_type, target_current_hp, advantage, disadvantage
    )
    # Return as struct copy to allow future divergence if needed (e.g. specific spell rules)
    return AttackResult(
        action_type="spell_attack",
        attacker_id=result.attacker_id,
        target_id=result.target_id,
        roll_natural=result.roll_natural,
        roll_total=result.roll_total,
        ac_target=result.ac_target,
        hit=result.hit,
        critical=result.critical,
        fumble=result.fumble,
        damage_total=result.damage_total,
        damage_type=result.damage_type,
        target_remaining_hp=result.target_remaining_hp,
        target_status=result.target_status,
    )


def resolve_saving_throw(
    attacker_id: str,
    target_id: str,
    save_dc: int,
    save_stat: str,
    target_save_bonus: int,
    damage_dice_sides: int,
    damage_dice_count: int,
    damage_modifier: int,
    damage_type: str,
    target_current_hp: int,
    advantage: bool = False,
    disadvantage: bool = False,
    half_damage_on_success: bool = True,
) -> AttackResult:
    """
    Resolve a saving throw capability (e.g. Fireball, Poison Breath).
    
    Flow:
      1. Target rolls d20 + save_bonus vs DC
      2. If roll >= DC, save succeeds
      3. Roll full damage
      4. Apply full or half damage based on success
    """
    # --- Step 1: Saving Throw Roll ---
    if advantage and not disadvantage:
        roll_1 = d20(target_save_bonus)
        roll_2 = d20(target_save_bonus)
        save_roll = max(roll_1, roll_2, key=lambda r: r.rolls[0])
    elif disadvantage and not advantage:
        roll_1 = d20(target_save_bonus)
        roll_2 = d20(target_save_bonus)
        save_roll = min(roll_1, roll_2, key=lambda r: r.rolls[0])
    else:
        save_roll = d20(target_save_bonus)

    success = save_roll.total >= save_dc

    # --- Step 2: Damage Calculation ---
    # Damage is rolled once by the attacker
    damage_roll = damage(damage_dice_sides, damage_dice_count, damage_modifier)
    raw_damage = max(0, damage_roll.total)

    final_damage = raw_damage
    if success:
        final_damage = raw_damage // 2 if half_damage_on_success else 0

    # --- Step 3: Apply Damage ---
    remaining_hp = max(0, target_current_hp - final_damage)
    status = "dead" if remaining_hp <= 0 else "alive"

    return AttackResult(
        action_type="saving_throw",
        attacker_id=attacker_id,
        target_id=target_id,
        roll_natural=save_roll.rolls[0],  # The target's roll
        roll_total=save_roll.total,
        ac_target=0,     # Not applicable
        save_dc=save_dc,
        save_stat=save_stat,
        save_success=success,
        hit=not success, # Semantic mapping: "hit" means "effect took full hold"? ambiguous, stick to save_success
        critical=False,  # Saves don't crit
        fumble=False,
        damage_total=final_damage,
        damage_type=damage_type,
        target_remaining_hp=remaining_hp,
        target_status=status,
    )
