"""
Dungeon Cortex — Cartographer Agent (§ Agent Triumvirate)
Responsibility: Govern what happens when the party moves through the world.
  - Maps node types to biomes for sensory richness.
  - Deterministically decides if travel triggers a random encounter.
  - Builds the full fact_packet for Chronos, injecting EncounterContext when needed.
  - Integrates with MemoryKeeper to log travel and encounters.
"""

import random
from typing import Optional, Dict, Any

from ..maps import MapNode
from .narrative_hooks import NarrativeHooks, EncounterContext
from .memory_keeper import MemoryKeeper


# Node type → biome for NarrativeHooks sensory seeds and encounter props
_TYPE_TO_BIOME: Dict[str, str] = {
    "city":      "tavern",
    "dungeon":   "dungeon",
    "wilderness": "forest",
    "landmark":  "ruins",
}

# Risk level bands for encounter description flavour
_RISK_FLAVOUR: Dict[int, str] = {
    1: "calm",
    3: "uneasy",
    5: "dangerous",
    8: "deadly",
}


def _risk_flavour(risk_level: int) -> str:
    closest = min(_RISK_FLAVOUR.keys(), key=lambda k: abs(k - risk_level))
    return _RISK_FLAVOUR[closest]


class CartographerClient:
    """
    The Cartographer — governs movement through the world.
    Pure deterministic logic; no LLM calls.  Chronos handles narration from the
    enriched fact_packet this class produces.
    """

    def __init__(self, memory_keeper: Optional[MemoryKeeper] = None):
        self.memory = memory_keeper or MemoryKeeper()

    # ------------------------------------------------------------------
    # BIOME MAPPING
    # ------------------------------------------------------------------

    def get_biome(self, node: MapNode) -> str:
        return _TYPE_TO_BIOME.get(node.type, "dungeon")

    # ------------------------------------------------------------------
    # ENCOUNTER TRIGGER (§ OSR Protocol — No Quantum Ogres)
    # ------------------------------------------------------------------

    def should_trigger_encounter(self, node: MapNode, rolls: int = 1) -> bool:
        """
        Per-step encounter check.
        Probability = risk_level * 10% (capped at 80%).
        City nodes never trigger random encounters.
        """
        if node.type == "city":
            return False
        chance = min(node.risk_level * 10, 80)
        return any(random.randint(1, 100) <= chance for _ in range(rolls))

    # ------------------------------------------------------------------
    # FACT PACKET BUILDER
    # ------------------------------------------------------------------

    def build_travel_fact_packet(
        self,
        node: MapNode,
        world_context: Optional[Dict[str, Any]] = None,
        force_encounter: bool = False,
    ) -> Dict[str, Any]:
        """
        Build a Chronos-ready fact_packet for a travel event.
        Optionally injects EncounterContext if the encounter check passes.
        Logs the travel to MemoryKeeper session log.
        """
        biome = self.get_biome(node)
        flavour = _risk_flavour(node.risk_level)

        packet: Dict[str, Any] = {
            "action_type": "travel",
            "destination": node.name,
            "description": node.description,
            "risk_level": node.risk_level,
            "risk_flavour": flavour,
            "biome": biome,
            "sensory_seed": NarrativeHooks.get_sensory_seed(biome),
        }

        if world_context:
            packet["world_context"] = world_context

        # Encounter injection
        triggered = force_encounter or self.should_trigger_encounter(node)
        if triggered:
            ec: EncounterContext = NarrativeHooks.generate_encounter_context(biome=biome)
            packet.update(ec.to_fact_packet_fragment())
            # Log for future Chronos context
            self.memory.log_combat_encounter(
                encounter_id=f"travel_{node.id}_{random.randint(1000, 9999)}",
                encounter_context=ec.to_fact_packet_fragment(),
            )

        # Session log
        encounter_note = " [ENCOUNTER TRIGGERED]" if triggered else ""
        self.memory.log_event(
            f"[TRAVEL] Arrived at {node.name} (risk={node.risk_level}, biome={biome}){encounter_note}"
        )

        return packet

    # ------------------------------------------------------------------
    # ARRIVAL SUMMARY (for UI log — short, plain text)
    # ------------------------------------------------------------------

    def arrival_summary(self, node: MapNode) -> str:
        """One-line diegetic arrival note for the system LOG event."""
        flavour = _risk_flavour(node.risk_level)
        seed = NarrativeHooks.get_sensory_seed(self.get_biome(node))
        return f"{node.name}: {seed} The air here feels {flavour}."
