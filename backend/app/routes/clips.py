from fastapi import APIRouter, HTTPException, Path, Query, Depends
from sqlalchemy.orm import Session
from typing import Optional
from app.models.db_models import Clip, Idea, Tag, User
from app.db.session import SessionLocal
from app.core.auth import get_current_user

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/clips")
def list_clips(
    idea: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Clip).join(Idea).filter(Idea.user_id == current_user.id)
    if idea:
        query = query.filter(Idea.id == idea)
    
    clips = query.all()
    print(f"Returning {len(clips)} clips for user {current_user.email}, idea filter: {idea}")
    for i, clip in enumerate(clips):
        print(f"  Clip {i+1}: id={clip.id}, type={clip.type}")
    
    return clips

@router.get("/clips/{clip_id}")
def get_clip(
    clip_id: str = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    clip = db.query(Clip).join(Idea).filter(
        Clip.id == clip_id,
        Idea.user_id == current_user.id
    ).first()
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found")
    return clip

@router.get("/clips-by-tag")
def list_clips_by_tag(
    tag: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Clip).join(Clip.tags).filter((Tag.id == tag) | (Tag.name == tag)).all()
