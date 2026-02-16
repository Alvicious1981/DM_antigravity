"""
Dungeon Cortex — Visibility & Fog of War (§3.2)
Logic for alpha-masking maps to represent explored vs unexplored areas.
"""

from PIL import Image, ImageDraw
from pathlib import Path
from typing import List, Tuple

class VisibilityManager:
    def __init__(self, width: int = 1280, height: int = 720):
        self.width = width
        self.height = height
        # Mask: L mode (8-bit pixels, black and white)
        # 0 = Unexplored (Transparent/Dark), 255 = Explored (Visible)
        self.mask = Image.new("L", (width, height), 0)
        self.draw = ImageDraw.Draw(self.mask)

    def reveal_area(self, x_percent: float, y_percent: float, radius_percent: float = 15):
        """
        Reveal a circular area of the mask.
        Coordinates are expected in percentage (0.0 to 100.0).
        """
        x = (x_percent / 100.0) * self.width
        y = (y_percent / 100.0) * self.height
        r = (radius_percent / 100.0) * self.width
        
        self.draw.ellipse([x - r, y - r, x + r, y + r], fill=255)

    def apply_mask(self, image_path: Path, output_path: Path):
        """
        Apply the current mask to an image.
        Unexplored areas will be masked with a parchment-like color.
        """
        if not image_path.exists():
            return
            
        with Image.open(image_path).convert("RGBA") as img:
            # Scale mask to match image if necessary
            if img.size != (self.width, self.height):
                current_mask = self.mask.resize(img.size, Image.LANCZOS)
            else:
                current_mask = self.mask
            
            # Create a "parchment" version for unexplored areas
            # Using the color #f4e4bc from the design system
            parchment_color = (244, 228, 188, 255)
            parchment = Image.new("RGBA", img.size, parchment_color)
            
            # Optional: Add subtle noise to parchment
            import random
            draw = ImageDraw.Draw(parchment)
            for _ in range(int(img.size[0] * img.size[1] * 0.01)): # 1% noise
                rx = random.randint(0, img.size[0] - 1)
                ry = random.randint(0, img.size[1] - 1)
                noise_alpha = random.randint(0, 10)
                draw.point((rx, ry), fill=(0, 0, 0, noise_alpha))

            # Create the final composite
            # Note: Composite uses the mask to blend between the two images.
            # 255 (white) in mask -> uses 'img'
            # 0 (black) in mask -> uses 'parchment'
            out = Image.composite(img, parchment, current_mask)
            out.save(output_path, "PNG")

    def save_mask(self, path: Path):
        self.mask.save(path)

    def load_mask(self, path: Path):
        if path.exists():
            self.mask = Image.open(path).convert("L")
            self.draw = ImageDraw.Draw(self.mask)
