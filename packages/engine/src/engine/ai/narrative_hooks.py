import random
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional

# ---------------------------------------------------------------------------
# PHASE 1 — FUNDAMENTOS NARRATIVOS
# ---------------------------------------------------------------------------
# EncounterContext: el "alma" de cada combate.
# Cada encuentro ya no es un choque anónimo de estadísticas — es una situación
# con motivación, emoción y peso narrativo explícito.
# ---------------------------------------------------------------------------

@dataclass
class EncounterStake:
    """A specific narrative or tactical stake for the combat."""
    stake_type: str  # e.g. "Moral", "Tactical", "Identity", "World"
    description: str
    consequence: str

@dataclass
class InteractiveObject:
    """An object in the environment the players can use or must avoid."""
    name: str
    description: str
    tactical_use: str

@dataclass
class Secret:
    """A layered secret in the world lore."""
    id: str
    category: str  # e.g., "Cosmic", "Political", "Personal"
    clue: str      # What players see/hear (the hook)
    truth: str     # The hidden reality
    is_revealed: bool = False

@dataclass
class NPCProfile:
    """The 3-layer depth profile for a PNJ."""
    name: str
    mask: str        # What they show the world
    drive: str       # Their hidden desire
    wound: str       # The formative trauma
    traits: List[str]

@dataclass
class EncounterContext:
    """
    The soul of a combat encounter.
    Now expanded with Stakes and Interactive Objects for Phase 2.
    """
    enemy_archetype: str
    motivation: str
    emotional_state: str
    narrative_stake: str        # General summary stake
    specific_stakes: List[EncounterStake] = field(default_factory=list)
    interactive_objects: List[InteractiveObject] = field(default_factory=list)
    environment_hooks: List[str] = field(default_factory=list)
    opening_image: Optional[str] = None

    def to_fact_packet_fragment(self) -> Dict[str, Any]:
        """Serialize into the fact_packet sub-key that Chronos consumes."""
        return {
            "encounter_context": {
                "archetype": self.enemy_archetype,
                "motivation": self.motivation,
                "emotional_state": self.emotional_state,
                "stake": self.narrative_stake,
                "specific_stakes": [
                    {"type": s.stake_type, "description": s.description, "consequence": s.consequence}
                    for s in self.specific_stakes
                ] if self.specific_stakes else [],
                "interactive_objects": [
                    {"name": o.name, "description": o.description, "tactical_use": o.tactical_use}
                    for o in self.interactive_objects
                ] if self.interactive_objects else [],
                "env_hooks": self.environment_hooks,
                "opening_image": self.opening_image,
            }
        }


