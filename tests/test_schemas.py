import pytest
from engine.schemas import AttackAction, MonsterAttackAction
from pydantic import ValidationError

def test_attack_action_validation():
    """Test standard valid attack payload."""
    payload = {
        "action": "attack",
        "attacker_id": "hero",
        "target_id": "goblin",
        "attack_bonus": 5
    }
    model = AttackAction(**payload)
    assert model.attacker_id == "hero"
    assert model.attack_bonus == 5
    assert model.damage_dice_sides == 6  # Default

def test_attack_action_invalid_type():
    """Test validation failure on wrong type."""
    payload = {
        "action": "attack",
        "attacker_id": "hero",
        "target_id": "goblin",
        "attack_bonus": "invalid_int"  # String instead of int
    }
    with pytest.raises(ValidationError):
        AttackAction(**payload)

def test_monster_attack_missing_field():
    """Test validation failure on missing required field."""
    payload = {
        "action": "monster_attack",
        "attacker_id": "monster_1"
        # Missing target_id
    }
    with pytest.raises(ValidationError):
        MonsterAttackAction(**payload)

def test_extra_fields_ignored_or_allowed():
    """Ensure extra fields don't cause crash (default Pydantic behavior is ignore, unless config changed)."""
    payload = {
        "action": "attack",
        "attacker_id": "hero",
        "target_id": "goblin",
        "extra_junk": "should be ignored"
    }
    model = AttackAction(**payload)
    assert model.attacker_id == "hero"
