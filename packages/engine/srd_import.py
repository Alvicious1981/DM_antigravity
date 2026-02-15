import sys
import os
import json
import httpx
import asyncio
from sqlmodel import SQLModel, create_engine, Session, select
from sqlalchemy.dialects.sqlite import insert

# Path setup to find packages
sys.path.append(os.path.join(os.getcwd(), "packages", "engine", "src"))
sys.path.append(os.path.join(os.getcwd(), "packages", "db-schema"))
sys.path.append(os.path.join(os.getcwd(), "packages"))

from engine.db import DB_PATH
import models 

# Initialize SQLModel engine
sqlite_url = f"sqlite:///{DB_PATH}"
engine = create_engine(sqlite_url)

API_BASE = "https://api.open5e.com"

async def fetch_all_pages(client, url):
    results = []
    while url:
        print(f"Fetching {url}...")
        try:
            resp = await client.get(url, timeout=30.0)
            resp.raise_for_status()
            data = resp.json()
            results.extend(data.get("results", []))
            url = data.get("next")
        except httpx.RequestError as e:
            print(f"Request error: {e}")
            break
        except Exception as e:
            print(f"Error fetching data: {e}")
            break
    return results

def transform_monster(data):
    # Create a simplified ID based on slug
    m_id = f"monster_{data['slug'].replace('-', '_')}"
    return models.SrdMechanic(
        id=m_id,
        type="monster",
        data_json=data,
        data_es={} # Placeholder for future localization
    )

def transform_spell(data):
    s_id = f"spell_{data['slug'].replace('-', '_')}"
    return models.SrdMechanic(
        id=s_id,
        type="spell",
        data_json=data,
        data_es={}
    )

def transform_weapon(data):
    # Weapons in Open5e are often in a list
    w_id = f"equipment_{data['slug'].replace('-', '_')}"
    return models.SrdMechanic(
        id=w_id,
        type="item",
        data_json=data,
        data_es={}
    )

async def run_import():
    print(f"Connecting to DB at {DB_PATH}")
    
    # Ensure tables exist
    SQLModel.metadata.create_all(engine)

    async with httpx.AsyncClient() as client:
        # 1. Monsters
        print("\n--- Importing Monsters ---")
        monsters = await fetch_all_pages(client, f"{API_BASE}/monsters/?document__slug=wotc-srd")
        print(f"Fetched {len(monsters)} monsters.")
        
        # 2. Spells
        print("\n--- Importing Spells ---")
        spells = await fetch_all_pages(client, f"{API_BASE}/spells/?document__slug=wotc-srd")
        print(f"Fetched {len(spells)} spells.")

        # 3. Weapons
        print("\n--- Importing Weapons ---")
        # Open5e has a 'weapons' endpoint structure
        weapons = await fetch_all_pages(client, f"{API_BASE}/weapons/?document__slug=wotc-srd")
        print(f"Fetched {len(weapons)} weapons.")
        
        items = []
        for m in monsters:
            items.append(transform_monster(m))
        for s in spells:
            items.append(transform_spell(s))
        for w in weapons:
            items.append(transform_weapon(w))

        print(f"\nTotal items to upsert: {len(items)}")
        
        # Batch Insert/Update
        with Session(engine) as session:
            count = 0
            for item in items:
                # Upsert logic for SQLite
                stmt = insert(models.SrdMechanic).values(
                    id=item.id,
                    type=item.type,
                    data_json=item.data_json,
                    data_es=item.data_es
                ).on_conflict_do_update(
                    index_elements=['id'],
                    set_=dict(data_json=item.data_json)
                )
                session.exec(stmt)
                count += 1
                if count % 100 == 0:
                    session.commit()
                    print(f"Committed {count} items...")
            
            session.commit()
            print("Import Complete!")

if __name__ == "__main__":
    asyncio.run(run_import())
