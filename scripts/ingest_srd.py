"""
Dungeon Cortex — SRD Data Ingestion Pipeline (Phase 2)
============================================================================
ETL script that reads D&D 5e SRD JSON files from:
  - external-sources/5e-database/src/2014/      (English, canonical)
  - external-sources/5e-database-spanish/src/    (Spanish, localization)

Merges them by `index` key and inserts into the `srd_mechanic` SQLite table.

Usage:
    python scripts/ingest_srd.py

The database file is created at: packages/engine/dungeon_cortex_dev.db
"""

import json
import os
import sys
from pathlib import Path
from datetime import datetime

# ── Paths ──────────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parent.parent
EN_DATA_DIR = ROOT / "external-sources" / "5e-database" / "src" / "2014"
ES_DATA_DIR = ROOT / "external-sources" / "5e-database-spanish" / "src"
DB_PATH = ROOT / "packages" / "engine" / "dungeon_cortex_dev.db"

# ── File → Type Mapping ───────────────────────────────────────
# Maps the JSON filename stem to the `type` field in SrdMechanic.
# We prefix the `index` with the type to create a unique SrdMechanic.id
FILE_TYPE_MAP = {
    "5e-SRD-Monsters":              "monster",
    "5e-SRD-Spells":                "spell",
    "5e-SRD-Equipment":             "equipment",
    "5e-SRD-Magic-Items":           "magic_item",
    "5e-SRD-Classes":               "class",
    "5e-SRD-Subclasses":            "subclass",
    "5e-SRD-Races":                 "race",
    "5e-SRD-Subraces":              "subrace",
    "5e-SRD-Features":              "feature",
    "5e-SRD-Traits":                "trait",
    "5e-SRD-Conditions":            "condition",
    "5e-SRD-Damage-Types":          "damage_type",
    "5e-SRD-Magic-Schools":         "magic_school",
    "5e-SRD-Equipment-Categories":  "equipment_category",
    "5e-SRD-Weapon-Properties":     "weapon_property",
    "5e-SRD-Ability-Scores":        "ability_score",
    "5e-SRD-Skills":                "skill",
    "5e-SRD-Proficiencies":         "proficiency",
    "5e-SRD-Languages":             "language",
    "5e-SRD-Alignments":            "alignment",
    "5e-SRD-Backgrounds":           "background",
    "5e-SRD-Feats":                 "feat",
    "5e-SRD-Levels":                "level",
    "5e-SRD-Rule-Sections":         "rule_section",
    "5e-SRD-Rules":                 "rule",
}


def load_json(filepath: Path) -> list:
    """Load a JSON array from file with UTF-8 encoding."""
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, list):
        print(f"  ⚠ {filepath.name} is not a JSON array, skipping.")
        return []
    return data


def build_es_index(es_data: list) -> dict:
    """Build a lookup dictionary from Spanish data, keyed by `index`."""
    lookup = {}
    for item in es_data:
        idx = item.get("index")
        if idx:
            lookup[idx] = item
    return lookup


def create_database():
    """Create the SQLite database and srd_mechanic table."""
    import sqlite3

    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()

    # Core table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS srd_mechanic (
            id   TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            data_json TEXT NOT NULL DEFAULT '{}',
            data_es   TEXT NOT NULL DEFAULT '{}'
        )
    """)

    # FTS5 Virtual Table for Hybrid Search (Full-Text)
    # We include id, type, content_en, and content_es for searching
    cursor.execute("""
        CREATE VIRTUAL TABLE IF NOT EXISTS srd_mechanic_fts USING fts5(
            id UNINDEXED,
            type,
            content_en,
            content_es,
            tokenize='unicode61'
        )
    """)

    # Index for fast type queries on the core table
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_srd_mechanic_type ON srd_mechanic(type)
    """)

    conn.commit()
    return conn


