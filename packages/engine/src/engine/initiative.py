"""
Dungeon Cortex — Initiative Engine (§3.2)
Manages turn order, rounds, and initiative rolls.
"""

from dataclasses import dataclass, field
from typing import List, Optional
from .dice import d20
from .conditions import ActiveCondition, ConditionRegistry, EffectType

@dataclass
class Combatant:
    """An entity participating in combat."""
    id: str
    name: str
    dex_modifier: int
    str_mod: int = 0
    dex_mod: int = 0  # Duplicate of dex_modifier but specific for combat logic shorthand? Or aliased?
    # Let's keep dex_modifier for initiative, but maybe use dex_mod for consistency with others?
    # Actually, let's keep dex_modifier as the init one, and add others.
    # Note: websocket.py uses .dex_mod.
    con_mod: int = 0
    int_mod: int = 0
    wis_mod: int = 0
    cha_mod: int = 0
    initiative: int = 0
    is_active: bool = True
    is_player: bool = False
    
    # Monster/NPC Stats
    hp_max: int = 10
    hp_current: int = 10
    ac: int = 10
    cr: float = 0
    type: str = "unknown"
    actions: List[dict] = field(default_factory=list)
    
    # Changed from List[str] to List[ActiveCondition]
    conditions: List[ActiveCondition] = field(default_factory=list)
    resistances: List[str] = field(default_factory=list)
    immunities: List[str] = field(default_factory=list)

    def has_condition(self, condition_id: str) -> bool:
        return any(c.condition_id == condition_id for c in self.conditions)

    def get_condition(self, condition_id: str) -> Optional[ActiveCondition]:
        return next((c for c in self.conditions if c.condition_id == condition_id), None)


@dataclass
class InitiativeTracker:
    # ... (fields remain same)
    round: int = 1
    turn_index: int = 0
    combatants: List[Combatant] = field(default_factory=list)
    has_started: bool = False

    # ... (roll_initiative and add_combatant methods remain mostly same, just ensuring conditions init is correct)

    def roll_initiative(self, combatant: Combatant) -> int:
        roll_result = d20(combatant.dex_modifier)
        combatant.initiative = roll_result.total
        return combatant.initiative

    def add_combatant(self, id: str, name: str, dex_modifier: int, is_player: bool = False,
                     hp_max: int = 10, ac: int = 10, actions: Optional[List[dict]] = None,
                     resistances: List[str] = None, immunities: List[str] = None,
                     cr: float = 0, type: str = "unknown", 
                     str_mod: int = 0, con_mod: int = 0, int_mod: int = 0, wis_mod: int = 0, cha_mod: int = 0):

        if actions is None: actions = []
        if resistances is None: resistances = []
        if immunities is None: immunities = []
            
        c = Combatant(id=id, name=name, dex_modifier=dex_modifier, is_player=is_player,
                     hp_max=hp_max, hp_current=hp_max, ac=ac, actions=actions,
                     resistances=resistances, immunities=immunities,
                     cr=cr, type=type, conditions=[],
                     str_mod=str_mod, dex_mod=dex_modifier, con_mod=con_mod, 
                     int_mod=int_mod, wis_mod=wis_mod, cha_mod=cha_mod)
        self.combatants.append(c)

    def start_encounter(self):
        for c in self.combatants:
            if c.initiative == 0:
                self.roll_initiative(c)
        
        self.combatants.sort(key=lambda x: (x.initiative, x.dex_modifier), reverse=True)
        self.has_started = True
        self.round = 1
        self.turn_index = 0

    def next_turn(self) -> Combatant:
        if not self.combatants:
            raise ValueError("No combatants in tracker")

        # 1. End of Turn Cleanup for Current Actor
        current_actor = self.get_current_actor()
        if current_actor:
            self._process_end_of_turn(current_actor)

        # 2. Advance Index
        start_index = self.turn_index
        while True:
            self.turn_index = (self.turn_index + 1) % len(self.combatants)
            
            # New Round
            if self.turn_index == 0:
                self.round += 1

            next_actor = self.combatants[self.turn_index]
            
            # Skip inactive (dead) combatants
            if next_actor.is_active:
                # 3. Start of Turn Processing for Next Actor
                self._process_start_of_turn(next_actor)
                return next_actor

            if self.turn_index == start_index:
                # Everyone dead/inactive?
                return next_actor
        
        return self.combatants[0]

    def _process_start_of_turn(self, combatant: Combatant):
        # Decrement durations
        expired = []
        for cond in combatant.conditions:
            if cond.duration_rounds > 0:
                cond.duration_rounds -= 1
                if cond.duration_rounds == 0:
                    expired.append(cond)
        
        for e in expired:
            combatant.conditions.remove(e)
            print(f"Condition expired: {e.condition_id} on {combatant.name}")

    def _process_end_of_turn(self, combatant: Combatant):
        # Allow save-ends rolls here? (Future feature)
        pass

    def get_current_actor(self) -> Optional[Combatant]:
        if not self.combatants:
            return None
        return self.combatants[self.turn_index]

    def add_condition(self, combatant_id: str, condition_id: str, 
                      duration: int = -1, source_id: str = None, 
                      save_ends_dc: int = None, save_stat: str = None):
        
        c = next((c for c in self.combatants if c.id == combatant_id), None)
        if not c: return

        # defined = ConditionRegistry.get(condition_id)
        # if not defined: return # Or handle unknown?

        # Check if already exists, refresh duration or stack?
        existing = c.get_condition(condition_id)
        if existing:
            # Refresh duration if new is longer
            if duration > existing.duration_rounds and duration != -1:
                existing.duration_rounds = duration
            elif duration == -1:
                existing.duration_rounds = -1
        else:
            c.conditions.append(ActiveCondition(
                condition_id=condition_id,
                source_id=source_id,
                duration_rounds=duration,
                save_ends_dc=save_ends_dc,
                save_stat=save_stat
            ))

    def remove_condition(self, combatant_id: str, condition_id: str):
        c = next((c for c in self.combatants if c.id == combatant_id), None)
        if c:
            to_remove = c.get_condition(condition_id)
            if to_remove:
                c.conditions.remove(to_remove)

