import random
from typing import List, Dict, Any

class NarrativeHooks:
    """
    The Weaver of Whispers.
    Responsibility: Generate immediate narrative 'seeds' for PNJ and environments.
    """

    NPC_TRAITS = [
        "A nervous twitch in the left eye.",
        "Smells strongly of bitter almonds.",
        "Wears a ring with a broken seal.",
        "Speaks in a melodic, rhythmic whisper.",
        "Has stained fingers from ink or alchemy.",
        "Avoids direct eye contact, looking at your shadow instead.",
        "A deep, rasping cough that sounds like grinding stone.",
        "Wears a necklace of small, bleached bones."
    ]

    SENSORY_SEEDS = {
        "dungeon": [
            "The air is thick with the scent of wet fur and decay.",
            "Water drips rhythmically, echoing like a distant heartbeat.",
            "The walls are cold to the touch, slick with a black, oily residue.",
            "A faint, high-pitched whistling winds through the corridor."
        ],
        "forest": [
            "The trees huddle close, their leaves shivering without wind.",
            "The ground is soft, unnervingly like treading on moss-covered flesh.",
            "A heavy silence hangs in the air, broken only by a distant, mournful owl.",
            "The smell of damp earth and crushed mint is overwhelming."
        ],
        "city": [
            "The stench of offal and stale ale is a constant weight.",
            "Distant shouting and the rattle of iron wheels on cobblestone.",
            "The smoky haze of coal fires stings the eyes.",
            "A sudden chill as you pass a darkened alleyway."
        ]
    }

    @classmethod
    def generate_npc_hook(cls) -> str:
        """Return a '3-line' style depth hook for a PNJ."""
        trait = random.choice(cls.NPC_TRAITS)
        return f"Trait: {trait}"

    @classmethod
    def get_sensory_seed(cls, biome: str = "dungeon") -> str:
        """Generate a Sensory Seed for a specific environment."""
        seeds = cls.SENSORY_SEEDS.get(biome.lower(), cls.SENSORY_SEEDS["dungeon"])
        return random.choice(seeds)
