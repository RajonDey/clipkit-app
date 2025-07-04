from fastapi import APIRouter, HTTPException, Path, Query
from typing import Optional
from app.models.schemas import Clip
from app.db.memory import DB

router = APIRouter()

@router.get("/clips")
def list_clips(idea: Optional[str] = None):
    if idea:
        idea_obj = DB["ideas"].get(idea)
        if not idea_obj:
            return []
        return idea_obj.get("clips", [])
    else:
        return list(DB["clips"].values())

@router.get("/clips/{clip_id}")
def get_clip(clip_id: str = Path(...)):
    clip = DB["clips"].get(clip_id)
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found")
    return clip

@router.get("/clips-by-tag")
def list_clips_by_tag(tag: str = Query(...)):
    result = []
    for clip in DB["clips"].values():
        for t in clip.get("tags", []):
            if t["id"] == tag or t["name"] == tag:
                result.append(clip)
                break
    return result
