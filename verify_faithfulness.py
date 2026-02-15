import asyncio
import json
from packages.engine.src.engine.ai.chronos import ChronosClient

async def test_faithfulness():
    import os
    api_key = os.getenv("GEMINI_API_KEY")
    chronos = ChronosClient(api_key=api_key)
    
    if chronos.is_mock:
        print("❌ ERROR: Chronos is in MOCK mode. Set GEMINI_API_KEY to test FaithfulnessGuard.")
        return

    # Scenario 1: Perfectly Aligned
    fact_packet_1 = {"action_type": "attack", "hit": True, "damage_total": 12}
    narrative_1 = "The blade bites deep into the foe's shoulder, spraying oxblood across the cobblestones as they scream in agony."
    print("\n--- Testing Aligned Narrative ---")
    await chronos._verify_faithfulness(fact_packet_1, narrative_1)

    # Scenario 2: Contradiction (Packet says HIT, narrative says MISS)
    fact_packet_2 = {"action_type": "attack", "hit": True, "damage_total": 12}
    narrative_2 = "The sword whistles through empty air, clashing against the stone wall as the enemy dances away unharmed."
    print("\n--- Testing Contradicting Narrative (Hit vs Miss) ---")
    await chronos._verify_faithfulness(fact_packet_2, narrative_2)

    # Scenario 3: Contradiction (Packet says 12 dmg, narrative says scratch/1 dmg)
    fact_packet_3 = {"action_type": "attack", "hit": True, "damage_total": 45}
    narrative_3 = "The blow is a mere glancing scratch, barely drawing a bead of blood."
    print("\n--- Testing Contradicting Narrative (High dmg vs Scratch) ---")
    await chronos._verify_faithfulness(fact_packet_3, narrative_3)

if __name__ == "__main__":
    asyncio.run(test_faithfulness())
