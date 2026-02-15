import sqlite3
import time
from pathlib import Path

DB_PATH = Path("packages/engine/dungeon_cortex_dev.db")

def benchmark():
    if not DB_PATH.exists():
        print(f"❌ DB not found at {DB_PATH}")
        return

    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()

    search_term = "Fireball"
    print(f"🔍 Benchmarking Search for: '{search_term}'\n")

    # 1. Standard LIKE Query (Simulating unoptimized scan)
    start_time = time.perf_counter()
    cursor.execute("SELECT id FROM srd_mechanic WHERE data_json LIKE ?", (f'%{search_term}%',))
    like_results = cursor.fetchall()
    end_time = time.perf_counter()
    like_duration = (end_time - start_time) * 1000
    print(f"🐢 Standard LIKE Query: {like_duration:.4f}ms (Found {len(like_results)} results)")

    # 2. FTS5 MATCH Query (Optimized index seek)
    start_time = time.perf_counter()
    cursor.execute("SELECT id FROM srd_mechanic_fts WHERE srd_mechanic_fts MATCH ?", (search_term,))
    fts_results = cursor.fetchall()
    end_time = time.perf_counter()
    fts_duration = (end_time - start_time) * 1000
    print(f"🚀 FTS5 MATCH Query:    {fts_duration:.4f}ms (Found {len(fts_results)} results)")

    # 3. Spanish Search Verification
    es_search = "Fuego"
    print(f"\n🇪🇸 Testing Spanish Search: '{es_search}'")
    cursor.execute("SELECT id, content_es FROM srd_mechanic_fts WHERE content_es MATCH ?", (es_search,))
    es_results = cursor.fetchall()
    for rid, content in es_results[:3]:
        print(f"  ✅ Found: {rid}")

    # 4. Hybrid Search Logic (Verification)
    # Finding "Fireball" only in "spell" type
    print("\n🛡️ Testing Type-Scoped Search (Spells matching 'Fire')")
    cursor.execute("""
        SELECT id FROM srd_mechanic_fts 
        WHERE type = 'spell' AND srd_mechanic_fts MATCH 'fire'
    """)
    scoped_results = cursor.fetchall()
    print(f"  ✅ Found {len(scoped_results)} spells.")

    conn.close()

if __name__ == "__main__":
    benchmark()
