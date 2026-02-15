import pytest
import asyncio
import os
from src.engine.ai.chronos import ChronosClient

@pytest.mark.asyncio
async def test_chronos_mock_fallback():
    """Verify that Chronos falls back to mock if no API key is present."""
    # Temporarily remove API key if present
    old_key = os.environ.get("GEMINI_API_KEY")
    if old_key:
        del os.environ["GEMINI_API_KEY"]
    
    client = ChronosClient(api_key=None)
    assert client.is_mock is True
    
    fact_packet = {"action_type": "attack", "hit": True, "damage": 10, "target": "Goblin"}
    narrative = ""
    async for chunk in client.generate_narrative(fact_packet):
        narrative += chunk
    
    assert "Goblin" in narrative
    assert len(narrative) > 0
    
    # Restore key
    if old_key:
        os.environ["GEMINI_API_KEY"] = old_key

@pytest.mark.asyncio
async def test_chronos_real_api_if_configured():
    """Verify real API call if GEMINI_API_KEY is present."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        pytest.skip("GEMINI_API_KEY not set, skipping real API test")
        
    client = ChronosClient(api_key=api_key)
    assert client.is_mock is False
    
    fact_packet = {
        "action_type": "attack",
        "hit": True,
        "damage": 15,
        "target": "Orc",
        "attacker_name": "Valerius",
        "weapon_name": "Sunblade",
        "damage_type": "radiant"
    }
    
    narrative = ""
    async for chunk in client.generate_narrative(fact_packet):
        narrative += chunk
    
    print(f"\n--- Real Chronos Narrative ---\n{narrative}\n-----------------------------")
    assert len(narrative) > 0
    # The visceral prompt should ideally mention radiant or the Orc
    assert any(x in narrative.lower() for x in ["radiant", "orc", "valerius", "sunblade"])
