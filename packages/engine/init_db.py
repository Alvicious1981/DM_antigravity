import sys
import os
from sqlmodel import SQLModel, create_engine

# Path setup to find packages
sys.path.append(os.path.join(os.getcwd(), "packages", "engine", "src"))
sys.path.append(os.path.join(os.getcwd(), "packages"))

# Import from engine package
from engine.db import DB_PATH
# Import from db-schema package (folder name is db-schema, so we might need to be careful with dash)
# Python modules can't have dashes. Let's check the folder name again.
# It is "packages/db-schema". We probably can't import "db-schema".
# We might need to import it using importlib or rename the folder?
# Or maybe it has an underscore? "db_schema"?
# Let's assume it's "db_schema" or I need to check.
# The previous view_file said "packages/db-schema/models.py".
# That is problematic for import. 
# BUT, looking at `models.py` content, it doesn't show package name.
# Let's check if there is a `db_schema` folder or if it's `db-schema`.
# I'll use importlib for the dash-containing directory or add it directly to path.

sys.path.append(os.path.join(os.getcwd(), "packages", "db-schema"))
import models

def init_db():
    print(f"Initializing database at: {DB_PATH}")
    
    # Create engine
    # Note: We use the path from engine/db.py but need to format it as sqlite url
    sqlite_url = f"sqlite:///{DB_PATH}"
    engine = create_engine(sqlite_url)

    print("Creating tables...")
    SQLModel.metadata.create_all(engine)
    print("Tables created successfully.")

if __name__ == "__main__":
    init_db()
