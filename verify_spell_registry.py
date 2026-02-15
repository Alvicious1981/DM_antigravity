from packages.engine.src.engine.spells import get_all_spells, get_spell

def test_spell_registry():
    print("Testing Spell Registry...")
    
    # Test 1: Load all spells
    spells = get_all_spells()
    print(f"Loaded {len(spells)} spells.")
    assert len(spells) >= 5, "Should have at least 5 default spells"
    
    # Test 2: Get specific spell
    fireball = get_spell("spell_fireball")
    assert fireball is not None
    assert fireball.name == "Fireball"
    assert fireball.level == 3
    assert fireball.is_save == True
    assert fireball.save_stat == "dex"
    print("Fireball data verified.")
    
    # Test 3: AOE Data
    assert fireball.aoe_radius == 20
    print("AOE data verified.")
    
    # Test 4: Magic Missile (No Save, No Attack Roll typically)
    mm = get_spell("spell_magic-missile")
    assert mm.damage_type == "force"
    print("Magic Missile data verified.")

    print("Spell Registry Test Passed!\n")

if __name__ == "__main__":
    test_spell_registry()
