import os
import asyncio
import textwrap
from typing import Optional, Dict, Any
from google import genai
from .tokenomics import reporter as tokenomics_reporter

class VisualVaultClient:
    """
    The Visual Agent (Visual Vault).
    Responsibility: Generate consistent dark fantasy assets (icons, tokens).
    Adheres to the 'Diegetic UI' principle: Assets must feel like part of the world.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.is_mock = not self.api_key
        
        if not self.is_mock:
            self.client = genai.Client(api_key=self.api_key)

        self.style_prompt = textwrap.dedent("""
            V6 VISUALS: Visceral, gritty dark fantasy. 
            PALETTE: #1a1a1d, #c5a059, oxblood, iron, bone.
            KEYWORDS: Rusted steel, shadows, grit, high fidelity.
            FORMAT: Isometric icon/token, no text, alpha.
        """)

    async def generate_asset_description(self, item_name: str, context: str) -> str:
        """
        Generates a detailed prompt for image generation based on the item and context.
        """
        if self.is_mock:
            return f"Isometric icon of a {item_name} in a {context}, dark fantasy style."
            
        prompt = f"Create a detailed image generation prompt for: {item_name}\nContext: {context}\n{self.style_prompt}"
        
        # New google-genai logic
        response = await asyncio.to_thread(
            self.client.models.generate_content,
            model='gemini-1.5-flash',
            contents=prompt
        )
        # Tokenomics Tracking
        if hasattr(response, 'usage_metadata'):
            usage = response.usage_metadata
            tokenomics_reporter.report_usage(
                agent_id="VisualVault",
                prompt_tokens=usage.prompt_token_count,
                completion_tokens=usage.candidates_token_count,
                model="gemini-1.5-flash"
            )
            
        return response.text

    async def get_asset_url(self, item_name: str, context: str) -> str:
        """
        Retrieves or generates an asset URL for the given item using Imagen 3.
        """
        # If mock mode, return placeholder
        if self.is_mock:
            return f"/assets/placeholder_{item_name.lower().replace(' ', '_')}.png"

        try:
            # 1. Generate Prompt
            visual_prompt = await self.generate_asset_description(item_name, context)
            print(f"🎨 Visual Vault Prompt: {visual_prompt}")

            # 2. Call Imagen 3
            # We use asyncio.to_thread because the SDK might be synchronous or we want to offload
            from google.genai import types
            
            response = await asyncio.to_thread(
                self.client.models.generate_images,
                model='imagen-3.0-generate-001',
                prompt=visual_prompt,
                config=types.GenerateImagesConfig(
                    number_of_images=1,
                    aspect_ratio="1:1"
                )
            )

            # 3. Process Response
            if response.generated_images:
                image_bytes = response.generated_images[0].image.image_bytes
                
                # Ensure directory exists (redundant check but safe)
                output_dir = os.path.join("d:\\DM_antigravity", "apps", "web-client", "public", "assets", "generated")
                os.makedirs(output_dir, exist_ok=True)
                
                # Sanitize filename
                filename = f"{item_name.lower().replace(' ', '_')}_{hash(context)}.png"
                filepath = os.path.join(output_dir, filename)
                
                with open(filepath, "wb") as f:
                    f.write(image_bytes)
                
                print(f"🎨 Asset Saved: {filepath}")
                
                # Tokenomics (Placeholder for Image Cost)
                tokenomics_reporter.report_usage(
                    agent_id="VisualVault",
                    prompt_tokens=0, # Image models cost differently
                    completion_tokens=0,
                    model="imagen-3.0-generate-001"
                )

                return f"/assets/generated/{filename}"
            
            else:
                print("🎨 Visual Vault Warning: No image returned.")
                return "/assets/placeholder.png"

        except Exception as e:
            print(f"🎨 Visual Vault Error: {e}")
            import traceback
            traceback.print_exc()
            return "/assets/placeholder.png"
