import sys
import os

# Ensure src is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "src")))

from src.engine.db import get_db

def verify_goblin():
    db = get_db()
    row = db.execute("SELECT id, data_json FROM srd_mechanic WHERE id = 'monster_goblin'").fetchone()
    if row:
        import json
        data = json.loads(row['data_json'])
        print(f"SUCCESS: Found 'monster_goblin'. Data length: {len(row['data_json'])}")
        if "actions" in data:
            print("ACTIONS FOUND:")
            print(json.dumps(data["actions"], indent=2))
        else:
            print("NO ACTIONS FIELD FOUND.")
    else:
        print("FAILED: 'monster_goblin' not found in DB.")
        # List similar IDs
        rows = db.execute("SELECT id FROM srd_mechanic WHERE id LIKE '%goblin%'").fetchall()
        print("Similar IDs:", [r['id'] for r in rows])

if __name__ == "__main__":
    verify_goblin()
