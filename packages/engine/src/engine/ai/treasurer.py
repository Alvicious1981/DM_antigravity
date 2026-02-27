"""
Dungeon Cortex — Treasurer Agent (§ Agent Triumvirate / §8.3)
Responsibility: Economy, loot valuation, and gold management.
  - Calculates gold rewards from combat/loot based on CR and world reputation.
  - Prices items for buy/sell transactions (reputation-adjusted).
  - Generates faction-appropriate shop inventories for city nodes.
  - Provides the gold_reward field in loot fact_packets for Chronos.
"""

import random
from typing import Dict, List, Optional, Any

from ..dice import roll


# D&D 5e Individual Treasure (DMG Table, simplified)
# Maps CR band → (dice_count, dice_sides, multiplier_gp)
_CR_GOLD_TABLE: Dict[str, tuple] = {
    "0-4":   (1, 6,  10),   # 1d6 × 10 gp
    "5-10":  (2, 6,  100),  # 2d6 × 100 gp
    "11-16": (4, 6,  100),  # 4d6 × 100 gp
    "17+":   (4, 6,  1000), # 4d6 × 1000 gp
}

# Base appraisal value per rarity (gp)
_RARITY_BASE_GP: Dict[str, int] = {
    "Common":    10,
    "Uncommon":  50,
    "Rare":      200,
    "Very Rare": 1000,
    "Legendary": 5000,
}

# Shop stock tiers per node type (template_id prefixes to draw from)
# These are the SRD rarity tiers available per location type
_SHOP_RARITY_BY_TYPE: Dict[str, List[str]] = {
    "city":      ["Common", "Uncommon"],
    "dungeon":   [],          # No shops in dungeons
    "wilderness": ["Common"],
    "landmark":  ["Rare"],
}


def _cr_band(cr: float) -> str:
    if cr >= 17:
        return "17+"
    if cr >= 11:
        return "11-16"
    if cr >= 5:
        return "5-10"
    return "0-4"


class TreasurerClient:
    """
    The Treasurer — governs the economy of the Abyss.
    Pure deterministic logic following D&D 5e treasure tables.
    No LLM calls; Chronos narrates from the fact_packet this class enriches.
    """

    # ------------------------------------------------------------------
    # GOLD CALCULATION
    # ------------------------------------------------------------------

    def calculate_loot_gold(self, cr: float) -> int:
        """
        Roll gold reward using DMG individual treasure tables.
        Returns gold pieces (int).
        """
        band = _cr_band(cr)
        count, sides, multiplier = _CR_GOLD_TABLE[band]
        return roll(count, sides).total * multiplier

    def appraise_items(self, items: List[Dict[str, Any]], reputation: int = 0) -> int:
        """
        Calculate total sell value of a list of items.
        Reputation [-100..+100] shifts price by ±25%.
        Items are sold at 50% base value (D&D 5e PHB rule).
        """
        rep_modifier = 1.0 + (reputation / 400)  # ±25% range
        total = 0
        for item in items:
            rarity = item.get("rarity", "Common")
            base = _RARITY_BASE_GP.get(rarity, 10)
            sell_price = int((base * 0.5) * rep_modifier)
            total += sell_price
        return max(0, total)

    def buy_price(self, rarity: str, reputation: int = 0) -> int:
        """
        Buy price for a single item at current reputation.
        High reputation → merchants trust you less (pay more for rare items).
        """
        base = _RARITY_BASE_GP.get(rarity, 10)
        rep_modifier = 1.0 - (reputation / 400)  # High rep = slight discount
        return max(1, int(base * rep_modifier))

    # ------------------------------------------------------------------
    # SHOP INVENTORY
    # ------------------------------------------------------------------

    def get_shop_rarities(self, node_type: str) -> List[str]:
        """Return the rarity tiers available in a given location type."""
        return _SHOP_RARITY_BY_TYPE.get(node_type, [])

    def has_shop(self, node_type: str) -> bool:
        return bool(self.get_shop_rarities(node_type))

    # ------------------------------------------------------------------
    # FACT PACKET ENRICHMENT
    # ------------------------------------------------------------------

    def enrich_loot_packet(
        self,
        fact_packet: Dict[str, Any],
        cr: float,
        items: List[Dict[str, Any]],
        reputation: int = 0,
    ) -> Dict[str, Any]:
        """
        Inject gold and appraisal data into a loot fact_packet for Chronos.
        Returns the enriched packet.
        """
        gold = self.calculate_loot_gold(cr)
        sell_value = self.appraise_items(items, reputation)
        item_names = [i.get("name", "item") for i in items[:3]]  # First 3 for narrative

        fact_packet.update({
            "gold_reward": gold,
            "sell_value": sell_value,
            "notable_items": item_names,
            "cr": cr,
        })
        return fact_packet

    # ------------------------------------------------------------------
    # GOLD SUMMARY (for system LOG)
    # ------------------------------------------------------------------

    def gold_summary(self, gold: int, items: List[Dict[str, Any]]) -> str:
        """Short plain-text summary for the system LOG event."""
        if not items:
            return f"Found {gold} gp."
        names = ", ".join(i.get("name", "item") for i in items[:2])
        suffix = f" and {len(items) - 2} more" if len(items) > 2 else ""
        return f"Found {gold} gp. Items: {names}{suffix}."
