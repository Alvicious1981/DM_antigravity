import asyncio
import os
from packages.engine.src.engine.ai.visual_vault import VisualVaultClient

async def test_visual_vault():
    print("\n--- Testing Visual Vault ---")
    
    # Force mock if no key, but try to use key if present
    api_key = os.getenv("GEMINI_API_KEY")
    client = VisualVaultClient(api_key=api_key)
    
    if client.is_mock:
        print("ℹ️ Running in MOCK mode (no API key found)")
    else:
        print("ℹ️ Running in REAL mode (API key found)")

    # Test Item Generation
    item_name = "Rusty Dagger"
    context = "Found in a goblin's boot"
    
    print(f"Generating asset for: {item_name}")
    url = await client.get_asset_url(item_name, context)
    
    print(f"✅ Asset URL: {url}")
    
    # Verify file existence if real (or even mock if it saves something?)
    # Mock currently returns a placeholder path, real saves to disk.
    if not client.is_mock:
        # url is like /assets/generated/filename.png
        # We need to map it back to local path to verify
        # client saves to: d:\DM_antigravity\apps\web-client\public\assets\generated
        filename = os.path.basename(url)
        filepath = os.path.join("d:\\DM_antigravity", "apps", "web-client", "public", "assets", "generated", filename)
        
        if os.path.exists(filepath):
            print(f"✅ File exists at: {filepath}")
            print(f"   Size: {os.path.getsize(filepath)} bytes")
        else:
            print(f"❌ File NOT found at: {filepath}")

if __name__ == "__main__":
    asyncio.run(test_visual_vault())
