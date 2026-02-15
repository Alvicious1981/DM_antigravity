import sqlite3
import json
from pathlib import Path

DB_PATH = Path("packages/engine/dungeon_cortex_dev.db")

def verify():
    if not DB_PATH.exists():
        print(f"❌ DB not found at {DB_PATH}")
        return

    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    
    spell_id = 'spell_fireball'
    print(f"🔍 Querying for {spell_id}...")
    
    cursor.execute("SELECT id, data_json, data_es FROM srd_mechanic WHERE id = ?", (spell_id,))
    row = cursor.fetchone()
    
    if row:
        print("✅ Row found!")
        data_es_str = row[2]
        print(f"📜 ES Data raw: {data_es_str[:100]}...")
        data_es = json.loads(data_es_str)
        print(f"🇪🇸 Name: {data_es.get('name')}")
    else:
        print("❌ Row not found!")

    conn.close()

if __name__ == "__main__":
    verify()
