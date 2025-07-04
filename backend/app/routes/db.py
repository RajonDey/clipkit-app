from fastapi import APIRouter
from app.db.memory import DB

router = APIRouter()

@router.get("/db")
def get_db():
    """Return the raw in-memory database (for debugging/inspection)."""
    return DB
