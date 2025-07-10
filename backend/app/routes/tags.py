from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.db_models import Tag, User, Clip, Idea
from app.db.session import SessionLocal
from app.core.auth import get_current_user

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/tags")
def list_tags(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get tags only from clips that belong to the user's ideas
    return db.query(Tag).join(Tag.clips).join(Clip.idea).filter(
        Idea.user_id == current_user.id
    ).distinct().all()
