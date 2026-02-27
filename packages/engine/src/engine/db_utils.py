"""
Dungeon Cortex — Database Utilities
Parity helpers for SQLite (dev) and PostgreSQL (prod).
"""

def get_json_extract_sql(column: str, path: str, dialect: str = "sqlite") -> str:
    """
    Generates dialect-specific SQL for JSON field extraction.
    
    Args:
        column: The database column containing JSON (e.g., 'data_json')
        path: JSON Path (e.g., '$.name')
        dialect: 'sqlite' or 'postgres'
        
    Returns:
        SQL string for extraction.
    """
    if dialect == "postgres":
        # Convert $.field to Postgres ->> syntax
        # e.g., '$.name' -> 'name'
        pg_path = path.lstrip("$.").replace(".", "->")
        if "->" in pg_path:
            parts = pg_path.rsplit("->", 1)
            # Last part uses ->> for text extraction
            return f"{column}->{parts[0]}->>'{parts[1]}'"
        return f"{column}->>'{pg_path}'"
    
    # SQLite Default
    return f"json_extract({column}, '{path}')"
