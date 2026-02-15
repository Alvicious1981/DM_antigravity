import sys
from pathlib import Path
import json

# Add engine to path
sys.path.append(str(Path(__file__).resolve().parent.parent / "src"))

from engine.spells import get_all_spells

def verify():
    spells = get_all_spells()
    print(f"Loaded {len(spells)} spells.")
    
    # Serialize to JSON for comparison
    output = []
    for spell in spells:
        output.append(spell.__dict__)
    
    # Sort by ID to ensure deterministic order
    output.sort(key=lambda x: x["id"])
    
    # Write to file
    with open("spells_dump.json", "w") as f:
        json.dump(output, f, indent=2, sort_keys=True)
    
    print("Dumped spells to spells_dump.json")

if __name__ == "__main__":
    verify()
