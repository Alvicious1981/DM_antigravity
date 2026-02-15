"""
Dungeon Cortex — Status Engine (§3.3)
Manages conditions, effects, and their durations.
"""

from enum import Enum, auto
from dataclasses import dataclass, field
from typing import List, Optional, Set

class EffectType(Enum):
    GRANT_ADVANTAGE = auto()      # Attacks AGAINST target have advantage
    IMPOSE_DISADVANTAGE = auto()  # Attacks BY target have disadvantage
    AUTO_FAIL_SAVE = auto()       # Target auto-fails specific saves
    AUTO_FAIL_CHECK = auto()      # Target auto-fails specific checks
    DISABLE_ACTION = auto()       # Target cannot take actions
    SPEED_ZERO = auto()           # Target speed becomes 0
    MODIFY_STAT = auto()          # Bonus/Penalty arrows
    GRANT_CRIT = auto()           # Hits against target are crits (e.g. Paralyzed)

@dataclass
class ConditionEffect:
    type: EffectType
    params: dict = field(default_factory=dict) # e.g. {"stat": "dex"}, {"range": "melee"}

@dataclass
class ConditionDefinition:
    id: str
    name: str
    description: str
    video_effect: str = "default_status_aura" # For Visual Vault
    effects: List[ConditionEffect] = field(default_factory=list)

@dataclass
class ActiveCondition:
    condition_id: str
    source_id: Optional[str] = None
    duration_rounds: int = -1 # -1 = Infinite/Save Ends
    save_ends_dc: Optional[int] = None
    save_stat: Optional[str] = None

class ConditionRegistry:
    _definitions = {}

    @classmethod
    def register(cls, condition: ConditionDefinition):
        cls._definitions[condition.id] = condition

    @classmethod
    def get(cls, condition_id: str) -> Optional[ConditionDefinition]:
        return cls._definitions.get(condition_id)

    @classmethod
    def get_all(cls) -> List[ConditionDefinition]:
        return list(cls._definitions.values())

# --- SRD 5.1 Condition Definitions ---

# Blinded
ConditionRegistry.register(ConditionDefinition(
    id="blinded",
    name="Blinded",
    description="Can't see. Attacks have disadvantage. Attacks against you have advantage.",
    effects=[
        ConditionEffect(EffectType.IMPOSE_DISADVANTAGE, {"context": "attack"}),
        ConditionEffect(EffectType.GRANT_ADVANTAGE, {"context": "attacked_by"})
    ]
))

# Charmed
ConditionRegistry.register(ConditionDefinition(
    id="charmed",
    name="Charmed",
    description="Can't attack charmer. Charmer has advantage on social checks.",
    effects=[] # Logic handled in specific social/attack checks
))

# Deafened
ConditionRegistry.register(ConditionDefinition(
    id="deafened",
    name="Deafened",
    description="Can't hear.",
    effects=[]
))

# Frightened
ConditionRegistry.register(ConditionDefinition(
    id="frightened",
    name="Frightened",
    description="Disadvantage on checks/attacks while source is visible. Can't move closer.",
    effects=[
        ConditionEffect(EffectType.IMPOSE_DISADVANTAGE, {"context": "attack"}),
        ConditionEffect(EffectType.IMPOSE_DISADVANTAGE, {"context": "ability_check"})
    ]
))

# Grappled
ConditionRegistry.register(ConditionDefinition(
    id="grappled",
    name="Grappled",
    description="Speed 0.",
    effects=[
        ConditionEffect(EffectType.SPEED_ZERO)
    ]
))

# Incapacitated
ConditionRegistry.register(ConditionDefinition(
    id="incapacitated",
    name="Incapacitated",
    description="Can't take actions or reactions.",
    effects=[
        ConditionEffect(EffectType.DISABLE_ACTION)
    ]
))

# Invisible
ConditionRegistry.register(ConditionDefinition(
    id="invisible",
    name="Invisible",
    description="Impossible to see. Attacks have advantage. Attacks against you have disadvantage.",
    effects=[
        ConditionEffect(EffectType.GRANT_ADVANTAGE, {"context": "attack"}), # You attacking
        ConditionEffect(EffectType.IMPOSE_DISADVANTAGE, {"context": "attacked_by"}) # Being attacked
    ]
))

