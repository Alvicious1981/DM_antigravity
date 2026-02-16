from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import random
import uuid
from .db import get_db

class NPCProfile(BaseModel):
    core_trait: str
    motivation: str
    visual_features: List[str]
    background: str

class ActorModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: str = "npc" # "pc", "npc", "monster"
    template_id: Optional[str] = None
    location_node_id: str
    hp_max: int
    hp_current: int
    ac: int
    cr: float = 0.0
    profile: Optional[NPCProfile] = None
    inventory_items: List[str] = [] # list of item instance IDs
    data_json: Dict[str, Any] = {}

class ActorGenerator:
    TRAITS = ["Greedy", "Merciful", "Paranoid", "Vengeful", "Cowardly", "Ambitious", "Stoic"]
    MOTIVATIONS = ["Seeking a lost heirloom", "Hiding from a debt", "Spreading a dark faith", "Protecting their family", "Seeking glory in battle"]
    VISUALS = ["Scarred face", "Emerald eyes", "Tattered gray cloak", "Missing finger", "Golden signet ring", "Vibrant tattoos"]
    
    NAMES = ["Aethelgard", "Brynolas", "Cadrick", "Doran", "Elowen", "Faelan", "Gunther", "Hilda"]

    @staticmethod
    def generate_npc(node_id: str, cr: float = 0.25) -> ActorModel:
        name = f"{random.choice(ActorGenerator.NAMES)}"
        profile = NPCProfile(
            core_trait=random.choice(ActorGenerator.TRAITS),
            motivation=random.choice(ActorGenerator.MOTIVATIONS),
            visual_features=random.sample(ActorGenerator.VISUALS, 2),
            background="Local inhabitant"
        )
        
        # Simple stats for now, later we pull from SRD
        hp = 10 + int(cr * 20)
        ac = 10 + int(cr * 4)
        
        actor = ActorModel(
            name=name,
            location_node_id=node_id,
            hp_max=hp,
            hp_current=hp,
            ac=ac,
            cr=cr,
            profile=profile
        )
        return actor

    @staticmethod
    def save_actor(actor: ActorModel):
        db = get_db()
        import json
        
        # Convert Pydantic model to dict for data_json
        actor_data = actor.model_dump()
        actor_id = actor_data.pop("id")
        
        db.execute(
            "INSERT OR REPLACE INTO actors (id, name, type, location_node_id, data_json) VALUES (?, ?, ?, ?, ?)",
            (actor_id, actor.name, actor.type, actor.location_node_id, json.dumps(actor_data))
        )
        db.commit()

    @staticmethod
    def get_actors_at_node(node_id: str) -> List[ActorModel]:
        db = get_db()
        rows = db.execute("SELECT id, location_node_id, data_json FROM actors WHERE location_node_id = ?", (node_id,)).fetchall()
        
        actors = []
        import json
        for row in rows:
            data = json.loads(row["data_json"])
            data["id"] = row["id"]
            data["location_node_id"] = row["location_node_id"]
            actors.append(ActorModel(**data))
        return actors
