import asyncio
import json
import time
import os
import sys
import traceback
from typing import Dict, Any, List, Optional
from fastapi.testclient import TestClient

# Ensure engine is in path
sys.path.append(os.path.join(os.getcwd(), "packages", "engine", "src"))
from engine.server import app

client = TestClient(app)

def log_step(step_name, message):
    print(f"\n[STEP: {step_name}] {message}")

class SimulationClient:
    def __init__(self, websocket):
        self.ws = websocket
        self.event_queue = []

    def send(self, action: Dict[str, Any]):
        print(f"DEBUG: Sending action: {action}")
        time.sleep(0.5) # Mandatory rate limit delay
        self.ws.send_json(action)

    def receive(self, timeout: float = 5.0) -> Dict[str, Any]:
        data = self.ws.receive_json()
        print(f"DEBUG: Received event: {data.get('type') or data.get('action')}")
        return data

    def wait_for_event(self, event_type: str, timeout: float = 10.0) -> Dict[str, Any]:
        """Wait for a specific event type, discarding or queueing others."""
        start_time = time.time()
        while time.time() - start_time < timeout:
            data = self.receive()
            if data.get("type") == event_type:
                return data
            # Handle standard error ACKs
            if data.get("type") == "ACK" and data.get("status") == "error":
                print(f"⚠️ Received Error ACK: {data.get('message')}")
        raise TimeoutError(f"Timed out waiting for event {event_type}")