# Paralyzed
ConditionRegistry.register(ConditionDefinition(
    id="paralyzed",
    name="Paralyzed",
    description="Incapacitated. Can't move or speak. Auto-fail STR/DEX saves. Attackers get Advantage/Auto-Crit.",
    effects=[
        ConditionEffect(EffectType.DISABLE_ACTION),
        ConditionEffect(EffectType.SPEED_ZERO),
        ConditionEffect(EffectType.AUTO_FAIL_SAVE, {"stats": ["str", "dex"]}),
        ConditionEffect(EffectType.GRANT_ADVANTAGE, {"context": "attacked_by"}),
        ConditionEffect(EffectType.GRANT_CRIT, {"range": "5"}) # Crits within 5ft
    ]
))

# Petrified
ConditionRegistry.register(ConditionDefinition(
    id="petrified",
    name="Petrified",
    description="Turned to stone. Incapacitated. Resistance to all damage.",
    effects=[
        ConditionEffect(EffectType.DISABLE_ACTION),
        ConditionEffect(EffectType.SPEED_ZERO),
        ConditionEffect(EffectType.AUTO_FAIL_SAVE, {"stats": ["str", "dex"]}),
        ConditionEffect(EffectType.GRANT_ADVANTAGE, {"context": "attacked_by"}),
         # Resistance handled in damage logic via tag check
    ]
))

# Poisoned
ConditionRegistry.register(ConditionDefinition(
    id="poisoned",
    name="Poisoned",
    description="Disadvantage on attacks and ability checks.",
    effects=[
        ConditionEffect(EffectType.IMPOSE_DISADVANTAGE, {"context": "attack"}),
        ConditionEffect(EffectType.IMPOSE_DISADVANTAGE, {"context": "ability_check"})
    ]
))

# Prone
ConditionRegistry.register(ConditionDefinition(
    id="prone",
    name="Prone",
    description="Crawl only. Melee attacks against you have Advantage. Ranged attacks against you have Disadvantage.",
    effects=[
        # Contextual advantage logic will be handled in combat.py resolver 
        # because it depends on range (melee vs ranged)
        ConditionEffect(EffectType.IMPOSE_DISADVANTAGE, {"context": "attack"}) # Attacks made while prone are disadv
    ]
))

# Restrained
ConditionRegistry.register(ConditionDefinition(
    id="restrained",
    name="Restrained",
    description="Speed 0. Attacks against have Advantage. Your attacks Disadvantage. Disadvantage on DEX saves.",
    effects=[
        ConditionEffect(EffectType.SPEED_ZERO),
        ConditionEffect(EffectType.GRANT_ADVANTAGE, {"context": "attacked_by"}),
        ConditionEffect(EffectType.IMPOSE_DISADVANTAGE, {"context": "attack"}),
        ConditionEffect(EffectType.IMPOSE_DISADVANTAGE, {"context": "save", "stat": "dex"})
    ]
))

# Stunned
ConditionRegistry.register(ConditionDefinition(
    id="stunned",
    name="Stunned",
    description="Incapacitated. Can't move. Auto-fail STR/DEX saves. Attacks against have Advantage.",
    effects=[
        ConditionEffect(EffectType.DISABLE_ACTION),
        ConditionEffect(EffectType.SPEED_ZERO),
        ConditionEffect(EffectType.AUTO_FAIL_SAVE, {"stats": ["str", "dex"]}),
        ConditionEffect(EffectType.GRANT_ADVANTAGE, {"context": "attacked_by"})
    ]
))

# Unconscious
ConditionRegistry.register(ConditionDefinition(
    id="unconscious",
    name="Unconscious",
    description="Incapacitated. Prone. Drop actions. Auto-fail STR/DEX saves. Attacks against have Advantage/Crit.",
    effects=[
        ConditionEffect(EffectType.DISABLE_ACTION),
        ConditionEffect(EffectType.SPEED_ZERO),
        ConditionEffect(EffectType.AUTO_FAIL_SAVE, {"stats": ["str", "dex"]}),
        ConditionEffect(EffectType.GRANT_ADVANTAGE, {"context": "attacked_by"}),
        ConditionEffect(EffectType.GRANT_CRIT, {"range": "5"})
    ]
))
