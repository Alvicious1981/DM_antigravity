import sqlite3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / "packages" / "engine" / "dungeon_cortex_dev.db"

def dump_fireball():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT data_json FROM srd_mechanic WHERE id = 'spell_fireball'")
    row = cursor.fetchone()
    if row:
        data = json.loads(row["data_json"])
        print(json.dumps(data, indent=2))
    else:
        print("Fireball not found")
    conn.close()

if __name__ == "__main__":
    dump_fireball()
