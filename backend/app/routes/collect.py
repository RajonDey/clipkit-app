from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.schemas import ClipkitPayload
from app.models.db_models import User, Idea, Clip, Tag
from app.db.session import SessionLocal
from app.core.auth import get_current_user

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/collect")
def collect(
    payload: ClipkitPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify the user in payload matches the authenticated user
    if payload.user.id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot collect data for another user")
    # Upsert user
    user_obj = db.query(User).filter_by(id=payload.user.id).first()
    if not user_obj:
        user_obj = User(id=payload.user.id, name=payload.user.name, email=payload.user.email)
        db.add(user_obj)
    else:
        user_obj.name = payload.user.name
        user_obj.email = payload.user.email
    db.flush()
    for idea in payload.ideas:
        idea_obj = db.query(Idea).filter_by(id=idea.id).first()
        if not idea_obj:
            idea_obj = Idea(id=idea.id, name=idea.name, category=idea.category, user_id=user_obj.id)
            db.add(idea_obj)
        else:
            idea_obj.name = idea.name
            idea_obj.category = idea.category
        db.flush()
        for clip in idea.clips:
            clip_obj = db.query(Clip).filter_by(id=clip.id).first()
            if not clip_obj:
                clip_obj = Clip(
                    id=clip.id,
                    type=clip.type,
                    value=clip.value,
                    status=clip.status,
                    created_at=clip.created_at,
                    idea_id=idea_obj.id
                )
                db.add(clip_obj)
            else:
                clip_obj.type = clip.type
                clip_obj.value = clip.value
                clip_obj.status = clip.status
                clip_obj.created_at = clip.created_at
            db.flush()
            # Tags (many-to-many)
            tag_objs = []
            for tag in clip.tags:
                tag_obj = db.query(Tag).filter_by(id=tag.id).first()
                if not tag_obj:
                    tag_obj = Tag(id=tag.id, name=tag.name)
                    db.add(tag_obj)
                tag_objs.append(tag_obj)
            clip_obj.tags = tag_objs
    db.commit()
    return {"message": "Saved to database!"}
