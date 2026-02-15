import pytest
import asyncio
import os
from src.engine.ai.visual_vault import VisualVaultClient

@pytest.mark.asyncio
async def test_visual_vault_mock_fallback():
    """Verify that Visual Vault falls back to mock if no API key is present."""
    # Temporarily remove API key if present
    old_key = os.environ.get("GEMINI_API_KEY")
    if old_key:
        os.environ.pop("GEMINI_API_KEY")
    
    try:
        client = VisualVaultClient(api_key=None)
        assert client.is_mock is True
        
        url = await client.get_asset_url("iron_sword", "a rusted gladius")
        assert "iron_sword" in url
        assert url.startswith("/assets/placeholder_")
    finally:
        # Restore key
        if old_key:
            os.environ["GEMINI_API_KEY"] = old_key

@pytest.mark.asyncio
async def test_visual_vault_real_api_if_configured():
    """Verify real asset description generation (prompt check)."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        pytest.skip("GEMINI_API_KEY not set, skipping real API test")
        
    client = VisualVaultClient(api_key=api_key)
    assert client.is_mock is False
    
    # Real API call for description logic
    desc = await client.generate_asset_description("staff_of_power", "a cracked obsidian staff")
    assert len(desc) > 0
    print(f"\n--- Real Visual Vault Description ---\n{desc}\n-----------------------------")
