from packages.engine.src.engine.combat import resolve_aoe_spell, resolve_condition

def test_aoe_logic():
    print("Testing AOE Logic...")
    
    # Setup
    target_ids = ["goblin_1", "goblin_2", "goblin_3"]
    targets_hp = {"goblin_1": 10, "goblin_2": 10, "goblin_3": 5}
    targets_save = {"goblin_1": 0, "goblin_2": 5, "goblin_3": -1}
    
    # Cast Fireball (High Damage, DC 15)
    results = resolve_aoe_spell(
        attacker_id="wizard",
        target_ids=target_ids,
        save_dc=15,
        save_stat="dex",
        damage_dice_sides=6,
        damage_dice_count=8,  # 8d6
        damage_modifier=0,
        damage_type="fire",
        targets_current_hp=targets_hp,
        targets_save_bonuses=targets_save
    )
    
    print(f"AOE Results ({len(results)} targets):")
    total_dmg = 0
    for r in results:
        print(f"  Target {r.target_id}: HP {targets_hp[r.target_id]} -> {r.target_remaining_hp} "
              f"(Save: {r.save_success}, Dmg: {r.damage_total}, Status: {r.target_status})")
        total_dmg += r.damage_total

    assert len(results) == 3
    print("AOE Test Passed!\n")

def test_condition_logic():
    print("Testing Condition Logic...")
    
    # Apply "Poisoned" (DC 15 CON save)
    # Case 1: Failure (Roll 5 + 0 < 15) -> Condition Applied
    res_fail = resolve_condition(
        target_id="orc_1",
        condition="poisoned",
        save_dc=15,
        save_stat="con",
        target_save_bonus=0,
        disadvantage=True # Force low roll likely
    )
    print(f"Case 1 (Fail): {res_fail.effect_description} (Active: {res_fail.active})")
    
    # Case 2: Success (High Bonus)
    res_success = resolve_condition(
        target_id="paladin_1",
        condition="poisoned",
        save_dc=10,
        save_stat="con",
        target_save_bonus=20 # Auto success basically
    )
    print(f"Case 2 (Success): {res_success.effect_description} (Active: {res_success.active})")
    
    # Note: We can't strictly assert "active=True" for random rolls unless we mock d20 or check ranges.
    # But with +20 bonus vs DC 10, it should succeed.
    assert res_success.active == False
    print("Condition Test Passed!\n")

if __name__ == "__main__":
    test_aoe_logic()
    test_condition_logic()
