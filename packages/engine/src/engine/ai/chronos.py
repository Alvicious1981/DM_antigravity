
import os
import asyncio
import textwrap
import json
from typing import AsyncGenerator, Dict, Any, Optional
from google import genai
from .tokenomics import reporter as tokenomics_reporter
from .memory import MemoryService
from .memory_keeper import MemoryKeeper

class ChronosClient:
    """
    The Narrative Agent (Chronos).
    Responsibility: Translate strict JSON 'Fact Packets' into visceral, diegetic prose.
    Adheres to the 'Code is Law' principle: The narrative cannot contradict the JSON.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.is_mock = not self.api_key
        
        # Internal Lore/History Persistence (Phase 2 Upgrade)
        self.memory_keeper = MemoryKeeper()
        
        if not self.is_mock:
            self.client = genai.Client(api_key=self.api_key)
            self.memory_service = MemoryService(api_key=self.api_key)
            
        self.system_prompt = textwrap.dedent("""
            ID: CHRONOS. ROLE: SUPREME ARBITRATOR (AD&D 5e/OSR).
            LAWS:
            1. CODE IS LAW: Follow JSON Pact (h:hit, d:dmg, t:type). No contradictions.
            2. V6 AESTHETIC: Visceral Dark Fantasy. Tone: Gritty, oppressive.
            3. SHOW, DON'T TELL: Use the Five Senses (smell of ozone, taste of iron, rasp of steel).
               No game numbers or "critical hit". Use diegetic weight ("a blow that shatters ribs").
            4. ENCOUNTER SOUL: If an ENCOUNTER_CONTEXT is provided, the enemies are
               NOT generic stat-blocks. Weave their archetype, motivation, and emotional state
               into every description. A desperate man fights differently than a zealot.
            5. OSR PROTOCOLS: Narrative must reflect monster morale and reaction tables.
               The first sign of an enemy is a "Trace" (tracks, heat, sound).
            6. NO QUANTUM OGRES: Telegraph danger. If the pact contains environment hooks, use them.
            7. LORE FAITHFULNESS: Respect the WORLD_LORE, SESSION_LOG, and COMBAT_HISTORY context.
            8. DENSE: 1-2 sentences of pure, evocative prose. No labels. No numbers.
            9. INTERACTIVE WORLD: Use 'interactive_objects' in the fact packet to bridge mechanics and narrative. 
               If a chandelier is listed, describe how it sways or how light reflects off it, inviting players to use it.
            11. REPUTATIONAL TONE: If reputation is high, narrate with a sense of destiny. If low, narrate with a sense of doom and rejection.
            12. WORLD SCARS: If fractures are present, mention their effects (e.g., barricaded doors, fearful whispers of locals).
            13. ARBITRATOR PHILOSOPHY: You are the impartial Law of the world. Do not judge the players; describe the WEIGHT of their choices. AD&D is about consequence, not fairness.
            14. SECRET LAYERS: If a secret is present as a [CLUE], hint at it. If [REVEALED], integrate its Truth into the environment or character motivations.
        """)

    async def generate_narrative(self, fact_packet: Dict[str, Any]) -> AsyncGenerator[str, None]:
        """
        Stream narrative text based on the fact packet.
        """
        accumulated_text = ""
        if self.is_mock:
            async for chunk in self._generate_mock_narrative(fact_packet):
                accumulated_text += chunk
                yield chunk
        else:
            try:
                async for chunk in self._generate_real_narrative(fact_packet):
                    accumulated_text += chunk
                    yield chunk
                
                # RUNTIME FAITHFULNESS CHECK (Phase 2)
                asyncio.create_task(self._verify_faithfulness(fact_packet, accumulated_text))
            except Exception as e:
                print(f"Chronos API Error: {e}. Falling back to mock.")
                async for chunk in self._generate_mock_narrative(fact_packet):
                    accumulated_text += chunk
                    yield chunk

        # 3. Log to Session Log (Common for both real and mock)
        self.memory_keeper.log_event(f"Chronos: {accumulated_text}")

    def _compress_pact(self, fact_packet: Dict[str, Any]) -> str:
        """Map verbose keys to short tokens for input efficiency."""
        mapping = {
            "action_type": "act", "attacker": "atk", "target": "trg",
            "hit": "h", "damage_total": "d", "damage_type": "t",
            "save_success": "s", "spell_name": "sp", "weapon_name": "w",
            "is_player": "plr"
        }
        compressed = {mapping.get(k, k): v for k, v in fact_packet.items()}
        return json.dumps(compressed)

    async def _generate_real_narrative(self, fact_packet: Dict[str, Any]) -> AsyncGenerator[str, None]:
        """
        Call Gemini API to generate real narrative with semantic memory.
        """
        # New google-genai async streaming logic
        pact = self._compress_pact(fact_packet)
        context_memories = ""

        # 1. Semantic Search Memories
        if not self.is_mock and self.memory_service:
            search_query = f"{fact_packet.get('attacker', '')} {fact_packet.get('action_type', '')} {fact_packet.get('target', '')}"
            memories = self.memory_service.retrieve_similar_memories(search_query, limit=2)
            if memories:
                context_memories = "\nMEMORIES:\n" + "\n".join([f"- {m['content']}" for m in memories])

        # 2. Structural Lore Context (Lore Keeper — now includes COMBAT_HISTORY)
        lore_context = f"\nLORE CONTEXT:\n{self.memory_keeper.get_context_for_ai()}"

        # 3. Phase 1 — Encounter Context injection
        encounter_block = self._build_encounter_block(fact_packet)
        reputation_block = self._build_reputation_block(fact_packet)

        # Build final prompt
        prompt = f"FACTS: {json.dumps(fact_packet)}\n"
        if encounter_block:
            prompt += f"{encounter_block}\n"
        if reputation_block:
            prompt += f"{reputation_block}\n"
        if context_memories:
            prompt += f"{context_memories}\n"
        if lore_context:
            prompt += f"{lore_context}\n"
        prompt += "NARRATE:"
        
        # Async stream
        stream = await self.client.aio.models.generate_content(
            model='gemini-1.5-flash',
            contents=f"{self.system_prompt}\n\n{prompt}",
            config={'stream': True}
        )
        
        async for chunk in stream:
            if chunk.text:
                yield chunk.text
        
        # Metadata check (optional for async stream)
        # Note: tokenomics reporting might be simplified for async if metadata is not easily available on stream object in this version
        # For now, skipping tokenomics for async stream to ensure correctness.
        pass

    def _build_encounter_block(self, fact_packet: Dict[str, Any]) -> str:
        """
        If the fact_packet contains an 'encounter_context' sub-dict,
        format it as a readable block for the Chronos prompt.
        """
        ec = fact_packet.get("encounter_context")
        if not ec or not isinstance(ec, dict):
            return ""

        lines = ["\nENCOUNTER_CONTEXT:"]
        if ec.get("archetype"):
            lines.append(f"  WHO  : {ec['archetype']}")
        if ec.get("motivation"):
            lines.append(f"  WHY  : {ec['motivation']}")
        if ec.get("emotional_state"):
            lines.append(f"  MOOD : {ec['emotional_state']}")
        if ec.get("stake"):
            lines.append(f"  STAKE: {ec['stake']}")
        
        # Stakes & Interactive Objects (Phase 2)
        stakes = ec.get("specific_stakes", [])
        if stakes and isinstance(stakes, list):
            lines.append("  SPECIFIC STAKES:")
            for s in stakes:
                lines.append(f"    - [{s.get('type')}] {s.get('description')} (CONSEQUENCE: {s.get('consequence')})")
        
        objects = ec.get("interactive_objects", [])
        if objects and isinstance(objects, list):
            lines.append("  INTERACTIVE PROPS:")
            for o in objects:
                lines.append(f"    - {o.get('name')}: {o.get('description')} (TACTICAL: {o.get('tactical_use')})")
        
        return "\n".join(lines)

    def _build_reputation_block(self, fact_packet: Dict[str, Any]) -> str:
        """
        Extract reputation and world fractures from the fact packet context.
        These are usually injected into the fact_packet by the MemoryKeeper before prompt generation.
        """
        # Note: In a real simulation, these would be part of the 'world_context' sub-key
        world = fact_packet.get("world_context", {})
        if not world:
            return ""

        lines = ["\nREGIONAL STATUS:"]
        rep = world.get("reputation", 0)
        tone = "HEROIC" if rep > 50 else "ESTEEMED" if rep > 20 else "INFAMOUS" if rep < -50 else "DISTRUSTED" if rep < -20 else "NEUTRAL"
        lines.append(f"  REPUTATION: {rep} ({tone})")
        
        fractures = world.get("fractures", [])
        if fractures:
            lines.append("  ACTIVE FRACTURES:")
            for f in fractures:
                lines.append(f"    - {f.get('name')}: {f.get('description')}")

        # Phase 4: Secrets & Ethics in Prompt
        secrets = world.get("secrets", [])
        if secrets:
            lines.append("  ACTIVE SECRETS:")
            for s in secrets:
                status = "REVEALED" if s.get("is_revealed") else "CLUE ONLY"
                content = s.get("truth") if s.get("is_revealed") else s.get("clue")
                lines.append(f"    - [{status}] {s.get('id')}: {content}")
        
        ethics = world.get("ethics", {})
        if ethics:
            lines.append(f"  WORLD ETHOS: {ethics.get('vibe')} | Party Stance: {ethics.get('philosophy')}")

        return "\n".join(lines)

    async def _verify_faithfulness(self, fact_packet: Dict[str, Any], narrative: str):
        """
        Background check to verify the narrative doesn't contradict the fact packet.
        Inspired by RAGAS Faithfulness metric.
        """
        audit_prompt = textwrap.dedent(f"""
            Role: ALIGNMENT JUDGE.
            Goal: Verify if the NARRATIVE contradicts the FACT PACKET.
            
            FACT PACKET: {json.dumps(fact_packet)}
            NARRATIVE: "{narrative}"
            
            Rules:
            1. If { { 'hit': True } } and narrative says 'miss', it's a CONTRADICTION.
            2. If damage values or types are misrepresented, it's a CONTRADICTION.
            3. Tone/Style violations are NOT contradictions.
            
            Output: JSON {{"aligned": true/false, "reason": "..."}}
        """)
        
        try:
            response = await asyncio.to_thread(
                self.client.models.generate_content,
                model='gemini-1.5-flash',
                contents=audit_prompt,
                config={'response_mime_type': 'application/json'}
            )
            
            # Use Tokenomics for Audit Tracking
            if hasattr(response, 'usage_metadata'):
                usage = response.usage_metadata
                tokenomics_reporter.report_usage(
                    agent_id="JudicialGuard",
                    prompt_tokens=usage.prompt_token_count,
                    completion_tokens=usage.candidates_token_count,
                    model="gemini-1.5-flash"
                )
            
            check = json.loads(response.text)
            if not check.get("aligned", True):
                print(f"⚠️ [AI ALIGNMENT ALERT] Faithfulness breach detected: {check.get('reason')}")
            else:
                print(f"✅ [AI ALIGNMENT] Faithfulness verified for {fact_packet.get('action_type')}")
                
        except Exception as e:
            print(f"❌ [FaithfulnessGuard] Error during audit: {e}")

    async def _generate_mock_narrative(self, fact_packet: Dict[str, Any]) -> AsyncGenerator[str, None]:
        """
        Mock generator for testing/dev without API costs.
        Phase 1 upgrade: uses Show-Don't-Tell cinematic templates instead of
        flat stat-dump strings. EncounterContext is woven in when present.
        """
        import random as _random

        action_type = fact_packet.get("action_type", "unknown")
        ec = fact_packet.get("encounter_context", {})
        ec_mood   = ec.get("emotional_state", "")
        ec_image  = ec.get("opening_image", "")

        narrative: str = ""

        if action_type in ("attack", "spell_attack"):
            attacker = fact_packet.get("attacker", "The combatant")
            target   = fact_packet.get("target", "the foe")
            is_hit   = fact_packet.get("hit", False)
            dtype    = fact_packet.get("damage_type", "default").lower()

            # Phase 1: use the narrative_hook if Chronos/resolve_attack pre-generated one
            hook = fact_packet.get("narrative_hook") or ""

            if is_hit:
                _hit_lines: Dict[str, list] = {
                    "slashing":     [f"{attacker}'s blade finds the gap between {target}'s ribs — steel grinds bone.",
                                     f"The arc catches the torchlight, and then catches {target}."],
                    "piercing":     [f"{attacker}'s thrust is economical, merciless — through leather, into flesh.",
                                     f"{target} looks down at the point in their shoulder. {attacker} is already moving."],
                    "bludgeoning":  [f"The blow connects with a sound like wet timber. {target} folds under it.",
                                     f"{attacker} puts full weight behind the strike. Something inside {target} gives."],
                    "fire":         [f"The flame finds {target}'s cloak before it finds flesh. The scream comes a half-second late.",
                                     f"Heat. Light. Then the smell."],
                    "cold":         [f"Ice traces {target}'s veins from the point of impact. They move slower now.",
                                     f"The cold hits {target} like a wall — breath fogs, fingers go numb."],
                    "lightning":    [f"Blue-white light traces {target}'s veins for a half-second. Then they drop.",
                                     f"The thunderclap comes a beat after the bolt. {target} is already on one knee."],
                    "necrotic":     [f"Where the darkness touches {target}, flesh grays and crumbles like old parchment.",
                                     f"{target} screams — not from pain but from absence, as if something essential just left."],
                    "default":      [f"{attacker} finds the opening. {target} had no answer for it.",
                                     f"The attack lands. Something gives. {target} doesn't try to hide the cost."],
                }
                pool = _hit_lines.get(dtype, _hit_lines["default"])
                narrative = hook if hook else _random.choice(pool)
            else:
                _miss_lines = [
                    f"{attacker} commits — {target} isn't where {attacker} expected.",
                    f"Steel meets air. {target} exhales and closes the gap before {attacker} can reset.",
                    f"{attacker}'s blade passes close enough to stir {target}'s hair. Not close enough to count.",
                    f"{attacker} overextends. {target} reads it before it happens.",
                ]
                narrative = _random.choice(_miss_lines)

        elif action_type == "saving_throw":
            target  = fact_packet.get("target", "the victim")
            success = fact_packet.get("save_success", False)
            dtype   = fact_packet.get("damage_type", "magic")
            if success:
                narrative = (
                    f"{target} twists away from the worst of it — the {dtype} scorches the air where they stood."
                    if dtype in ("fire", "lightning") else
                    f"{target} grits their teeth and holds. The {dtype} wave breaks against them and recedes."
                )
            else:
                narrative = (
                    f"The {dtype} does not ask permission. {target} is simply inside it, and then not."
                    if dtype in ("necrotic", "psychic") else
                    f"{target} braces — but there is nothing to brace against. The {dtype} surge takes them off their feet."
                )

        elif action_type == "initiative":
            actor = fact_packet.get("actor", "The combatant")
            # Weave opening_image from EncounterContext if present
            if ec_image:
                narrative = f"{ec_image} {actor}'s hand moves to their weapon."
            else:
                narrative = f"{actor} reads the room in a heartbeat — weight shifts, steel loosens in its scabbard."

        elif action_type == "start_combat":
            actor = fact_packet.get("current_actor", "Unknown")
            if ec_mood:
                narrative = f"The air changes. Something in it carries {ec_mood.lower()}. {actor} — the first move is yours."
            else:
                narrative = f"The pretense ends. The air goes cold and still. {actor}, it begins."

        elif action_type == "next_turn":
            actor = fact_packet.get("current_actor", "Unknown")
            narrative = _random.choice([
                f"A breath. A blink. {actor}, the moment is yours.",
                f"The dust hasn't settled. {actor} steps forward.",
                f"Blood on the stones. {actor} — do not waste the opening.",
            ])

        else:
            narrative = f"The dark observes: {action_type} — {fact_packet.get('attacker', fact_packet.get('actor', 'Unknown'))}"

        # Simulate typing/streaming delay
        chunk_size = 5
        curr_narrative = str(narrative)
        for i in range(0, len(curr_narrative), chunk_size):
            # Building chunk manually to avoid slice indexing lint issues on some configurations
            chunk = ""
            end = i + chunk_size
            if end > len(curr_narrative):
                end = len(curr_narrative)
            
            for j in range(i, end):
                chunk += curr_narrative[j]
                
            yield chunk
            await asyncio.sleep(0.01)
