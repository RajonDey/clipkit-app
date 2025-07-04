from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.collect import router as collect_router
from app.routes.ideas import router as ideas_router
from app.routes.clips import router as clips_router
from app.routes.tags import router as tags_router
from app.routes.db import router as db_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(collect_router)
app.include_router(ideas_router)
app.include_router(clips_router)
app.include_router(tags_router)
app.include_router(db_router)
