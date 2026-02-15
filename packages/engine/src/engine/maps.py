
from typing import List, Dict, Optional
from pydantic import BaseModel

class MapNode(BaseModel):
    id: str
    name: str
    type: str  # "city", "dungeon", "wilderness", "landmark"
    coordinates: Dict[str, float]  # {"x": 50.0, "y": 50.0} (percentage)
    description: str
    connections: List[str]  # IDs of connected nodes
    risk_level: int = 1  # 1-10, influences encounter rate/difficulty

# Static World Graph (The "Known World")
WORLD_GRAPH = {
    "start_town": MapNode(
        id="start_town",
        name="Oakhaven",
        type="city",
        coordinates={"x": 50.0, "y": 50.0},
        description="A peaceful trading town on the edge of the wilderness.",
        connections=["dreadlands_entrance", "jagged_peaks_base"]
    ),
    "dreadlands_entrance": MapNode(
        id="dreadlands_entrance",
        name="Dreadlands Gate",
        type="wilderness",
        coordinates={"x": 45.0, "y": 40.0},
        description="The ominous entrance to the corrupted lands.",
        connections=["start_town", "sanguine_spire", "fort_hollow"]
    ),
    "jagged_peaks_base": MapNode(
        id="jagged_peaks_base",
        name="Jagged Peaks Base",
        type="wilderness",
        coordinates={"x": 60.0, "y": 60.0},
        description="The foothills of the treacherous mountain range.",
        connections=["start_town", "jagged_peaks_summit"]
    ),
    "sanguine_spire": MapNode(
        id="sanguine_spire",
        name="Sanguine Spire",
        type="dungeon",
        coordinates={"x": 35.0, "y": 30.0},
        description="A twisted tower of red stone, pulsing with dark magic.",
        connections=["dreadlands_entrance"],
        risk_level=5
    ),
    "fort_hollow": MapNode(
        id="fort_hollow",
        name="Fort Hollow",
        type="dungeon",
        coordinates={"x": 55.0, "y": 35.0},
        description="An abandoned fortress overrun by undead.",
        connections=["dreadlands_entrance"],
        risk_level=3
    ),
    "jagged_peaks_summit": MapNode(
        id="jagged_peaks_summit",
        name="Jagged Peaks Summit",
        type="landmark",
        coordinates={"x": 70.0, "y": 70.0},
        description="The frozen peak where an ancient dragon sleeps.",
        connections=["jagged_peaks_base"],
        risk_level=8
    )
}

def get_node(node_id: str) -> Optional[MapNode]:
    return WORLD_GRAPH.get(node_id)

def get_all_nodes() -> List[MapNode]:
    return list(WORLD_GRAPH.values())

def calculate_h_cost(start_id: str, end_id: str) -> float:
    """Heuristic for pathfinding (Manhattan distance on abstract grid)."""
    # Placeholder: In a real graph, we'd use Dijkstra or A*
    # For now, just return 1 if connected, infinite if not
    start = WORLD_GRAPH.get(start_id)
    end = WORLD_GRAPH.get(end_id)
    if not start or not end:
        return float('inf')
    
    # Calculate Euclidean distance based on coordinates
    dx = start.coordinates["x"] - end.coordinates["x"]
    dy = start.coordinates["y"] - end.coordinates["y"]
    return (dx**2 + dy**2)**0.5
