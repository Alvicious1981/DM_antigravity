import sqlite3
import os

# Connect to DB
db_path = os.path.join("packages", "engine", "dungeon_cortex_dev.db")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# List tables
print("Tables:")
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
for t in tables:
    print(f"- {t[0]}")

# Check for item data in srd_mechanic
print("\nSample Items in srd_mechanic:")
try:
    cursor.execute("SELECT id, type, data_json FROM srd_mechanic WHERE type LIKE '%item%' LIMIT 5")
    items = cursor.fetchall()
    for item in items:
        print(f"- {item[0]} ({item[1]})")
except Exception as e:
    print(f"Error querying items: {e}")

conn.close()
