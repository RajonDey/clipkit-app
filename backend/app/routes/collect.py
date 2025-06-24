from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class ClipPayload(BaseModel):
    theme: str
    content_type: str
    content: str
    description: Optional[str] = None

# In-memory storage for demo
clips = []

@router.post("/clip")
async def save_clip(payload: ClipPayload):
    clips.append(payload)
    return {"message": "Clip saved", "clip": payload}

@router.get("/clips")
async def get_clips():
    return clips
