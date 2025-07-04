from fastapi import APIRouter, HTTPException, Path, Query
from typing import Optional
from app.models.schemas import Idea
from app.db.memory import DB

router = APIRouter()

@router.get("/ideas")
def list_ideas():
    return list(DB["ideas"].values())

@router.get("/ideas/{idea_id}")
def get_idea(idea_id: str = Path(...)):
    idea = DB["ideas"].get(idea_id)
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    return idea

@router.get("/ideas-by-user")
def list_ideas_by_user(user: str = Query(...)):
    return [idea for idea in DB["ideas"].values() if idea.get("user_id") == user]
