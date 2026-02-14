"""
Unit Tests — Combat Engine (combat.py)
First Law: Code is Law — attack resolution must be deterministic.
"""

import pytest
import sys
from pathlib import Path
from unittest.mock import patch, MagicMock
from dataclasses import dataclass

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from engine.combat import resolve_attack, resolve_saving_throw, AttackResult
from engine.dice import DiceResult


def _fake_dice_result(natural: int, modifier: int = 0) -> DiceResult:
    """Create a DiceResult for mocking."""
    return DiceResult(
        rolls=(natural,),
        modifier=modifier,
        total=natural + modifier,
        notation=f"1d20+{modifier}" if modifier else "1d20",
    )


def _fake_damage_result(rolls: tuple, modifier: int = 0) -> DiceResult:
    """Create a damage DiceResult for mocking."""
    return DiceResult(
        rolls=rolls,
        modifier=modifier,
        total=sum(rolls) + modifier,
        notation=f"{len(rolls)}d6+{modifier}",
    )


class TestResolveAttack:
    """Tests for the resolve_attack() function — the heart of combat."""

    def test_hit_returns_damage(self):
        """A roll that meets AC should hit."""
        with patch("engine.combat.d20", return_value=_fake_dice_result(15, 5)):
            with patch("engine.combat.damage", return_value=_fake_damage_result((4, 3), 3)):
                result = resolve_attack(
                    attacker_id="player_1",
                    target_id="goblin_1",
                    attack_bonus=5,
                    target_ac=18,
                    damage_dice_sides=6,
                    damage_dice_count=2,
                    damage_modifier=3,
                    damage_type="slashing",
                    target_current_hp=15,
                )

                assert isinstance(result, AttackResult)
                assert result.hit is True
                assert result.damage_total == 10  # 4 + 3 + 3
                assert result.damage_type == "slashing"
                assert result.target_remaining_hp == 5  # 15 - 10

    def test_miss_returns_zero_damage(self):
        """A roll below AC should miss."""
        with patch("engine.combat.d20", return_value=_fake_dice_result(5, 5)):
            result = resolve_attack(
                attacker_id="player_1",
                target_id="goblin_1",
                attack_bonus=5,
                target_ac=18,
                damage_dice_sides=6,
                damage_dice_count=2,
                damage_modifier=3,
                damage_type="slashing",
                target_current_hp=15,
            )

            assert result.hit is False
            assert result.damage_total == 0
            assert result.target_remaining_hp == 15  # Unchanged

    def test_natural_20_always_hits(self):
        """Natural 20 is an automatic critical hit regardless of AC."""
        with patch("engine.combat.d20", return_value=_fake_dice_result(20, 5)):
            with patch("engine.combat.damage", return_value=_fake_damage_result((6, 5, 6, 5), 3)):
                result = resolve_attack(
                    attacker_id="player_1",
                    target_id="ancient_dragon",
                    attack_bonus=5,
                    target_ac=99,  # Impossible AC — nat 20 still hits
                    damage_dice_sides=6,
                    damage_dice_count=2,
                    damage_modifier=3,
                    damage_type="slashing",
                    target_current_hp=200,
                )

                assert result.hit is True
                assert result.critical is True
                assert result.roll_natural == 20

    def test_natural_1_always_misses(self):
        """Natural 1 is an automatic miss regardless of bonuses."""
        with patch("engine.combat.d20", return_value=_fake_dice_result(1, 99)):
            result = resolve_attack(
                attacker_id="player_1",
                target_id="commoner",
                attack_bonus=99,
                target_ac=1,  # Nat 1 should still miss
                damage_dice_sides=6,
                damage_dice_count=1,
                damage_modifier=0,
                damage_type="bludgeoning",
                target_current_hp=4,
            )

            assert result.hit is False
            assert result.fumble is True
            assert result.damage_total == 0

    def test_attack_result_contains_roll_info(self):
        """AttackResult must contain roll info for diegetic UI transparency."""
        with patch("engine.combat.d20", return_value=_fake_dice_result(14, 5)):
            with patch("engine.combat.damage", return_value=_fake_damage_result((4, 3), 3)):
                result = resolve_attack(
                    attacker_id="rogue_1",
                    target_id="orc_1",
                    attack_bonus=5,
                    target_ac=15,
                    damage_dice_sides=6,
                    damage_dice_count=2,
                    damage_modifier=3,
                    damage_type="piercing",
                    target_current_hp=20,
                )

                assert result.roll_natural == 14
                assert result.roll_total == 19
                assert result.ac_target == 15
                assert result.attacker_id == "rogue_1"
                assert result.target_id == "orc_1"

    def test_lethal_damage_kills(self):
        """Reducing HP to 0 should set status to 'dead'."""
        with patch("engine.combat.d20", return_value=_fake_dice_result(15, 5)):
            with patch("engine.combat.damage", return_value=_fake_damage_result((6, 6), 3)):
                result = resolve_attack(
                    attacker_id="player_1",
                    target_id="goblin_1",
                    attack_bonus=5,
                    target_ac=14,
                    damage_dice_sides=6,
                    damage_dice_count=2,
                    damage_modifier=3,
                    damage_type="slashing",
                    target_current_hp=10,
                )

                assert result.hit is True
                assert result.damage_total == 15  # 6+6+3
                assert result.target_remaining_hp == 0
                assert result.target_status == "dead"

    def test_fact_packet_serializes_correctly(self):
        """to_fact_packet() should return a dict with all combat data."""
        with patch("engine.combat.d20", return_value=_fake_dice_result(14, 5)):
            with patch("engine.combat.damage", return_value=_fake_damage_result((4,), 2)):
                result = resolve_attack(
                    attacker_id="fighter",
                    target_id="skeleton",
                    attack_bonus=5,
                    target_ac=13,
                    damage_dice_sides=8,
                    damage_dice_count=1,
                    damage_modifier=2,
                    damage_type="bludgeoning",
                    target_current_hp=13,
                )

                packet = result.to_fact_packet()
                assert isinstance(packet, dict)
                assert packet["action_type"] == "attack"
                assert packet["attacker"] == "fighter"
                assert packet["target"] == "skeleton"
                assert packet["hit"] is True
                assert packet["damage_total"] == 6


