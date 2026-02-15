"""
Verification Script for Status Engine (§3.3)
Tests deterministic application of conditions, duration tracking, and combat effects.
"""
import sys
import os

# Add project root to path
current_dir = os.path.dirname(os.path.abspath(__file__))
engine_src_path = os.path.join(current_dir, 'packages', 'engine', 'src')
sys.path.append(engine_src_path)

from engine.conditions import ConditionRegistry, EffectType, ActiveCondition
from engine.initiative import InitiativeTracker, Combatant
from engine.combat import resolve_attack, resolve_saving_throw

def test_condition_registry():
    print("Testing Registry...")
    blinded = ConditionRegistry.get("blinded")
    assert blinded is not None
    assert len(blinded.effects) > 0
    print("✅ Registry loaded 'blinded' correctly.")

def test_duration_logic():
    print("Testing Duration Logic...")
    tracker = InitiativeTracker()
    # Signature: id, name, dex_modifier, is_player=False, ...
    tracker.add_combatant("p1", "Player", 2, is_player=True)
    p1 = tracker.combatants[0]
    
    # helper method in tracker: 
    # add_condition(combatant_id, condition_id, duration=-1, source_id=None, save_ends_dc=None, save_stat=None)
    tracker.add_condition("p1", "blinded", duration=2)
    
    # Check if condition is present
    assert p1.has_condition("blinded")
    print("✅ Condition added.")

    tracker.start_encounter() # This sorts combatants, sets round=1, turn_index=0
    
    # Current actor is p1 (highest init/dex usually, or only one)
    current = tracker.get_current_actor()
    print(f"Current actor: {current.name}")

    # Next Turn -> End turn for current (p1), Start turn for next
    # If only 1 combatant, p1 ends turn, then p1 starts turn again (next round?)
    # Logic in next_turn:
    # 1. End of turn cleanup (current)
    # 2. Advance index
    # 3. Start of turn processing (next)
    
    # Current is p1. 
    # next_turn() should trigger p1's end of turn (no effect currently)
    # then advance index. Since len=1, index wraps to 0 (p1).
    # then p1 start of turn -> decrement duration.
    
    tracker.next_turn() 
    # p1 just started a new turn basically. 
    # Duration should be 1 now (started at 2, decremented at start of turn)
    
    cond = p1.get_condition("blinded")
    print(f"Duration remaining: {cond.duration_rounds}")
    assert cond.duration_rounds == 1
    print("✅ Duration decremented to 1.")
    
    tracker.next_turn() 
    # Round 2 (or 3 depending on how you count partials, rounds increment at index 0)
    # p1 starts turn again. Duration 1 -> 0.
    # expired.
    
    assert not p1.has_condition("blinded")
    print("✅ Condition expired correctly.")

def test_combat_effects():
    print("Testing Combat Effects (Code is Law)...")
    tracker = InitiativeTracker()
    tracker.add_combatant("att", "Attacker", 0, is_player=False)
    tracker.add_combatant("def", "Defender", 0, is_player=False, ac=15)
    
    att = tracker.combatants[0]
    target = tracker.combatants[1]

    # Manually adding ActiveCondition objects for the resolver test
    attacker_conds = [ActiveCondition("invisible")]
    target_conds = [ActiveCondition("paralyzed")]

    print("✅ Combatants setup with Invisible vs Paralyzed.")

    # Test Attack logic
    # Invisible gives Adv to attacker. Paralyzed gives Adv to attacker.
    # We can't easily check 'advantage=True' return without inspecting internal state of resolver
    # But checking for crashes and basic result structure:
    
    res = resolve_attack(
        att.id, target.id, 5, target.ac, 6, 1, 0, "slashing", 10,
        attacker_conditions=attacker_conds,
        target_conditions=target_conds
    )
    print(f"✅ Attack resolved. Hit: {res.hit}, Crit: {res.critical}")
    
    # Paralyzed should cause auto-fail Dex save
    save_res = resolve_saving_throw(
        att.id, target.id, 15, "dex", 0, 6, 1, 0, "fire", 10,
        target_conditions=target_conds
    )
    
    assert save_res.save_success == False
    assert save_res.hit == True 
    print("✅ Paralyzed caused Auto-Fail on DEX save.")

if __name__ == "__main__":
    test_condition_registry()
    test_duration_logic()
    test_combat_effects()
    print("\n🎉 Status Engine Verification Passed!")
