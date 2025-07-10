from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    hashed_password = Column(String, nullable=False)
    ideas = relationship("Idea", back_populates="user")

class Idea(Base):
    __tablename__ = "ideas"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    category = Column(String, nullable=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    user = relationship("User", back_populates="ideas")
    clips = relationship("Clip", back_populates="idea")

class Clip(Base):
    __tablename__ = "clips"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    type = Column(String, nullable=False)
    value = Column(Text, nullable=False)
    status = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    idea_id = Column(String, ForeignKey("ideas.id"), nullable=False)
    idea = relationship("Idea", back_populates="clips")
    tags = relationship("Tag", secondary="clip_tags", back_populates="clips")

class Tag(Base):
    __tablename__ = "tags"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, unique=True)
    clips = relationship("Clip", secondary="clip_tags", back_populates="tags")

from sqlalchemy import Table
clip_tags = Table(
    "clip_tags",
    Base.metadata,
    Column("clip_id", String, ForeignKey("clips.id"), primary_key=True),
    Column("tag_id", String, ForeignKey("tags.id"), primary_key=True),
)
