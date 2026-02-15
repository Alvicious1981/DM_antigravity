from fastapi import APIRouter, HTTPException
import json
from ..db import get_db
from ..srd_queries import get_srd_mechanic

router = APIRouter(
    prefix="/api/srd",
    tags=["srd"]
)

@router.get("/{mechanic_id}")
async def get_srd_mechanic_endpoint(mechanic_id: str, lang: str = "en"):
    """
    Fetch a single SRD mechanic by ID.
    Second Law: State is Truth — this IS the canonical game data.
    """
    try:
        data = get_srd_mechanic(mechanic_id, lang)
        return {
            "id": mechanic_id,
            "data": data,
        }
    except Exception as e:
        # Fallback for manual query if helper fails or returns incomplete
        db = get_db()
        row = db.execute(
            "SELECT id, type, data_json, data_es FROM srd_mechanic WHERE id = ?",
            (mechanic_id,)
        ).fetchone()

        if not row:
            raise HTTPException(status_code=404, detail=f"Mechanic '{mechanic_id}' not found")

        data = json.loads(row["data_es"] if lang == "es" else row["data_json"])
        return {
            "id": row["id"],
            "type": row["type"],
            "data": data,
        }


@router.get("/type/{mechanic_type}")
async def list_srd_by_type(mechanic_type: str, lang: str = "en", limit: int = 50, offset: int = 0):
    """
    List SRD mechanics by type (spell, monster, equipment, etc).
    """
    db = get_db()
    rows = db.execute(
        "SELECT id, data_json, data_es FROM srd_mechanic WHERE type = ? LIMIT ? OFFSET ?",
        (mechanic_type, limit, offset)
    ).fetchall()

    total = db.execute(
        "SELECT COUNT(*) FROM srd_mechanic WHERE type = ?",
        (mechanic_type,)
    ).fetchone()[0]

    items = []
    for row in rows:
        data_str = row["data_es"] if lang == "es" else row["data_json"]
        if not data_str:
             data_str = row["data_json"] # Fallback

        data = json.loads(data_str)
        items.append({
            "id": row["id"],
            "name": data.get("name", "Unknown"),
            "index": data.get("index", ""),
        })

    return {
        "type": mechanic_type,
        "total": total,
        "items": items,
    }
