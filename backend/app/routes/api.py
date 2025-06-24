from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.schemas.item import Theme, Tag
from typing import List, Dict

router = APIRouter()

themes = [Theme(name="General", id=1)]
tags = [Tag(name="example", id=1)]

# New grouped item model
class ThemeContent(BaseModel):
    theme: str
    tags: List[str] = []
    texts: List[str] = []
    urls: List[str] = []
    images: List[str] = []
    videos: List[str] = []
    others: List[str] = []

# In-memory store: one per theme
theme_items: Dict[str, ThemeContent] = {}

class CollectPayload(BaseModel):
    theme: str
    tags: List[str] = []
    content_type: str
    content: str

@router.post("/collect", response_model=ThemeContent)
def collect(payload: CollectPayload):
    theme = payload.theme
    if theme not in theme_items:
        theme_items[theme] = ThemeContent(theme=theme, tags=[])
    # Always merge tags
    for tag in payload.tags:
        if tag not in theme_items[theme].tags:
            theme_items[theme].tags.append(tag)
    # Append content to the correct array
    if payload.content_type == "text":
        theme_items[theme].texts.append(payload.content)
    elif payload.content_type == "url":
        theme_items[theme].urls.append(payload.content)
    elif payload.content_type == "image":
        theme_items[theme].images.append(payload.content)
    elif payload.content_type == "video":
        theme_items[theme].videos.append(payload.content)
    else:
        theme_items[theme].others.append(payload.content)
    return theme_items[theme]

@router.get("/items", response_model=List[ThemeContent])
def get_items(theme: str = None):
    if theme:
        return [theme_items[theme]] if theme in theme_items else []
    return list(theme_items.values())

@router.get("/themes", response_model=List[Theme])
def get_themes():
    return themes

class ThemeCreate(BaseModel):
    name: str

@router.post("/themes", response_model=Theme)
def create_theme(theme: ThemeCreate):
    # Prevent duplicate theme names
    if any(t.name == theme.name for t in themes):
        raise HTTPException(status_code=400, detail="Theme already exists")
    new_theme = Theme(id=len(themes)+1, name=theme.name)
    themes.append(new_theme)
    return new_theme

@router.get("/tags", response_model=List[Tag])
def get_tags(q: str = ""):
    if q:
        return [t for t in tags if q.lower() in t.name.lower()]
    return tags

@router.post("/tags", response_model=Tag)
def create_tag(tag: Tag):
    new_tag = Tag(id=len(tags)+1, name=tag.name)
    tags.append(new_tag)
    return new_tag
