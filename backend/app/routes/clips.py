from fastapi import APIRouter, HTTPException, Path, Query, Depends
from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.db_models import Clip, Idea, Tag, User, clip_tags
from app.db.session import SessionLocal
from app.core.auth import get_current_user
from app.models.schemas import ClipCreate, TagCreate
import uuid

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

@router.post("/clips", status_code=201)
def create_clip(
    clip_data: ClipCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if the idea exists and belongs to the current user
    idea = db.query(Idea).filter(
        Idea.id == clip_data.idea_id,
        Idea.user_id == current_user.id
    ).first()
    
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found or does not belong to current user")
    
    # Create the clip
    new_clip = Clip(
        id=str(uuid.uuid4()),
        type=clip_data.type,
        value=clip_data.content,  # Map content to value
        status="active",
        idea_id=clip_data.idea_id,
        # Tags will be added below
    )
    
    db.add(new_clip)
    db.flush()  # Flush to get the ID
    
    # Handle tags
    if clip_data.tags:
        for tag_name in clip_data.tags:
            # Check if tag exists, create if not
            tag = db.query(Tag).filter(Tag.name == tag_name).first()
            if not tag:
                tag = Tag(id=str(uuid.uuid4()), name=tag_name)
                db.add(tag)
                db.flush()
            
            # Add the tag to the clip
            db.execute(
                clip_tags.insert().values(
                    clip_id=new_clip.id,
                    tag_id=tag.id
                )
            )
    
    db.commit()
    
    # Refresh to get all relationships loaded
    db.refresh(new_clip)
    return new_clip

@router.put("/clips/{clip_id}")
def update_clip(
    clip_id: str,
    clip_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get the clip and verify ownership
    clip = db.query(Clip).join(Idea).filter(
        Clip.id == clip_id,
        Idea.user_id == current_user.id
    ).first()
    
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found or does not belong to current user")
    
    # Update clip fields
    if "value" in clip_data or "content" in clip_data:
        clip.value = clip_data.get("content", clip_data.get("value", clip.value))
        
    if "type" in clip_data:
        clip.type = clip_data["type"]
    
    if "status" in clip_data:
        clip.status = clip_data["status"]
    
    # Handle tags if provided
    if "tags" in clip_data and clip_data["tags"] is not None:
        # Remove existing tags
        db.execute(
            clip_tags.delete().where(
                clip_tags.c.clip_id == clip_id
            )
        )
        
        # Add new tags
        for tag_name in clip_data["tags"]:
            # Check if tag exists, create if not
            tag = db.query(Tag).filter(Tag.name == tag_name).first()
            if not tag:
                tag = Tag(id=str(uuid.uuid4()), name=tag_name)
                db.add(tag)
                db.flush()
            
            # Add the tag to the clip
            db.execute(
                clip_tags.insert().values(
                    clip_id=clip.id,
                    tag_id=tag.id
                )
            )
    
    db.commit()
    db.refresh(clip)
    return clip

@router.delete("/clips/{clip_id}", status_code=204)
def delete_clip(
    clip_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get the clip and verify ownership
    clip = db.query(Clip).join(Idea).filter(
        Clip.id == clip_id,
        Idea.user_id == current_user.id
    ).first()
    
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found or does not belong to current user")
    
    # Delete associated tags
    db.execute(
        clip_tags.delete().where(
            clip_tags.c.clip_id == clip_id
        )
    )
    
    # Delete the clip
    db.delete(clip)
    db.commit()
    return {"message": "Clip deleted successfully"}
