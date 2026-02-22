import sqlite3
import json

db_path = "packages/engine/dungeon_cortex_dev.db"
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

terms = ["%longsword%", "%leather%armor%", "%goblin%", "%ring%protection%", "%fireball%", "%poison%"]

for term in terms:
    cursor.execute("SELECT id FROM srd_mechanic WHERE id LIKE ?", (term,))
    rows = cursor.fetchall()
    print(f"Results for {term}: {[row['id'] for row in rows]}")

conn.close()
