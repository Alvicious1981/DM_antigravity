import os
import subprocess
from typing import List, Dict, Optional
from pydantic import BaseModel
import logging
from pathlib import Path
from .visibility import VisibilityManager

logger = logging.getLogger(__name__)

class MapNode(BaseModel):
    id: str
    name: str
    type: str  # "city", "dungeon", "wilderness", "landmark"
    coordinates: Dict[str, float]  # {"x": 50.0, "y": 50.0} (percentage)
    description: str
    connections: List[str]  # IDs of connected nodes
    risk_level: int = 1  # 1-10, influences encounter rate/difficulty
    azgaar_cell_id: Optional[int] = None # Mapping to Azgaar cell

# Static World Graph (The "Known World")
WORLD_GRAPH = {
    "start_town": MapNode(
        id="start_town",
        name="Oakhaven",
        type="city",
        coordinates={"x": 50.0, "y": 50.0},
        description="A peaceful trading town on the edge of the wilderness.",
        connections=["dreadlands_entrance", "jagged_peaks_base"],
        azgaar_cell_id=5432 # Example mapping
    ),
    "dreadlands_entrance": MapNode(
        id="dreadlands_entrance",
        name="Dreadlands Gate",
        type="wilderness",
        coordinates={"x": 45.0, "y": 40.0},
        description="The ominous entrance to the corrupted lands.",
        connections=["start_town", "sanguine_spire", "fort_hollow"],
        azgaar_cell_id=5678
    ),
    "jagged_peaks_base": MapNode(
        id="jagged_peaks_base",
        name="Jagged Peaks Base",
        type="wilderness",
        coordinates={"x": 60.0, "y": 60.0},
        description="The foothills of the treacherous mountain range.",
        connections=["start_town", "jagged_peaks_summit"],
        azgaar_cell_id=6789
    ),
    "sanguine_spire": MapNode(
        id="sanguine_spire",
        name="Sanguine Spire",
        type="dungeon",
        coordinates={"x": 35.0, "y": 30.0},
        description="A twisted tower of red stone, pulsing with dark magic.",
        connections=["dreadlands_entrance"],
        risk_level=5,
        azgaar_cell_id=3456
    ),
    "fort_hollow": MapNode(
        id="fort_hollow",
        name="Fort Hollow",
        type="dungeon",
        coordinates={"x": 55.0, "y": 35.0},
        description="An abandoned fortress overrun by undead.",
        connections=["dreadlands_entrance"],
        risk_level=3,
        azgaar_cell_id=7890
    ),
    "jagged_peaks_summit": MapNode(
        id="jagged_peaks_summit",
        name="Jagged Peaks Summit",
        type="landmark",
        coordinates={"x": 70.0, "y": 70.0},
        description="The frozen peak where an ancient dragon sleeps.",
        connections=["jagged_peaks_base"],
        risk_level=8,
        azgaar_cell_id=1234
    )
}

class MapManager:
    def __init__(self, external_sources_path: str):
        self.fmg_path = os.path.join(external_sources_path, "fantasy-map-generator")
        self.output_base_path = os.path.join(os.getcwd(), "apps", "web-client", "public", "generated")
        os.makedirs(self.output_base_path, exist_ok=True)
        
        # Initialize Visibility Manager
        self.mask_path = os.path.join(self.output_base_path, "world_mask.png")
        self.visibility = VisibilityManager()
        if os.path.exists(self.mask_path):
            self.visibility.load_mask(Path(self.mask_path))
        else:
            # Initial reveal: start_town
            from .maps import WORLD_GRAPH # Local import to avoid circular dependency if needed
            start_node = WORLD_GRAPH.get("start_town")
            if start_node:
                self.visibility.reveal_area(start_node.coordinates["x"], start_node.coordinates["y"])
            self.visibility.save_mask(Path(self.mask_path))

    def capture_node(self, node_id: str, seed: str = "antigravity_v1") -> Optional[str]:
        node = WORLD_GRAPH.get(node_id)
        if not node or node.azgaar_cell_id is None:
            logger.error(f"Node {node_id} has no Azgaar mapping.")
            return None

        # Ensure the current node is revealed
        self.visibility.reveal_area(node.coordinates["x"], node.coordinates["y"])
        self.visibility.save_mask(Path(self.mask_path))

        raw_filename = f"raw_{node_id}.png"
        masked_filename = f"map_{node_id}.png"
        raw_path = os.path.join(self.output_base_path, raw_filename)
        masked_path = os.path.join(self.output_base_path, masked_filename)
        
        # Prepare environment for Playwright
        env = os.environ.copy()
        env["CELL_ID"] = str(node.azgaar_cell_id)
        env["MAP_SEED"] = seed
        env["OUTPUT_PATH"] = raw_path

        logger.info(f"Triggering map capture for {node_id} (Cell: {node.azgaar_cell_id})")
        
        try:
            # Run the playwright test to get raw capture
            subprocess.run(
                ["npx", "playwright", "test", "tests/e2e/capture.spec.ts"],
                cwd=self.fmg_path,
                env=env,
                capture_output=True,
                text=True,
                check=True
            )
            
            # Apply Fog of War mask
            self.visibility.apply_mask(Path(raw_path), Path(masked_path))
            
            logger.info("Map capture and masking successful.")
            return f"/generated/{masked_filename}"
        except subprocess.CalledProcessError as e:
            logger.error(f"Map capture failed: {e.stderr}")
            return None

def get_node(node_id: str) -> Optional[MapNode]:
    return WORLD_GRAPH.get(node_id)

def get_all_nodes() -> List[MapNode]:
    return list(WORLD_GRAPH.values())

def calculate_h_cost(start_id: str, end_id: str) -> float:
    """Heuristic for pathfinding (Euclidean distance)."""
    start = WORLD_GRAPH.get(start_id)
    end = WORLD_GRAPH.get(end_id)
    if not start or not end:
        return float('inf')
    
    dx = start.coordinates["x"] - end.coordinates["x"]
    dy = start.coordinates["y"] - end.coordinates["y"]
    return (dx**2 + dy**2)**0.5
