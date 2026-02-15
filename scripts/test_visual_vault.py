import asyncio
import os
import sys

# Add src to path
sys.path.append(os.path.join(os.getcwd(), "packages", "engine", "src"))

from engine.ai.visual_vault import VisualVaultClient

async def main():
    print("Testing Visual Vault Integration...")
    
    # Initialize client (uses GEMINI_API_KEY env var)
    client = VisualVaultClient()
    
    if client.is_mock:
        print("Warning: GEMINI_API_KEY not found. Running in MOCK mode.")
    else:
        print("Running in LIVE mode with Google Gen AI.")

    item_name = "Vorpal Sword"
    context = "A legendary sword that glows with a faint purple light, found in a dragon's hoard."
    
    print(f"\nGeneratin asset for: {item_name}")
    print(f"Context: {context}")
    
    # 1. Generate Asset URL
    try:
        url = await client.get_asset_url(item_name, context)
        print(f"\nAsset URL Generated: {url}")
        
        # 2. Verify File Existence (if not placeholder)
        if "placeholder" not in url:
            # Construct local path from URL
            # URL: /assets/generated/filename.png
            # Path: apps/web-client/public/assets/generated/filename.png
            
            relative_path = url.lstrip("/")
            local_path = os.path.join(os.getcwd(), "apps", "web-client", "public",  *relative_path.split("/"))
            
            if os.path.exists(local_path):
                print(f"File verified on disk: {local_path}")
                print(f"Size: {os.path.getsize(local_path)} bytes")
            else:
                print(f"File NOT found at: {local_path}")
        else:
            print("returned placeholder (expected if mock mode)")
            
    except Exception as e:
        print(f"Error during generation: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