class NarrativeHooks:
    """
    The Weaver of Whispers.
    Responsibility: Generate immediate narrative 'seeds' for NPCs, environments,
    and now full EncounterContexts — turning stat blocks into stories.
    """

    # --- NPC Traits (3-line method) ---
    NPC_TRAITS = [
        "A nervous twitch in the left eye.",
        "Smells strongly of bitter almonds.",
        "Wears a ring with a broken seal.",
        "Speaks in a melodic, rhythmic whisper.",
        "Has stained fingers from ink or alchemy.",
        "Avoids direct eye contact, looking at your shadow instead.",
        "A deep, rasping cough that sounds like grinding stone.",
        "Wears a necklace of small, bleached bones.",
        "Constantly rolls a copper coin across scarred knuckles.",
        "A fresh burn scar across the palm — still raw.",
    ]

    # --- Sensory Environment Seeds ---
    SENSORY_SEEDS: Dict[str, List[str]] = {
        "dungeon": [
            "The air is thick with the scent of wet fur and decay.",
            "Water drips rhythmically, echoing like a distant heartbeat.",
            "The walls are cold to the touch, slick with a black, oily residue.",
            "A faint, high-pitched whistling winds through the corridor.",
        ],
        "forest": [
            "The trees huddle close, their leaves shivering without wind.",
            "The ground is soft, unnervingly like treading on moss-covered flesh.",
            "A heavy silence hangs in the air, broken only by a distant, mournful owl.",
            "The smell of damp earth and crushed mint is overwhelming.",
        ],
        "city": [
            "The stench of offal and stale ale is a constant weight.",
            "Distant shouting and the rattle of iron wheels on cobblestone.",
            "The smoky haze of coal fires stings the eyes.",
            "A sudden chill as you pass a darkened alleyway.",
        ],
        "ruins": [
            "Broken columns cast fractured shadows across the cracked stone floor.",
            "A persistent wind carries ash and the ghost-smell of old smoke.",
            "Something large moved behind the rubble — and then stopped.",
            "The silence here has weight, like held breath.",
        ],
        "tavern": [
            "The fire crackles but gives no warmth — everyone is watching the door.",
            "Spilled ale has dried into a dark map on the floorboards.",
            "Laughter dies three tables over. Someone just lost something important.",
            "The bard plays a funeral hymn, though no one asked for it.",
        ],
    }

    # --- Phase 2 Stakes ---
    STAKES_COLLECTION: Dict[str, List[Dict[str, str]]] = {
        "Moral": [
            {"description": "The villain has a valid point about the city's corruption.", "consequence": "Sparing them creates a powerful but dangerous political ally."},
            {"description": "Every kill here fuels a dark ritual you don't yet understand.", "consequence": "Violence has a direct, visible cost to the world's sanity."},
            {"description": "The 'monsters' are protecting their young in the next room.", "consequence": "Mercy leads to information; slaughter leads to a permanent reputational stain."},
        ],
        "Tactical": [
            {"description": "The platform you stand on is slowly sinking into the swamp.", "consequence": "Combat must end in 5 rounds or the party drowns."},
            {"description": "The enemy is trying to signal for reinforcements with a horn.", "consequence": "Failure to stop the horn doubles the enemy count."},
            {"description": "The room is filling with flammable gas.", "consequence": "Using fire damage triggers an explosion that affects everyone."},
        ],
        "Identity": [
            {"description": "The enemy leader knows a secret about your past.", "consequence": "If they die without speaking, the secret is lost forever."},
            {"description": "This fight mirrors the one where your master fell.", "consequence": "Overcoming this trauma provides a temporary surge of inspiration."},
        ],
    }

    # --- Phase 2 Interactive Objects ---
    INTERACTIVE_OBJECTS: Dict[str, List[Dict[str, str]]] = {
        "dungeon": [
            {"name": "Precarious Chandelier", "description": "A heavy, rusted iron chandelier hanging by a frayed rope.", "tactical_use": "Can be dropped to pin or crush enemies in a 10ft radius."},
            {"name": "Rotting Support Beam", "description": "A wooden beam holding back a section of loose ceiling.", "tactical_use": "Destroying it creates a 15ft zone of difficult terrain and deals damage."},
            {"name": "Alchemical Vats", "description": "Large ceramic vats filled with a pungent, bubbling green fluid.", "tactical_use": "Breaking them coats the floor in acid or slippery slime."},
        ],
        "forest": [
            {"name": "Wasp Nest", "description": "A massive, humming nest hanging low from a branch.", "tactical_use": "Range attack can drop it on an enemy, causing the 'Distracted' or 'Poisoned' condition."},
            {"name": "Tangle-Root Patch", "description": "A cluster of sentient, vine-like roots.", "tactical_use": "Can be used as a trap to entangle anyone who steps there."},
        ],
    }

    # --- Phase 3 Failure Consequences (Fractures) ---
    FAILURE_CONSEQUENCES: Dict[str, List[Dict[str, str]]] = {
        "Retreat": [
            {"name": "Lingering Mockery", "description": "The enemy spreads tales of your flight. Merchants are less likely to trust your protection."},
            {"name": "Lost Ground", "description": "A vital passage or room is now heavily barricaded and guarded by twice the forces."},
        ],
        "Defeat": [
            {"name": "The Taint of Failure", "description": "A dark shadow hangs over the region. The locals whisper that the light has gone out of your eyes."},
            {"name": "Enemy Ascendant", "description": "The enemy draws power from your blood. They now wield a weapon or spell they didn't have before."},
        ],
        "Sacrifice": [
            {"name": "The Ghost's Burden", "description": "A fallen comrade's spirit cannot rest until the task is finished. Their voice haunts your dreams."},
            {"name": "Vengeance Pact", "description": "The survivors have sworn a blood oath. They will not rest until the enemy leader's head is on a pike."},
        ]
    }

    # --- Phase 4 Abstract Secrets ---
    SECRETS_COLLECTION: List[Dict[str, str]] = [
        {
            "id": "bleeding_sun",
            "category": "Cosmic",
            "clue": "The sun stays blood-red for five minutes every noon. No shadow is cast.",
            "truth": "An ancient celestial parasite is feeding on the sun's core. The world is getting colder."
        },
        {
            "id": "silent_accord",
            "category": "Political",
            "clue": "The City Guard never enters the Weaver's District, even for murder.",
            "truth": "The Weaver's District is actually a sovereign extra-planar embassy. The King is its prisoner."
        },
        {
            "id": "the_broken_bell",
            "category": "Lore",
            "clue": "A bell that rings only when someone tells a lie that will change history.",
            "truth": "The bell is the heart of a dead god of Truth, trying to reboot reality."
        }
    ]

    @classmethod
    def generate_secret(cls) -> Secret:
        """Pick a deep lore secret from the collection."""
        data = random.choice(cls.SECRETS_COLLECTION)
        return Secret(
            id=str(data["id"]),
            category=str(data["category"]),
            clue=str(data["clue"]),
            truth=str(data["truth"]),
            is_revealed=False
        )

    @classmethod
    def generate_failure_fracture(cls, failure_type: str = "Defeat") -> Dict[str, str]:
        """Generate a named fracture consequence for the world state."""
        category = failure_type if failure_type in cls.FAILURE_CONSEQUENCES else "Defeat"
        return random.choice(cls.FAILURE_CONSEQUENCES[category])
    NPC_MASKS = ["The Loyal Merchant", "The Ruthless Soldier", "The Humble Priest", "The Arrogant Noble"]
    NPC_DRIVES = ["Protect their family at all costs", "Amass enough wealth to buy freedom", "Find the person who betrayed them", "Prove they are not a failure"]
    NPC_WOUNDS = ["Saw their home burned as a child", "Was abandoned by their former mentor", "Carries the guilt of a comrade's death", "Lost their status to a false accusation"]

    # --- Action Resolution Templates (Show, Don't Tell) ---
    # Phase 1.2: Cinematic action descriptions replacing flat log strings.
    # Split into two typed dicts to avoid the mixed-value-type issue.
    _HIT_DESCRIPTIONS: Dict[str, List[str]] = {
        "slashing": [
            "{attacker}'s blade finds the gap between {target}'s ribs. Steel grinds bone.",
            "The arc of {attacker}'s sword catches the torchlight — and then catches {target}.",
            "{attacker} cuts deep. {target} staggers, one hand pressed to the wound as if surprised it happened.",
        ],
        "piercing": [
            "{attacker}'s arrow punches through leather and bites into flesh. {target} lurches.",
            "The thrust is economical, merciless — {attacker} drives the point through {target} without ceremony.",
            "{target} looks down at the bolt in their shoulder. {attacker} is already nocking the next.",
        ],
        "bludgeoning": [
            "{attacker}'s strike connects with a sound like wet timber. {target} goes down hard.",
            "The blow doesn't cut — it *shatters*. {target}'s vision whites out.",
            "{attacker} puts full weight behind it. {target} crumples under the force.",
        ],
        "fire": [
            "The flame catches {target}'s cloak before it catches flesh. The scream follows a half second later.",
            "{attacker}'s spell detonates against {target} in a wash of orange heat.",
            "The fire finds {target}. The smell of singed hair fills the air.",
        ],
        "cold": [
            "Ice creeps across {target}'s skin from the point of impact. They move slower now.",
            "{attacker}'s spell leaves a frost-rime where it touches {target}'s armor.",
            "The cold hits {target} like a wall. Their breath fogs. Their fingers go numb.",
        ],
        "lightning": [
            "Blue-white light traces {target}'s veins for a half-second before they drop.",
            "The thunderclap comes a beat after the bolt. {target} is already on one knee.",
            "{attacker}'s lightning finds {target} unerringly — charge always finds ground.",
        ],
        "necrotic": [
            "Where the darkness touches {target}, flesh grays and crumbles like old parchment.",
            "{attacker}'s magic drinks something from {target} — vitality, warmth, color.",
            "{target} screams not from pain but from absence — like something essential is suddenly missing.",
        ],
        "default": [
            "{attacker} lands a solid hit on {target}. Something gives way.",
            "The attack connects. {target} takes the blow without looking away from {attacker}'s eyes.",
            "{attacker} finds an opening. {target} had no answer for it.",
        ],
    }

    _MISS_DESCRIPTIONS: List[str] = [
        "{attacker} commits to the strike — {target} isn't where {attacker} expected them to be.",
        "Steel meets air. {target} exhales. The gap is closed before {attacker} can recover.",
        "{attacker}'s blade passes close enough to stir {target}'s hair. Not close enough to count.",
        "The blow goes wide. Not luck — {target} read it before {attacker} finished thinking it.",
        "{attacker} overextends, and {target} uses the moment. No damage. Worse — {attacker} is exposed.",
    ]

    # ------------------------------------------------------------------
    # PUBLIC API
    # ------------------------------------------------------------------

    @classmethod
    def generate_npc_profile(cls, name: str) -> NPCProfile:
        """
        Phase 2.2 — Generate a 3-layer NPC profile (Mask/Drive/Wound).
        This provides the AI with more than just a name; it gives it a soul.
        """
        mask = random.choice(cls.NPC_MASKS)
        drive = random.choice(cls.NPC_DRIVES)
        wound = random.choice(cls.NPC_WOUNDS)
        traits = random.sample(cls.NPC_TRAITS, 2)
        return NPCProfile(name=name, mask=mask, drive=drive, wound=wound, traits=traits)

    @classmethod
    def get_sensory_seed(cls, biome: Optional[str] = "dungeon") -> str:
        """Generate a Sensory Seed for a specific environment.
        Accepts None gracefully — falls back to 'dungeon'.
        """
        resolved = (biome or "dungeon").lower()
        seeds = cls.SENSORY_SEEDS.get(resolved, cls.SENSORY_SEEDS["dungeon"])
        return random.choice(seeds)

    @classmethod
    def generate_encounter_context(
        cls,
        enemy_type: Optional[str] = None,
        biome: Optional[str] = None,
    ) -> EncounterContext:
        """
        Phase 2.1 — Select or build an EncounterContext with Stakes and Objects.
        """
        # Load base templates
        templates = [
            {
                "enemy_archetype": "Deserters fleeing a razed village",
                "motivation": "Starvation and fear — they have nothing left to lose",
                "emotional_state": "Desperate and cornered, more dangerous for it",
                "narrative_stake": "The leader carries a map to the last survivor camp; their death means that secret dies with them",
                "environment_hooks": ["Torn military tabards", "A campfire still smoldering"],
                "opening_image": "They move from shadow to shadow like men who have forgotten how to walk in daylight.",
            },
            {
                "enemy_archetype": "Cultists performing a forbidden rite",
                "motivation": "True believers — death is an honor, an offering",
                "emotional_state": "Zealous ecstasy, unafraid of pain",
                "narrative_stake": "The rite is nearly complete; interrupting it now may be worse than letting it finish",
                "environment_hooks": ["Concentric circles of salt and ash", "Candles that burn black"],
                "opening_image": "They don't stop chanting even as they reach for their blades.",
            },
        ]
        # Pick a template randomly
        tpl = random.choice(templates)
        ctx = EncounterContext(
            enemy_archetype=str(tpl["enemy_archetype"]),
            motivation=str(tpl["motivation"]),
            emotional_state=str(tpl["emotional_state"]),
            narrative_stake=str(tpl["narrative_stake"]),
            environment_hooks=list(tpl["environment_hooks"]),
            opening_image=str(tpl["opening_image"]) if tpl.get("opening_image") else None
        )
        
        # Add Stakes (Phase 2)
        random_type = random.choice(list(cls.STAKES_COLLECTION.keys()))
        stake_info = random.choice(cls.STAKES_COLLECTION[random_type])
        ctx.specific_stakes.append(EncounterStake(
            stake_type=str(random_type),
            description=str(stake_info["description"]),
            consequence=str(stake_info["consequence"])
        ))
        
        # Add Interactive objects (Phase 2)
        biome_key = (biome or "dungeon").lower()
        objs = cls.INTERACTIVE_OBJECTS.get(biome_key, cls.INTERACTIVE_OBJECTS["dungeon"])
        obj_info = random.choice(objs)
        ctx.interactive_objects.append(InteractiveObject(
            name=str(obj_info["name"]),
            description=str(obj_info["description"]),
            tactical_use=str(obj_info["tactical_use"])
        ))
        
        if biome:
            ctx.environment_hooks.append(cls.get_sensory_seed(str(biome)))
        return ctx

    @classmethod
    def narrate_action(
        cls,
        attacker: str,
        target: str,
        hit: bool,
        damage_type: str = "default",
    ) -> str:
        """
        Phase 1.2 — 'Show, Don't Tell' action description.
        Returns a cinematic sentence for a hit or miss — no numbers, no labels.
        Chronos will embed this as the `narrative_hook` in the fact packet.
        """
        if not hit:
            template: str = random.choice(cls._MISS_DESCRIPTIONS)
            return template.format(attacker=attacker, target=target)

        dtype_key = damage_type.lower() if damage_type.lower() in cls._HIT_DESCRIPTIONS else "default"
        template = random.choice(cls._HIT_DESCRIPTIONS[dtype_key])
        return template.format(attacker=attacker, target=target)