def sim_run():
    log_step("0. INITIALIZATION", "Starting 'The Descent into the Hollow' Simulation...")
    
    with client.websocket_connect("/ws/game/sim_descent_session?role=dm&dm_token=AG-DM-2026") as ws:
        sim = SimulationClient(ws)
        
        # 1. Connection
        data = sim.receive()
        assert data["type"] == "CONNECTION_ESTABLISHED"
        log_step("1. CONNECTION", "Connected to Engine as DM.")

        # --- STAGE 1: CHARACTER CREATION ---
        log_step("1. STAGE 1", "Creating Hero and initializing state.")
        sim.send({
            "action": "add_combatant",
            "instance_id": "Hero",
            "name": "Kaelen the Bold",
            "is_player": True,
            "hp_max": 30,
            "ac": 16,
            "dex": 14,
            "str": 16,
            "int": 10,
            "wis": 12,
            "cha": 14
        })
        sim.wait_for_event("INITIATIVE_UPDATE")
        
        # Equip starting gear
        sim.send({
            "action": "distribute_loot",
            "target_character_id": "Hero",
            "item_ids": ["equipment_longsword", "equipment_leather-armor"]
        })
        sim.wait_for_event("INVENTORY_UPDATE")
        sim.wait_for_event("LOOT_DISTRIBUTED")
        
        log_step("1. STAGE 1", "Hero created and geared.")

        # --- STAGE 2: EXPLORATION & MAP TRAVEL ---
        log_step("2. STAGE 2", "Traveling to the Hollow Entrance.")
        sim.send({
            "action": "map_interaction",
            "character_id": "Hero",
            "interaction_type": "request_data"
        })
        map_data = sim.wait_for_event("MAP_DATA")
        
        # Find a connection to travel to
        current_node_id = map_data.get("current_node_id", "start_town")
        nodes = map_data.get("nodes", [])
        current_node = next((n for n in nodes if n["id"] == current_node_id), nodes[0] if nodes else None)
        
        if not current_node or not current_node.get("connections"):
            target_node = "dreadlands_entrance" # Known ID from previous run
        else:
            target_node = current_node["connections"][0]
        
        sim.send({
            "action": "map_interaction",
            "character_id": "Hero",
            "interaction_type": "travel",
            "target_node_id": target_node
        })
        
        # Wait for travel events
        sim.wait_for_event("MAP_UPDATE")
        
        # Wait for narrative
        narrative_done = False
        while not narrative_done:
            data = sim.receive()
            if data["type"] == "NARRATIVE_CHUNK" and data["done"]:
                narrative_done = True
        
        log_step("2. STAGE 2", f"Arrived at {target_node}.")

        # --- STAGE 3: SOCIAL INTERACTION ---
        log_step("3. STAGE 3", "Negotiating with the Gatekeeper (Skill Check).")
        sim.send({
            "action": "roll",
            "dice": "1d20+2",
            "label": "Persuasion Check"
        })
        dice_result = sim.wait_for_event("DICE_RESULT")
        log_step("3. STAGE 3", f"Persuasion roll: {dice_result['total']}")

        # --- STAGE 4: COMBAT ENCOUNTER ---
        log_step("4. STAGE 4", "Ambushed by Goblins!")
        sim.send({
            "action": "add_combatant",
            "instance_id": "Goblin1",
            "template_id": "monster_goblin",
            "is_player": False
        })
        sim.wait_for_event("INITIATIVE_UPDATE")
        
        sim.send({
            "action": "add_combatant",
            "instance_id": "Goblin2",
            "template_id": "monster_goblin",
            "is_player": False
        })
        sim.wait_for_event("INITIATIVE_UPDATE")
        
        sim.send({"action": "start_combat"})
        sim.wait_for_event("INITIATIVE_UPDATE")
        
        log_step("4. STAGE 4", "Hero attacks Goblin1 with Longsword.")
        sim.send({
            "action": "attack",
            "attacker_id": "Hero",
            "target_id": "Goblin1",
            "weapon_id": "equipment_longsword"
        })
        
        # Wait for Attack Resolution
        narrative_done = False
        while not narrative_done:
            data = sim.receive()
            if data["type"] == "NARRATIVE_CHUNK" and data["done"]:
                narrative_done = True
            elif data["type"] == "STATE_PATCH":
                for patch in data["patches"]:
                    if "hp" in patch["path"]:
                        log_step("4. STAGE 4", f"Goblin1 HP update: {patch['value']}")

        # --- STAGE 5: STATUS EFFECTS ---
        log_step("5. STAGE 5", "Goblin2 counter-attacks with Poisoned Dagger.")
        sim.send({
            "action": "cast_spell",
            "attacker_id": "Goblin2",
            "target_id": "Hero",
            "spell_id": "spell_poison-spray",
            "condition": "Poisoned",
            "is_save": True
        })
        
        narrative_done = False
        while not narrative_done:
            data = sim.receive()
            if data["type"] == "NARRATIVE_CHUNK" and data["done"]:
                narrative_done = True
            elif data["type"] == "STATE_PATCH":
                for patch in data["patches"]:
                    if "conditions" in patch["path"]:
                        log_step("5. STAGE 5", f"Hero Conditions: {patch['value']}")

        # --- STAGE 6: SPELLCASTING ---
        log_step("6. STAGE 6", "A Shaman appears and casts Fireball!")
        sim.send({
            "action": "cast_spell",
            "attacker_id": "Goblin2",
            "target_ids": ["Hero", "Goblin1"],
            "spell_id": "spell_fireball"
        })
        
        narrative_done = False
        while not narrative_done:
            data = sim.receive()
            if data["type"] == "NARRATIVE_CHUNK" and data["done"]:
                narrative_done = True
            elif data["type"] == "STATE_PATCH":
                log_step("6. STAGE 6", "AOE HP update recorded.")

        # --- STAGE 7: LOOT & PERSISTENCE ---
        log_step("7. STAGE 7", "Combat ends. Looting the Ring of Protection.")
        sim.send({
            "action": "distribute_loot",
            "target_character_id": "Hero",
            "item_ids": ["magic_item_ring-of-protection"]
        })

        sim.wait_for_event("INVENTORY_UPDATE")
        data = sim.wait_for_event("LOOT_DISTRIBUTED")
        items = data.get("items", [])
        ring_instance_id = items[0]["instance_id"] if items else "ring_01"
        
        sim.send({
            "action": "equip_item",
            "character_id": "Hero",
            "item_id": ring_instance_id,
            "slot": "ring_1"
        })
        sim.wait_for_event("INVENTORY_UPDATE")
        
        sim.send({
            "action": "save_game",
            "save_id": "descent_complete"
        })
        sim.wait_for_event("LOG")
        
        log_step("7. STAGE 7", "Simulation Complete. State Persisted.")

if __name__ == "__main__":
    try:
        sim_run()
    except Exception as e:
        print(f"\n[FATAL ERROR] Simulation crashed: {e}")
        traceback.print_exc()
        sys.exit(1)