def ingest():
    """Main ETL pipeline."""
    print("=" * 60)
    print("🎲 DUNGEON CORTEX — SRD Data Ingestion Pipeline")
    print(f"   Started: {datetime.now().isoformat()}")
    print("=" * 60)

    # Validate source directories exist
    if not EN_DATA_DIR.exists():
        print(f"❌ English data not found: {EN_DATA_DIR}")
        print("   Run: git clone --depth 1 https://github.com/5e-bits/5e-database.git external-sources/5e-database")
        sys.exit(1)

    if not ES_DATA_DIR.exists():
        print(f"❌ Spanish data not found: {ES_DATA_DIR}")
        print("   Run: git clone --depth 1 https://github.com/Magical20-ai/5e-database-spanish.git external-sources/5e-database-spanish")
        sys.exit(1)

    # Create database
    conn = create_database()
    cursor = conn.cursor()
    print(f"\n📦 Database: {DB_PATH}")
    print()

    total_inserted = 0
    total_es_matched = 0
    stats = {}

    for filename_stem, mechanic_type in FILE_TYPE_MAP.items():
        en_file = EN_DATA_DIR / f"{filename_stem}.json"
        es_file = ES_DATA_DIR / f"{filename_stem}.json"

        if not en_file.exists():
            print(f"  ⚠ Skipping {filename_stem} — English file not found")
            continue

        # Load English data (canonical)
        en_data = load_json(en_file)
        if not en_data:
            continue

        # Load Spanish data (localization) — may not exist
        es_lookup = {}
        if es_file.exists():
            es_data = load_json(es_file)
            es_lookup = build_es_index(es_data)

        # Insert records
        count = 0
        es_count = 0

        for item in en_data:
            idx = item.get("index")
            if not idx:
                continue

            mechanic_id = f"{mechanic_type}_{idx}"
            data_json_str = json.dumps(item, ensure_ascii=False)

            # Match Spanish translation
            es_item = es_lookup.get(idx, {})
            data_es_str = json.dumps(es_item, ensure_ascii=False) if es_item else "{}"

            if es_item:
                es_count += 1

            # Upsert (INSERT OR REPLACE) core table
            cursor.execute("""
                INSERT OR REPLACE INTO srd_mechanic (id, type, data_json, data_es)
                VALUES (?, ?, ?, ?)
            """, (mechanic_id, mechanic_type, data_json_str, data_es_str))

            # Populate FTS table
            # Extract names and descriptions for search
            content_en = f"{item.get('name', '')} {item.get('desc', '') or ''}"
            if isinstance(item.get('desc'), list):
                content_en = f"{item.get('name', '')} {' '.join(item.get('desc', []))}"
            
            content_es = f"{es_item.get('name', '')} {es_item.get('desc', '') or ''}"
            if isinstance(es_item.get('desc'), list):
                content_es = f"{es_item.get('name', '')} {' '.join(es_item.get('desc', []))}"

            cursor.execute("""
                INSERT OR REPLACE INTO srd_mechanic_fts (id, type, content_en, content_es)
                VALUES (?, ?, ?, ?)
            """, (mechanic_id, mechanic_type, content_en, content_es))

            count += 1

        conn.commit()

        # Stats
        es_label = f" (🇪🇸 {es_count})" if es_count > 0 else ""
        print(f"  ✅ {mechanic_type:22s} → {count:>4d} records{es_label}")
        stats[mechanic_type] = {"total": count, "es": es_count}
        total_inserted += count
        total_es_matched += es_count

    # Summary
    print()
    print("─" * 60)
    print(f"  📊 Total records:    {total_inserted}")
    print(f"  🇪🇸 Spanish matches: {total_es_matched}")
    print(f"  📂 Database size:    {DB_PATH.stat().st_size / 1024:.1f} KB")
    print("─" * 60)

    # ── Verification Query: Fireball ──────────────────────────
    print()
    print("🔍 VERIFICATION — Querying 'Fireball':")
    cursor.execute("SELECT id, type, data_json, data_es FROM srd_mechanic WHERE id = ?", ("spell_fireball",))
    row = cursor.fetchone()

    if row:
        mechanic_id, mechanic_type, data_json_str, data_es_str = row
        en_data = json.loads(data_json_str)
        es_data = json.loads(data_es_str)

        damage_dice = en_data.get("damage", {}).get("damage_at_slot_level", {}).get("3", "?")
        es_name = es_data.get("name", "❌ NOT FOUND")
        en_name = en_data.get("name", "❌ NOT FOUND")

        print(f"  ✅ ID:           {mechanic_id}")
        print(f"  🇬🇧 Name (EN):   {en_name}")
        print(f"  🇪🇸 Name (ES):   {es_name}")
        print(f"  🎲 Damage (L3):  {damage_dice}")
        print(f"  🏫 School:       {en_data.get('school', {}).get('name', '?')}")
    else:
        print("  ❌ Fireball not found in database!")

    conn.close()
    print()
    print(f"✨ Ingestion complete — {datetime.now().isoformat()}")


if __name__ == "__main__":
    ingest()
