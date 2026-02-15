import sys
import os
from sqlmodel import create_engine, Session, text

# Path setup
sys.path.append(os.path.join(os.getcwd(), "packages", "engine", "src"))
from engine.db import DB_PATH

sqlite_url = f"sqlite:///{DB_PATH}"
engine = create_engine(sqlite_url)

def verify_es():
    print(f"Verifying Spanish Data in {DB_PATH}")
    with Session(engine) as session:
        # Check a monster
        row = session.exec(text("SELECT data_es FROM srd_mechanic WHERE id = 'monster_aboleth'")).fetchone()
        if row and row[0]:
            print("✅ 'monster_aboleth' has Spanish data.")
            # print snippet
            print(f"   Snippet: {row[0][:100]}...")
        else:
            print("❌ 'monster_aboleth' missing Spanish data.")
            
        # Check a spell
        row = session.exec(text("SELECT data_es FROM srd_mechanic WHERE id = 'spell_fireball'")).fetchone()
        if row and row[0]:
            print("✅ 'spell_fireball' has Spanish data.")
        else:
            print("❌ 'spell_fireball' missing Spanish data.")

        # Check an item
        row = session.exec(text("SELECT data_es FROM srd_mechanic WHERE id = 'equipment_dagger'")).fetchone()
        if row and row[0]:
            print("✅ 'equipment_dagger' has Spanish data.")
        else:
            print("❌ 'equipment_dagger' missing Spanish data.")

        # Count total
        count = session.exec(text("SELECT count(*) FROM srd_mechanic WHERE data_es IS NOT NULL AND data_es != '{}'")).fetchone()[0]
        print(f"Total localized entries: {count}")

if __name__ == "__main__":
    verify_es()
