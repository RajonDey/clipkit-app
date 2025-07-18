from fastapi import APIRouter, HTTPException, Path, Query, Depends
from sqlalchemy.orm import Session
from typing import Optional
from app.models.db_models import Idea, User
from app.db.session import SessionLocal
from app.core.auth import get_current_user
from app.models.schemas import IdeaCreate, IdeaUpdate
import uuid

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

@router.post("/ideas", status_code=201)
def create_idea(
    idea_data: IdeaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_idea = Idea(
        id=str(uuid.uuid4()),
        name=idea_data.name,
        category=idea_data.category,
        user_id=current_user.id
    )
    
    db.add(new_idea)
    db.commit()
    db.refresh(new_idea)
    return new_idea

@router.put("/ideas/{idea_id}")
def update_idea(
    idea_id: str,
    idea_data: IdeaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    idea = db.query(Idea).filter_by(id=idea_id, user_id=current_user.id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    
    # Update fields if provided
    if idea_data.name is not None:
        idea.name = idea_data.name
        
    if idea_data.category is not None:
        idea.category = idea_data.category
    
    db.commit()
    db.refresh(idea)
    return idea

@router.delete("/ideas/{idea_id}", status_code=204)
def delete_idea(
    idea_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    idea = db.query(Idea).filter_by(id=idea_id, user_id=current_user.id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    
    # Note: This will cascade delete all associated clips if foreign key constraints are set up
    db.delete(idea)
    db.commit()
    return {"message": "Idea deleted successfully"}

@router.get("/my-ideas")
def list_my_ideas(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Idea).filter_by(user_id=current_user.id).all()
