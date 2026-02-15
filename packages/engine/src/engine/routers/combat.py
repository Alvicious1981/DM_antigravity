from fastapi import APIRouter
from ..combat import resolve_attack, resolve_saving_throw

router = APIRouter(
    prefix="/api/combat",
    tags=["combat"]
)

@router.post("/attack")
async def simulate_attack(payload: dict):
    """
    Execute a deterministic attack roll.
    First Law: Code is Law — no narrative without mechanics.
    """
    result = resolve_attack(
        attacker_id=payload.get("attacker_id", "player"),
        target_id=payload.get("target_id", "enemy"),
        attack_bonus=payload.get("attack_bonus", 0),
        target_ac=payload.get("target_ac", 10),
        damage_dice_sides=payload.get("damage_dice_sides", 6),
        damage_dice_count=payload.get("damage_dice_count", 1),
        damage_modifier=payload.get("damage_modifier", 0),
        damage_type=payload.get("damage_type", "bludgeoning"),
        target_current_hp=payload.get("target_current_hp", 20),
        advantage=payload.get("advantage", False),
        disadvantage=payload.get("disadvantage", False),
    )
    return result.to_fact_packet()


@router.post("/save")
async def simulate_save(payload: dict):
    """
    Execute a deterministic saving throw.
    """
    result = resolve_saving_throw(
        attacker_id=payload.get("attacker_id", "wizard"),
        target_id=payload.get("target_id", "goblin"),
        save_dc=payload.get("save_dc", 13),
        save_stat=payload.get("save_stat", "dex"),
        target_save_bonus=payload.get("target_save_bonus", 2),
        damage_dice_sides=payload.get("damage_dice_sides", 6),
        damage_dice_count=payload.get("damage_dice_count", 8),
        damage_modifier=payload.get("damage_modifier", 0),
        damage_type=payload.get("damage_type", "fire"),
        target_current_hp=payload.get("target_current_hp", 20),
        advantage=payload.get("advantage", False),
        disadvantage=payload.get("disadvantage", False),
        half_damage_on_success=payload.get("half_damage_on_success", True),
    )
    return result.to_fact_packet()
