"""
Dungeon Cortex — Initiative Engine (§3.2)
Manages turn order, rounds, and initiative rolls.
"""

from dataclasses import dataclass, field
from typing import List, Optional
from .dice import d20

@dataclass
class Combatant:
    """An entity participating in combat."""
    id: str
    name: str
    dex_modifier: int
    initiative: int = 0
    is_active: bool = True
    is_player: bool = False
    
    # Monster/NPC Stats
    hp_max: int = 10
    hp_current: int = 10
    ac: int = 10
    actions: List[dict] = field(default_factory=list)

@dataclass
class InitiativeTracker:
    """
    Manages the state of a combat encounter.
    """
    round: int = 1
    turn_index: int = 0
    combatants: List[Combatant] = field(default_factory=list)
    has_started: bool = False

    def roll_initiative(self, combatant: Combatant) -> int:
        """
        Roll initiative for a single combatant.
        Formula: d20 + DEX modifier.
        """
        # If initiative is manually set (e.g. Lair Action at 20), keep it? 
        # For now, always roll.
        roll_result = d20(combatant.dex_modifier)
        combatant.initiative = roll_result.total
        return combatant.initiative

    def add_combatant(self, id: str, name: str, dex_modifier: int, is_player: bool = False,
                     hp_max: int = 10, ac: int = 10, actions: List[dict] = None):
        """Register a new participant."""
        if actions is None:
            actions = []
        c = Combatant(id=id, name=name, dex_modifier=dex_modifier, is_player=is_player,
                     hp_max=hp_max, hp_current=hp_max, ac=ac, actions=actions)
        self.combatants.append(c)

    def start_encounter(self):
        """
        Roll for all NPCs (if not already rolled) and sort turn order.
        SRD 5.1: High to low. Ties: DM decides (we'll use DEX as tiebreaker).
        """
        for c in self.combatants:
            if c.initiative == 0:  # If not pre-rolled
                self.roll_initiative(c)
        
        # Sort by initiative descending, then DEX descending
        self.combatants.sort(key=lambda x: (x.initiative, x.dex_modifier), reverse=True)
        self.has_started = True
        self.round = 1
        self.turn_index = 0

    def next_turn(self) -> Combatant:
        """Advance to the next active combatant."""
        if not self.combatants:
            raise ValueError("No combatants in tracker")

        # Find next active combatant
        start_index = self.turn_index
        while True:
            self.turn_index = (self.turn_index + 1) % len(self.combatants)
            
            # New round
            if self.turn_index == 0:
                self.round += 1

            current = self.combatants[self.turn_index]
            if current.is_active:
                return current

            # Safety break if everyone is inactive
            if self.turn_index == start_index:
                return current

    def get_current_actor(self) -> Optional[Combatant]:
        if not self.combatants:
            return None
        return self.combatants[self.turn_index]
