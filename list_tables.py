import sqlite3
db_path = "packages/engine/game.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
print(f"Tables in {db_path}: {[table[0] for table in tables]}")
conn.close()
