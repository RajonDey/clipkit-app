from fastapi import APIRouter, HTTPException, Path, Query, Depends
from sqlalchemy.orm import Session
from typing import Optional
from app.models.db_models import Idea, User
from app.db.session import SessionLocal
from app.core.auth import get_current_user

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/ideas")
def list_ideas(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Idea).filter_by(user_id=current_user.id).all()

@router.get("/ideas/{idea_id}")
def get_idea(
    idea_id: str = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    idea = db.query(Idea).filter_by(id=idea_id, user_id=current_user.id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    return idea

@router.get("/my-ideas")
def list_my_ideas(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Idea).filter_by(user_id=current_user.id).all()
