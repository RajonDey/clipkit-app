from pydantic import BaseModel
from typing import List

class ItemBase(BaseModel):
    theme: str
    tags: List[str] = []
    content_type: str
    content: str

class ItemCreate(ItemBase):
    pass

class Item(ItemBase):
    id: int

class Theme(BaseModel):
    name: str
    id: int

class Tag(BaseModel):
    name: str
    id: int
