from fastapi import APIRouter
from app.db.memory import DB

router = APIRouter()

@router.get("/tags")
def list_tags():
    tag_map = {}
    for tag in DB["tags"].values():
        tag_map[tag["id"]] = tag
    return list(tag_map.values())
