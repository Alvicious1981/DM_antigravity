"""
Dungeon Cortex — Combat Resolution Engine (§8.2)
Deterministic attack and damage resolution following D&D 5e SRD 5.1 rules.
First Law: Code is Law — the AI narrates, the Engine resolves.
"""

from dataclasses import dataclass, field
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
    active_conditions: list[str] = field(default_factory=list)
    environment_tags: list[str] = field(default_factory=list)
    narrative_hook: Optional[str] = None

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
            "active_conditions": self.active_conditions,
            "env": self.environment_tags,
            "hook": self.narrative_hook
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
    target_resistances: Optional[list[str]] = None,
    target_immunities: Optional[list[str]] = None,
    advantage: bool = False,
    disadvantage: bool = False,
    environment_tags: Optional[list[str]] = None,
    narrative_hook: Optional[str] = None,
) -> AttackResult:
    """
    Resolve a melee or ranged weapon attack following SRD 5.1 rules.
    """
    if target_resistances is None: target_resistances = []
    if target_immunities is None: target_immunities = []

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
        raw_damage = max(0, damage_roll.total)

        # Apply Resistances and Immunities
        if damage_type.lower() in [i.lower() for i in target_immunities]:
            total_damage = 0
        elif damage_type.lower() in [r.lower() for r in target_resistances]:
            total_damage = raw_damage // 2
        else:
            total_damage = raw_damage

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
        environment_tags=environment_tags or [],
        narrative_hook=narrative_hook,
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
        damage_type, target_current_hp, [], [], advantage, disadvantage
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
        environment_tags=result.environment_tags,
        narrative_hook=result.narrative_hook,
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
    target_resistances: Optional[list[str]] = None,
    target_immunities: Optional[list[str]] = None,
    advantage: bool = False,
    disadvantage: bool = False,
    half_damage_on_success: bool = True,
    environment_tags: Optional[list[str]] = None,
    narrative_hook: Optional[str] = None,
) -> AttackResult:
    """
    Resolve a saving throw capability (e.g. Fireball, Poison Breath).
    
    Flow:
      1. Target rolls d20 + save_bonus vs DC
      2. If roll >= DC, save succeeds
      3. Roll full damage
      4. Apply full or half damage based on success
    """
    if target_resistances is None: target_resistances = []
    if target_immunities is None: target_immunities = []

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

    # Apply Resistances/Immunities
    if damage_type.lower() in [i.lower() for i in target_immunities]:
        final_damage = 0
    elif damage_type.lower() in [r.lower() for r in target_resistances]:
        final_damage = final_damage // 2

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
        damage_type=damage_type,
        target_remaining_hp=remaining_hp,
        target_status=status,
        environment_tags=environment_tags or [],
        narrative_hook=narrative_hook,
    )


@dataclass(frozen=True)
class ConditionResult:
    """Result of a condition check or application."""
    target_id: str
    condition: str
    active: bool
    save_success: bool = False
    effect_description: str = ""


def resolve_condition(
    target_id: str,
    condition: str,
    save_dc: int,
    save_stat: str,
    target_save_bonus: int,
    advantage: bool = False,
    disadvantage: bool = False,
) -> ConditionResult:
    """
    Resolve attempting to apply a condition (e.g. Poisoned) with a saving throw.
    """
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
    active = not success

    return ConditionResult(
        target_id=target_id,
        condition=condition,
        active=active,
        save_success=success,
        effect_description=f"{condition} applied" if active else f"{condition} resisted"
    )


