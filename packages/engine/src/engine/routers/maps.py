from fastapi import APIRouter, HTTPException, Query
from typing import List
from ..maps import MapNode, get_all_nodes, get_node, MapManager
import os

router = APIRouter(prefix="/api/world/map", tags=["map"])

# Initialize MapManager with the root external-sources path
EXTERNAL_SOURCES_PATH = os.path.abspath(os.path.join(os.getcwd(), "external-sources"))
map_manager = MapManager(EXTERNAL_SOURCES_PATH)

@router.get("/nodes", response_model=List[MapNode])
async def list_nodes():
    """List all available world map nodes."""
    return get_all_nodes()

@router.get("/nodes/{node_id}", response_model=MapNode)
async def get_node_details(node_id: str):
    """Get details for a specific map node."""
    node = get_node(node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    return node

@router.post("/capture/{node_id}")
async def capture_node_map(node_id: str, seed: str = Query("antigravity_v1")):
    """
    Trigger a map capture for a specific node in Azgaar's FMG.
    Returns the relative URL to the generated image.
    """
    node = get_node(node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    
    image_url = map_manager.capture_node(node_id, seed=seed)
    if not image_url:
        raise HTTPException(status_code=500, detail="Map capture failed")
    
@router.get("/nodes/{node_id}/actors")
async def get_node_actors(node_id: str):
    """Fetch all actors currently located at this node."""
    from ..actors import ActorGenerator
    return ActorGenerator.get_actors_at_node(node_id)

@router.post("/nodes/{node_id}/spawn-npc")
async def spawn_npc(node_id: str, cr: float = 0.25):
    """Spawn a new procedural NPC at this node."""
    from ..actors import ActorGenerator
    node = get_node(node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    
    actor = ActorGenerator.generate_npc(node_id, cr=cr)
    ActorGenerator.save_actor(actor)
    return actor
