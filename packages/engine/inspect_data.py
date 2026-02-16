import sys
import os
import json
from pprint import pprint

# Path setup
sys.path.append(os.path.join(os.getcwd(), "packages", "engine", "src"))
sys.path.append(os.path.join(os.getcwd(), "packages"))

from engine.srd_queries import get_srd_mechanic

def inspect():
    print("--- Inspecting Raw Data ---")
    
    try:
        print("\n1. Fireball:")
        fb = get_srd_mechanic("spell_fireball")
        pprint(fb)
    except Exception as e:
        print(e)
        
    try:
        print("\n2. Longsword:")
        ls = get_srd_mechanic("equipment_longsword")
        pprint(ls)
    except Exception as e:
        print(e)

if __name__ == "__main__":
    inspect()
