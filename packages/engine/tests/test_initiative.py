"""
Unit Tests — Initiative Engine (initiative.py)
"""

import pytest
import sys
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from engine.initiative import InitiativeTracker, Combatant
from engine.dice import DiceResult

def _fake_d20(modifier: int) -> DiceResult:
    return DiceResult(
        rolls=(10,),
        modifier=modifier,
        total=10 + modifier,
        notation=f"1d20+{modifier}"
    )

class TestInitiativeTracker:
    
    def test_add_combatant(self):
        tracker = InitiativeTracker()
        tracker.add_combatant("p1", "Player", 3, is_player=True)
        assert len(tracker.combatants) == 1
        assert tracker.combatants[0].name == "Player"

    def test_roll_initiative_updates_value(self):
        tracker = InitiativeTracker()
        c = Combatant("g1", "Goblin", 2)
        with patch("engine.initiative.d20", side_effect=_fake_d20):
            val = tracker.roll_initiative(c)
            assert val == 12 # 10 + 2
            assert c.initiative == 12

    def test_start_encounter_sorts_order(self):
        """High initiative goes first. Ties broken by DEX."""
        tracker = InitiativeTracker()
        # Create combatants
        c1 = Combatant("slow", "Slow", 0) # Roll 10
        c2 = Combatant("fast", "Fast", 5) # Roll 15
        
        tracker.combatants = [c1, c2]
        
        with patch("engine.initiative.d20", side_effect=_fake_d20):
            tracker.start_encounter()
            
        assert tracker.combatants[0].id == "fast" # 15
        assert tracker.combatants[1].id == "slow" # 10
        assert tracker.has_started is True
        assert tracker.round == 1

    def test_turn_order_structure(self):
        """Verify next_turn cycles correctly."""
        tracker = InitiativeTracker()
        c1 = Combatant("a", "A", 0) # 10
        c2 = Combatant("b", "B", 0) # 10 - Tie? 
        # If tie, DEX is tiebreaker. Both 0. Stable sort? 
        # Let's use distinct vals
        c1.initiative = 20
        c2.initiative = 10
        
        tracker.combatants = [c1, c2]
        tracker.has_started = True
        tracker.turn_index = 0
        
        # Current is c1
        assert tracker.get_current_actor().id == "a"
        
        # Next -> c2
        next_c = tracker.next_turn()
        assert next_c.id == "b"
        
        # Next -> c1 (Round 2)
        next_c = tracker.next_turn()
        assert next_c.id == "a"
        assert tracker.round == 2

    def test_skip_inactive(self):
        """Dead/incapacitated combatants should be skipped."""
        tracker = InitiativeTracker()
        c1 = Combatant("a", "A", 0)
        c2 = Combatant("b", "B", 0)
        c3 = Combatant("c", "C", 0)
        
        c1.initiative = 20
        c2.initiative = 15
        c2.is_active = False # Dead
        c3.initiative = 10
        
        tracker.combatants = [c1, c2, c3]
        tracker.has_started = True
        
        # Start at A
        tracker.turn_index = 0
        
        # Next should be C (skip B)
        next_c = tracker.next_turn()
        assert next_c.id == "c"