def resolve_aoe_spell(
    attacker_id: str,
    target_ids: list[str],
    save_dc: int,
    save_stat: str,
    damage_dice_sides: int,
    damage_dice_count: int,
    damage_modifier: int,
    damage_type: str,
    targets_current_hp: dict[str, int], # Map target_id -> hp
    targets_save_bonuses: dict[str, int], # Map target_id -> bonus
    targets_resistances: Optional[dict[str, list[str]]] = None,
    targets_immunities: Optional[dict[str, list[str]]] = None,
    environment_tags: Optional[list[str]] = None,
    narrative_hook: Optional[str] = None,
) -> list[AttackResult]:
    """
    Resolve an Area of Effect spell against multiple targets.
    Returns a list of AttackResult (one per target).
    """
    if targets_resistances is None: targets_resistances = {}
    if targets_immunities is None: targets_immunities = {}

    results = []
    
    # Roll damage ONCE for the spell instance (PHB rule)
    damage_roll_instance = damage(damage_dice_sides, damage_dice_count, damage_modifier)
    base_damage = max(0, damage_roll_instance.total)
    
    for target_id in target_ids:
        # 1. Resolve Save
        bonus = targets_save_bonuses.get(target_id, 0)
        save_roll = d20(bonus)
        success = save_roll.total >= save_dc
        
        # 2. Calculate Damage
        # EVASION logic could be injected here in future
        final_damage = base_damage // 2 if success else base_damage

        # Apply Resistances/Immunities
        resistances = targets_resistances.get(target_id, [])
        immunities = targets_immunities.get(target_id, [])
        
        if damage_type.lower() in [i.lower() for i in immunities]:
            final_damage = 0
        elif damage_type.lower() in [r.lower() for r in resistances]:
            final_damage = final_damage // 2
        
        # 3. Apply to State
        current_hp = targets_current_hp.get(target_id, 0)
        remaining_hp = max(0, current_hp - final_damage)
        status = "dead" if remaining_hp <= 0 else "alive"
        
        results.append(AttackResult(
            action_type="aoe_spell",
            attacker_id=attacker_id,
            target_id=target_id,
            roll_natural=save_roll.rolls[0],
            roll_total=save_roll.total,
            ac_target=0,
            save_dc=save_dc,
            save_stat=save_stat,
            save_success=success,
            hit=not success, 
            damage_total=final_damage,
            damage_type=damage_type,
            target_remaining_hp=remaining_hp,
            target_status=status,
            active_conditions=[], # reserved for future
            environment_tags=environment_tags if environment_tags is not None else [],
            narrative_hook=narrative_hook,
        ))
        
    return results

def calculate_ac(
    base_ac: int,
    dex_modifier: int,
    armor_type: str = "none", # none, light, medium, heavy
    shield_bonus: int = 0,
    wears_armor: bool = False,
    class_features: Optional[list[dict]] = None, # e.g. [{"name": "Unarmored Defense (Monk)", "value": 15}]
    magical_bonuses: int = 0
) -> int:
    """
    Calculate Armor Class with mutual exclusivity rules.
    1. Unarmored: 10 + DEX
    2. Armored: Armor Base + DEX (capped?)
    3. Unarmored Defense: Base Formula (e.g. 10+DEX+CON) - Mutually exclusive with each other and Armor.
    
    This function calculates all possible 'Base AC' calculations and picks the highest.
    Then adds shields and magical bonuses (which typically stack).
    """
    if class_features is None:
        class_features = []
        
    possible_calculations = []
    
    # 1. Natural / Unarmored
    if not wears_armor:
        possible_calculations.append(10 + dex_modifier)
    
    # 2. Armor
    if wears_armor:
        # Simplified armor logic for now - assumes base_ac passed is the armor's base
        # Real logic would need lookup tables for max dex
        # Light: + DEX
        # Medium: + min(DEX, 2)
        # Heavy: + 0
        ac_calc = base_ac
        if armor_type == "light":
            ac_calc += dex_modifier
        elif armor_type == "medium":
            ac_calc += min(dex_modifier, 2)
        elif armor_type == "heavy":
            ac_calc += 0 # No dex
        else:
            # Fallback or strict base
            ac_calc += dex_modifier # Default fallback
            
        possible_calculations.append(ac_calc)

    # 3. Class Features (Unarmored Defense, Draconic Resilience, etc)
    # These replace the base calculation.
    for feature in class_features:
        # We assume the feature object has the fully calculated value or we trust it
        # ideally we'd pass the logic, but for now value is fine.
        val = feature.get("value", 0)
        possible_calculations.append(val)
        
    # Winner:
    current_best = max(possible_calculations) if possible_calculations else 10
    
    # Stackables
    total = current_best + shield_bonus + magical_bonuses
    return total
