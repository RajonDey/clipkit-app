from fastapi import FastAPI
from app.routes import collect

app = FastAPI()
app.include_router(collect.router)