class TestResolveSavingThrow:
    """Tests for resolve_saving_throw() — spells and hazards."""

    def test_save_success_half_damage(self):
        """Standard save: Success = half damage."""
        # Roll 15 + 2 = 17 vs DC 13 (Success)
        with patch("engine.combat.d20", return_value=_fake_dice_result(15, 2)):
            # Damage: 6+6=12. Half is 6.
            with patch("engine.combat.damage", return_value=_fake_damage_result((6, 6), 0)):
                result = resolve_saving_throw(
                    attacker_id="wizard",
                    target_id="goblin",
                    save_dc=13,
                    save_stat="dex",
                    target_save_bonus=2,
                    damage_dice_sides=6,
                    damage_dice_count=2,
                    damage_modifier=0,
                    damage_type="fire",
                    target_current_hp=20,
                    half_damage_on_success=True,
                )

                assert result.save_success is True
                assert result.damage_total == 6
                assert result.target_remaining_hp == 14

    def test_save_fail_full_damage(self):
        """Failed save takes full damage."""
        # Roll 5 + 2 = 7 vs DC 13 (Fail)
        with patch("engine.combat.d20", return_value=_fake_dice_result(5, 2)):
            # Damage: 6.
            with patch("engine.combat.damage", return_value=_fake_damage_result((6,), 0)):
                result = resolve_saving_throw(
                    attacker_id="wizard",
                    target_id="goblin",
                    save_dc=13,
                    save_stat="dex",
                    target_save_bonus=2,
                    damage_dice_sides=6,
                    damage_dice_count=1,
                    damage_modifier=0,
                    damage_type="fire",
                    target_current_hp=10,
                )

                assert result.save_success is False
                assert result.damage_total == 6
                assert result.target_remaining_hp == 4

