from pydantic import BaseModel
from typing import List, Optional

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
