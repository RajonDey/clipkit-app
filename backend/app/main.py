from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.collect import router as collect_router
from app.routes.ideas import router as ideas_router
from app.routes.clips import router as clips_router
from app.routes.tags import router as tags_router
from app.routes.db import router as db_router
from app.routes.auth import router as auth_router
from app.routes.content import router as content_router
from app.routes.debug import router as debug_router
from app.routes.test_user import router as test_user_router
from app.routes.auth_debug import router as auth_debug_router
import os

# Check if we're in development mode
DEBUG = os.environ.get("DEBUG", "false").lower() == "true"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(collect_router)
app.include_router(ideas_router)
app.include_router(clips_router)
app.include_router(tags_router)
app.include_router(db_router)
app.include_router(content_router, prefix="/content", tags=["content"])

# Only include debug routes in development
if DEBUG or True:  # Force enable for now, remove 'or True' in production
    app.include_router(debug_router)
    app.include_router(test_user_router)
    app.include_router(auth_debug_router)
