import json
import os
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime

class MemoryKeeper:
    """
    The Lore Keeper of the Abyss.
    Responsibility: Maintain consistency and persistence of the world state.
    """

    def __init__(self, storage_dir: str = ".antigravity_data"):
        self.storage_path = Path(storage_dir)
        self.storage_path.mkdir(exist_ok=True)
        
        self.lore_path = self.storage_path / "WORLD_LORE.json"
        self.session_log_path = self.storage_path / "SESSION_LOG.md"
        
        self.lore = self._load_lore()

    def _load_lore(self) -> Dict[str, Any]:
        if self.lore_path.exists():
            with open(self.lore_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {
            "factions": {},
            "npcs": {},
            "locations": {},
            "world_state": {
                "day": 1,
                "tension": "low",
                "active_conflicts": []
            }
        }

    def save_lore(self):
        with open(self.lore_path, 'w', encoding='utf-8') as f:
            json.dump(self.lore, f, indent=2, ensure_ascii=False)

    def log_event(self, entry: str):
        """Append a visceral chronicle entry to the SESSION_LOG."""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        with open(self.session_log_path, 'a', encoding='utf-8') as f:
            f.write(f"### {timestamp}\n{entry}\n\n")

    def record_npc_interaction(self, npc_id: str, effect: str, attitude_shift: int = 0):
        """Update NPC status and attitude based on interaction."""
        if npc_id not in self.lore["npcs"]:
            self.lore["npcs"][npc_id] = {"traits": [], "attitude": 0, "status": "active"}
        
        self.lore["npcs"][npc_id]["attitude"] += attitude_shift
        self.log_event(f"NPC Interaction [{npc_id}]: {effect}")
        self.save_lore()

    def get_context_for_ai(self) -> str:
        """Synthesize current lore and recent log for Chronos context."""
        context = "WORLD LORE SUMMARY:\n"
        for npc, data in self.lore["npcs"].items():
            context += f"- {npc}: Attitude {data['attitude']}, Status {data.get('status', 'unknown')}\n"
        
        context += f"\nCURRENT STATE: {json.dumps(self.lore['world_state'])}\n"
        return context
