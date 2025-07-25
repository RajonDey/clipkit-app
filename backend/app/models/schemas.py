from pydantic import BaseModel, EmailStr
from typing import List, Optional

# Auth schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: Optional[str] = None

class RefreshRequest(BaseModel):
    refresh_token: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Existing schemas
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

# Request schemas for creating/updating
class ClipCreate(BaseModel):
    type: str
    content: str  # Frontend uses content instead of value
    idea_id: str
    tags: Optional[List[str]] = []
    lang: Optional[str] = None  # For code clips

class IdeaCreate(BaseModel):
    name: str
    category: Optional[str] = None

class IdeaUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None

class TagCreate(BaseModel):
    name: str

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
