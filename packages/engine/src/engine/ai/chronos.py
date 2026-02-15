
import os
import asyncio
import textwrap
import json
from typing import AsyncGenerator, Dict, Any, Optional
from google import genai
from .tokenomics import reporter as tokenomics_reporter
from .memory import MemoryService

class ChronosClient:
    """
    The Narrative Agent (Chronos).
    Responsibility: Translate strict JSON 'Fact Packets' into visceral, diegetic prose.
    Adheres to the 'Code is Law' principle: The narrative cannot contradict the JSON.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.is_mock = not self.api_key
        
        if not self.is_mock:
            self.client = genai.Client(api_key=self.api_key)
            self.memory_service = MemoryService(api_key=self.api_key)
            
        self.system_prompt = textwrap.dedent("""
            ID: CHRONOS. ROLE: DM ENGINE.
            LAWS:
            1. CODE IS LAW: Follow JSON Pact (h:hit, d:dmg, t:type). No contradictions.
            2. V6 AESTHETIC: Visceral Dark Fantasy. Tone: Gritty, oppressive. Focus: Senses, meat, bone, shadow, rust, decay.
            3. NO GAMEY LANG: No numbers, HP, rounds, "critical hit". Use diegetic descriptions ("a killing blow", "barely scratches").
            4. DENSE: 1-2 sentences max. Pure, evocative prose.
            5. CONTEXT: Respect the retrieved MEMORIES if provided.
            6. FORMAT: Do not prefix with labels like "Narrative:". Just the raw text.
        """)

    async def generate_narrative(self, fact_packet: Dict[str, Any]) -> AsyncGenerator[str, None]:
        """
        Stream narrative text based on the fact packet.
        """
        if self.is_mock:
            async for chunk in self._generate_mock_narrative(fact_packet):
                yield chunk
        else:
            try:
                accumulated_text = ""
                async for chunk in self._generate_real_narrative(fact_packet):
                    accumulated_text += chunk
                    yield chunk
                
                # RUNTIME FAITHFULNESS CHECK (Phase 2)
                asyncio.create_task(self._verify_faithfulness(fact_packet, accumulated_text))
            except Exception as e:
                print(f"Chronos API Error: {e}. Falling back to mock.")
                async for chunk in self._generate_mock_narrative(fact_packet):
                    yield chunk

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
        pact = self._compress_pact(fact_packet)
        
        # Semantic Retrieval
        context_memories = ""
        if not self.is_mock and self.memory_service:
            search_query = f"{fact_packet.get('attacker', '')} {fact_packet.get('action_type', '')} {fact_packet.get('target', '')}"
            memories = self.memory_service.retrieve_similar_memories(search_query, limit=2)
            if memories:
                context_memories = "\nMEMORIES:\n" + "\n".join([f"- {m['content']}" for m in memories])

        prompt = f"Pact: {pact}{context_memories}\nNarrate:"
        
        # New google-genai streaming logic
        response = await asyncio.to_thread(
            self.client.models.generate_content,
            model='gemini-1.5-flash',
            contents=f"{self.system_prompt}\n\n{prompt}",
            config={'stream': True}
        )
        
        for chunk in response:
            if chunk.text:
                yield chunk.text
        
        if hasattr(response, 'usage_metadata'):
            usage = response.usage_metadata
            tokenomics_reporter.report_usage(
                agent_id="Chronos",
                prompt_tokens=usage.prompt_token_count,
                completion_tokens=usage.candidates_token_count,
                model="gemini-1.5-flash"
            )

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
        """
        # Align with AttackResult.to_fact_packet keys
        action_type = fact_packet.get("action_type", "unknown")
        
        narrative: str = ""
        
        if action_type == "attack" or action_type == "spell_attack":
            attacker = fact_packet.get("attacker", "The combatant")
            target = fact_packet.get("target", "the foe")
            is_hit = fact_packet.get("hit", False)
            damage = fact_packet.get("damage_total", 0)
            dtype = fact_packet.get("damage_type", "physical")
            
            if is_hit:
                narrative = f"The {attacker} lunges, striking {target} with brutal force! The {dtype} attack tears through, dealing {damage} visceral damage."
            else:
                narrative = f"The {attacker} strikes at {target}, but the blow is parried. Steel clashes harmlessly."
                
        elif action_type == "saving_throw":
            target = fact_packet.get("target", "the victim")
            success = fact_packet.get("save_success", False)
            damage = fact_packet.get("damage_total", 0)
            dtype = fact_packet.get("damage_type", "magic")
            
            if success:
                narrative = f"{target} resists the {dtype} energy, taking only minor trauma ({damage} damage)."
            else:
                narrative = f"{target} fails to resist the power! The {dtype} surge overwhelms them for {damage} damage."
        
        elif action_type == "initiative":
            actor = fact_packet.get("actor", "The combatant")
            total = fact_packet.get("total", 0)
            narrative = f"{actor} prepares for blood, steel rasping against scabbard. Initiative: {total}."

        elif action_type == "start_combat":
            actor = fact_packet.get("current_actor", "Unknown")
            narrative = f"The air grows heavy with the scent of death. Combat begins! {actor}, the first move is yours."

        elif action_type == "next_turn":
            actor = fact_packet.get("current_actor", "Unknown")
            narrative = f"A heartbeat of silence passes. {actor}, your destiny awaits."

        else:
            narrative = f"Chronos observes {action_type}: {fact_packet.get('attacker', fact_packet.get('actor', 'Unknown'))}"

        # Simulate typing/streaming delay
        chunk_size = 5
        # Refactored to avoid slice-index lint issue in some environments
        for i in range(0, len(narrative), chunk_size):
            chunk = narrative[i : i + chunk_size]
            yield chunk
            await asyncio.sleep(0.01)
