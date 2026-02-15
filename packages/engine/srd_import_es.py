import sys
import os
import json
from sqlmodel import create_engine, Session, text

# Path setup
sys.path.append(os.path.join(os.getcwd(), "packages", "engine", "src"))
from engine.db import DB_PATH

# Initialize Database Connection
sqlite_url = f"sqlite:///{DB_PATH}"
engine = create_engine(sqlite_url)

BASE_DIR = os.path.join(os.getcwd(), "external-sources", "5e-database-spanish", "src")

def load_json(filename):
    path = os.path.join(BASE_DIR, filename)
    if not os.path.exists(path):
        print(f"Error: File not found {path}")
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def update_entities(session, prefix, entities, batch_size=100):
    print(f"Processing {len(entities)} items for prefix '{prefix}'...")
    updates = 0
    
    for i, item in enumerate(entities):
        # Construct the ID used in our DB (snake_case slug behavior from srd_import.py)
        # srd_import.py: id = f"{prefix}_{data['slug'].replace('-', '_')}"
        # Spanish JSON uses 'index' which mimics the slug.
        slug = item.get("index", "").replace("-", "_")
        if not slug:
            continue
            
        mechanic_id = f"{prefix}_{slug}"
        
        # Serialize JSON content for the data_es column
        json_str = json.dumps(item, ensure_ascii=False)
        
        # Update query
        # We only update existing rows to ensure we don't insert partial data (missing English data_json)
        stmt = text("""
            UPDATE srd_mechanic 
            SET data_es = :data_es 
            WHERE id = :id
        """)
        
        result = session.exec(stmt, params={"data_es": json_str, "id": mechanic_id})
        if result.rowcount > 0:
            updates += 1
            
        if (i + 1) % batch_size == 0:
            session.commit()
            print(f"  Processed {i + 1} items...")

    session.commit()
    print(f"Finished {prefix}: Updated {updates} / {len(entities)} entities.\n")

def run_import():
    print(f"Starting Spanish SRD Import...")
    print(f"Database: {DB_PATH}")
    
    if not os.path.exists(BASE_DIR):
        print(f"CRITICAL: Spanish database directory not found at {BASE_DIR}")
        return

    with Session(engine) as session:
        # 1. Monsters
        monsters = load_json("5e-SRD-Monsters.json")
        update_entities(session, "monster", monsters)

        # 2. Spells
        spells = load_json("5e-SRD-Spells.json")
        update_entities(session, "spell", spells)

        # 3. Equipment (Matches 'equipment_' prefix in srd_import.py)
        # Note: srd_import.py maps 'weapons' to 'equipment_', so we check all equipment
        equipment = load_json("5e-SRD-Equipment.json")
        update_entities(session, "equipment", equipment)
        
    print("Import Complete!")

if __name__ == "__main__":
    run_import()
