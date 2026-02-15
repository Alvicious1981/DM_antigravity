"""
Integration Tests — Chronos Handshake (chronos.py)
Verifying that the Narrative Agent correctly consumes Fact Packets.
"""

import pytest
import asyncio
import json
from engine.ai.chronos import ChronosClient
from engine.combat import AttackResult

@pytest.mark.asyncio
async def test_chronos_consumes_attack_fact_packet():
    """Verify that Chronos produces narrative from an AttackResult packet."""
    client = ChronosClient(api_key=None) # Use mock mode
    
    fact_packet = AttackResult(
        attacker_id="Gimli",
        target_id="Orc",
        hit=True,
        damage_total=8,
        damage_type="slashing"
    ).to_fact_packet()
    
    narrative = ""
    async for chunk in client.generate_narrative(fact_packet):
        narrative += chunk
        
    assert "Gimli" in narrative
    assert "Orc" in narrative
    assert "damage" in narrative
    assert "visceral" in narrative # Mock string characteristic

@pytest.mark.asyncio
async def test_chronos_consumes_save_fact_packet():
    """Verify that Chronos produces narrative from a Saving Throw packet."""
    client = ChronosClient(api_key=None)
    
    fact_packet = {
        "action_type": "saving_throw",
        "target": "Legolas",
        "save_success": True,
        "damage_total": 4,
        "damage_type": "fire"
    }
    
    narrative = ""
    async for chunk in client.generate_narrative(fact_packet):
        narrative += chunk
        
    assert "Legolas" in narrative
    assert "resists" in narrative
    assert "4" in narrative

@pytest.mark.asyncio
async def test_chronos_fallback_on_error():
    """Verify that Chronos falls back to mock if API fails."""
    # We force an error by mocking _generate_real_narrative to raise
    from unittest.mock import patch
    
    client = ChronosClient(api_key="fake_key")
    
    async def mock_fail(fact):
        raise Exception("API Down")
        yield "" # Necessary for async generator signature

    with patch.object(ChronosClient, '_generate_real_narrative', side_effect=mock_fail):
        narrative = ""
        async for chunk in client.generate_narrative({"action_type": "attack"}):
            narrative += chunk
        
        # Should still get narrative from mock
        assert len(narrative) > 0
        assert "attack" in narrative or "strikes" in narrative
