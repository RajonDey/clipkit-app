from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from uuid import uuid4
from datetime import datetime

router = APIRouter()

# --- Data Models ---
class Tag(BaseModel):
    id: str
    name: str

class Clip(BaseModel):
    id: str
    type: str
    value: str
    status: str
    created_at: str
    tags: List[Tag]

class Idea(BaseModel):
    id: str
    name: str
    category: Optional[str] = None
    user_id: Optional[str] = None
    clips: List[Clip]

class User(BaseModel):
    id: str
    name: str
    email: str

class ClipkitPayload(BaseModel):
    user: User
    ideas: List[Idea]

# --- In-memory storage ---
DB = {
    "users": {},
    "ideas": {},
    "clips": {},
    "tags": {},
}

@router.post("/collect")
def collect(payload: ClipkitPayload):
    user = payload.user
    DB["users"][user.id] = user.dict()
    for idea in payload.ideas:
        DB["ideas"][idea.id] = idea.dict()
        for clip in idea.clips:
            DB["clips"][clip.id] = clip.dict()
            for tag in clip.tags:
                DB["tags"][tag.id] = tag.dict()
    # Return the nested structure that was received (not the DB)
    return payload.dict()

@router.get("/db")
def get_db():
    """Return the raw in-memory database (for debugging/inspection)."""
    return DB
