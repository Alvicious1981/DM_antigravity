
import pytest
import asyncio
from engine.ai.chronos import ChronosClient

@pytest.mark.asyncio
async def test_chronos_mock_attack_hit():
    client = ChronosClient()
    fact_packet = {
        "action_type": "attack",
        "attacker": "Orc",
        "target": "Player",
        "hit": True,
        "damage_total": 10,
        "damage_type": "slashing"
    }
    
    narrative_chunks = []
    async for chunk in client.generate_narrative(fact_packet):
        narrative_chunks.append(chunk)
    
    full_narrative = "".join(narrative_chunks)
    assert "Orc" in full_narrative
    assert "Player" in full_narrative
    assert "10" in full_narrative
    assert "slashing" in full_narrative
    assert "hits" not in full_narrative.lower() # Based on my implementation: "striking"

@pytest.mark.asyncio
async def test_chronos_mock_attack_miss():
    client = ChronosClient()
    fact_packet = {
        "action_type": "attack",
        "attacker": "Orc",
        "target": "Player",
        "hit": False
    }
    
    narrative_chunks = []
    async for chunk in client.generate_narrative(fact_packet):
        narrative_chunks.append(chunk)
    
    full_narrative = "".join(narrative_chunks)
    assert "Orc" in full_narrative
    assert "Player" in full_narrative
    assert "parried" in full_narrative or "misses" in full_narrative or "harmlessly" in full_narrative

@pytest.mark.asyncio
async def test_chronos_streaming_chunks():
    client = ChronosClient()
    fact_packet = {
        "action_type": "initiative",
        "actor": "Fighter",
        "total": 15
    }
    
    chunks = []
    async for chunk in client.generate_narrative(fact_packet):
        chunks.append(chunk)
        # Check chunk size (mostly 5, but can be less for the last chunk)
        assert len(chunk) <= 5
        
    assert len(chunks) > 1
    assert "Fighter" in "".join(chunks)
    assert "15" in "".join(chunks)

@pytest.mark.asyncio
async def test_chronos_unknown_action():
    client = ChronosClient()
    fact_packet = {
        "action_type": "unknown_move",
        "attacker": "Shadow"
    }
    
    narrative_chunks = []
    async for chunk in client.generate_narrative(fact_packet):
        narrative_chunks.append(chunk)
    
    full_narrative = "".join(narrative_chunks)
    assert "Shadow" in full_narrative
    assert "unknown_move" in full_narrative
