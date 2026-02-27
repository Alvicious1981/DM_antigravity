import json
import os
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime

class MemoryKeeper:
    """
    The Lore Keeper of the Abyss.
    Responsibility: Maintain consistency and persistence of the world state.

    Phase 1 upgrade: now persists combat encounter contexts so that Chronos
    can reference *why* a battle happened — not just what the dice said.
    """

    def __init__(self, storage_dir: str = ".antigravity_data"):
        self.storage_path = Path(storage_dir)
        self.storage_path.mkdir(exist_ok=True)

        self.lore_path = self.storage_path / "WORLD_LORE.json"
        self.session_log_path = self.storage_path / "SESSION_LOG.md"
        self.combat_log_path = self.storage_path / "COMBAT_LOG.json"

        self.lore = self._load_lore()
        self.combat_log: List[Dict[str, Any]] = self._load_combat_log()

    # ------------------------------------------------------------------
    # PERSISTENCE
    # ------------------------------------------------------------------

    def _load_lore(self) -> Dict[str, Any]:
        if self.lore_path.exists():
            with open(self.lore_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return {
            "factions": {},
            "npcs": {},
            "locations": {},
            "world_state": {
                "day": 1,
                "tension": "low",
                "active_conflicts": [],
                "reputation": 0,    # Regional favor: -100 (infamous) to +100 (heroic)
                "fractures": [],    # Narrative 'scars'
                "secrets": [],      # Global secrets and their state
            },
            "alignment_ethics": {
                "party_philosophy": "Neutral", # Evolving stance based on choices
                "world_vibe": "Gritty",
            }
        }

    def _load_combat_log(self) -> List[Dict[str, Any]]:
        """Load persisted combat encounter contexts from COMBAT_LOG.json."""
        if self.combat_log_path.exists():
            with open(self.combat_log_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return []

    def save_lore(self):
        with open(self.lore_path, "w", encoding="utf-8") as f:
            json.dump(self.lore, f, indent=2, ensure_ascii=False)

    def _save_combat_log(self):
        with open(self.combat_log_path, "w", encoding="utf-8") as f:
            json.dump(self.combat_log, f, indent=2, ensure_ascii=False)

    # ------------------------------------------------------------------
    # SESSION LOG
    # ------------------------------------------------------------------

    def log_event(self, entry: str):
        """Append a visceral chronicle entry to the SESSION_LOG."""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        with open(self.session_log_path, "a", encoding="utf-8") as f:
            f.write(f"### {timestamp}\n{entry}\n\n")

    # ------------------------------------------------------------------
    # NPC MEMORY
    # ------------------------------------------------------------------

    def record_npc_interaction(
        self, npc_id: str, effect: str, attitude_shift: int = 0
    ):
        """Update NPC status and attitude based on interaction."""
        if npc_id not in self.lore["npcs"]:
            self.lore["npcs"][npc_id] = {
                "traits": [],
                "attitude": 0,
                "status": "active",
                # Phase 1: NPC now has 3-layer depth structure (Mask / Drive / Wound)
                "mask": "",        # What they show the world
                "drive": "",       # Their hidden desire
                "wound": "",       # The formative trauma beneath it all
            }

        self.lore["npcs"][npc_id]["attitude"] += attitude_shift
        self.log_event(f"NPC Interaction [{npc_id}]: {effect}")
        self.save_lore()

    def set_npc_depth(
        self,
        npc_id: str,
        mask: str = "",
        drive: str = "",
        wound: str = "",
    ):
        """
        Phase 1 — Assign the 3-layer depth profile for an NPC.
        mask  = what they project publicly
        drive = their hidden desire
        wound = the formative trauma that explains everything
        """
        if npc_id not in self.lore["npcs"]:
            self.lore["npcs"][npc_id] = {
                "traits": [], "attitude": 0, "status": "active",
            }
        self.lore["npcs"][npc_id].update({
            "mask": mask,
            "drive": drive,
            "wound": wound,
        })
        self.save_lore()

    # ------------------------------------------------------------------
    # PHASE 3 — DYNAMISM & CONSEQUENCES
    # ------------------------------------------------------------------

    def update_reputation(self, delta: int, reason: str):
        """Update regional reputation and log the reason."""
        old_rep = self.lore["world_state"].get("reputation", 0)
        new_rep = max(-100, min(100, old_rep + delta))
        self.lore["world_state"]["reputation"] = new_rep
        self.log_event(f"REPUTATION SHIFT: {old_rep} -> {new_rep} ({reason})")
        self.save_lore()

    def add_fracture(self, name: str, description: str):
        """Add a 'Fracture' — a permanent narrative consequence of failure or choice."""
        fracture = {
            "name": name,
            "description": description,
            "timestamp": datetime.now().isoformat()
        }
        if "fractures" not in self.lore["world_state"]:
            self.lore["world_state"]["fractures"] = []
        self.lore["world_state"]["fractures"].append(fracture)
        self.log_event(f"WORLD FRACTURE: {name} - {description}")
        self.save_lore()

    # ------------------------------------------------------------------
    # PHASE 4 — MASTERY: SECRETS & ETHICS
    # ------------------------------------------------------------------

    def register_secret(self, secret: Dict[str, Any]):
        """Register a new secret into the world state (if not already there)."""
        if "secrets" not in self.lore["world_state"]:
            self.lore["world_state"]["secrets"] = []
            
        # Check for duplicates
        if not any(s["id"] == secret["id"] for s in self.lore["world_state"]["secrets"]):
            self.lore["world_state"]["secrets"].append(secret)
            self.save_lore()

    def reveal_secret(self, secret_id: str):
        """Mark a secret as revealed — making the 'Truth' part of the AI context."""
        for s in self.lore["world_state"].get("secrets", []):
            if s["id"] == secret_id:
                s["is_revealed"] = True
                self.log_event(f"SECRET REVEALED: {s['id']} - The truth is out.")
                self.save_lore()
                return
        self.log_event(f"REVEAL WARNING: Secret '{secret_id}' not found.")

    def update_party_philosophy(self, new_stance: str):
        """Update the perceived moral/ethical stance of the party."""
        self.lore["alignment_ethics"]["party_philosophy"] = new_stance
        self.log_event(f"ETHICAL SHIFT: Party is now perceived as {new_stance}")
        self.save_lore()

    # ------------------------------------------------------------------
    # PHASE 1 — COMBAT ENCOUNTER CONTEXT PERSISTENCE
    # ------------------------------------------------------------------

    def log_combat_encounter(
        self,
        encounter_id: str,
        encounter_context: Dict[str, Any],
        outcome: Optional[str] = None,
    ):
        """
        Persist the narrative context of a combat encounter so Chronos can
        reference it in future sessions ('Remember that fight with the deserters?').

        Args:
            encounter_id:      Unique identifier (e.g. 'dungeon_lv2_room3').
            encounter_context: The dict from EncounterContext.to_fact_packet_fragment().
            outcome:           e.g. 'players_won', 'enemies_fled', 'tpk', 'negotiated'.
        """
        record = {
            "id": encounter_id,
            "timestamp": datetime.now().isoformat(),
            "context": encounter_context,
            "outcome": outcome or "unresolved",
        }
        self.combat_log.append(record)
        self._save_combat_log()

        # Also write a human-readable entry to the session log
        ctx = encounter_context.get("encounter_context", encounter_context)
        self.log_event(
            f"[COMBAT: {encounter_id}]\n"
            f"  Archetype : {ctx.get('archetype', '?')}\n"
            f"  Motivation: {ctx.get('motivation', '?')}\n"
            f"  Stake     : {ctx.get('stake', '?')}\n"
            f"  Outcome   : {outcome or 'pending'}"
        )

    def resolve_combat_encounter(self, encounter_id: str, outcome: str):
        """
        Update the outcome of a previously logged encounter.
        Call this at the end of every fight.
        """
        for record in reversed(self.combat_log):
            if record["id"] == encounter_id:
                record["outcome"] = outcome
                self._save_combat_log()
                
                # Phase 3: Automatic Dynamism Logic
                # Map outcomes to reputation and world changes
                if outcome == "players_won":
                    self.update_reputation(10, f"Victory in {encounter_id}")
                elif outcome == "enemies_fled":
                    self.update_reputation(5, f"Routed enemies in {encounter_id}")
                elif outcome == "players_fled":
                    self.update_reputation(-5, f"Retreated from {encounter_id}")
                elif outcome == "tpk" or outcome == "defeat":
                    self.update_reputation(-20, f"Crushing defeat in {encounter_id}")
                    self.add_fracture(f"Shadow of {encounter_id}", "The enemy has grown bolder after your defeat.")

                self.log_event(
                    f"[COMBAT RESOLVED: {encounter_id}] Outcome: {outcome}"
                )
                return
        # If not found, log a warning
        self.log_event(
            f"[COMBAT RESOLVE WARNING] No encounter with id '{encounter_id}' found."
        )

    def get_recent_encounters(self, limit: int = 3) -> List[Dict[str, Any]]:
        """Return the N most recent combat encounters for Chronos context injection."""
        if not self.combat_log:
            return []
        # Use a positive start index to satisfy strict type checkers (Pyre2)
        start = max(0, len(self.combat_log) - limit)
        return list(self.combat_log[start:])

    # ------------------------------------------------------------------
    # AI CONTEXT SYNTHESIS
    # ------------------------------------------------------------------

    def get_context_for_ai(self) -> str:
        """
        Synthesize current lore, NPC state, and recent combats into a
        context block for Chronos to consume.
        """
        lines: List[str] = ["WORLD LORE SUMMARY:"]

        # NPC snapshot
        for npc, data in self.lore["npcs"].items():
            attitude = data.get("attitude", 0)
            status = data.get("status", "unknown")
            mask = data.get("mask", "")
            drive = data.get("drive", "")
            npc_line = f"- {npc}: Attitude {attitude:+d}, Status: {status}"
            if mask:
                npc_line += f" | Projects: '{mask}'"
            if drive:
                npc_line += f" | Wants: '{drive}'"
            lines.append(npc_line)

        # World state
        state = self.lore["world_state"]
        lines.append(f"\nCURRENT STATE: Day {state.get('day')}, Tension: {state.get('tension')}")
        lines.append(f"REPUTATION: {state.get('reputation', 0)}/100")
        
        fractures = state.get("fractures", [])
        if fractures:
            lines.append("FRACTURES (World Scars):")
            for f in fractures:
                lines.append(f"  - {f['name']}: {f['description']}")

        # Recent combat encounters (Phase 1)
        recent = self.get_recent_encounters(limit=3)
        if recent:
            lines.append("\nRECENT COMBAT HISTORY:")
            for enc in recent:
                ctx = enc.get("context", {}).get("encounter_context", enc.get("context", {}))
                archetype = ctx.get("archetype", "Unknown encounter")
                outcome = enc.get("outcome", "unresolved")
                lines.append(f"  - [{enc['id']}] {archetype} → Outcome: {outcome}")

        # Phase 4: Secrets (Clues vs Truths)
        secrets = state.get("secrets", [])
        if secrets:
            lines.append("\nWORLD SECRETS:")
            for s in secrets:
                if s.get("is_revealed"):
                    lines.append(f"  - [REVEALED] {s['id']}: {s['truth']}")
                else:
                    lines.append(f"  - [CLUE] {s['clue']}")
        
        # Phase 4: Philosophical context
        ethics = self.lore.get("alignment_ethics", {})
        lines.append(f"\nWORLD ETHOS: {ethics.get('world_vibe')} | Party Stance: {ethics.get('party_philosophy')}")

        return "\n".join(lines)
