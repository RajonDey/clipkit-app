from fastapi import APIRouter, Request
from pydantic import BaseModel

router = APIRouter()

class CollectPayload(BaseModel):
    theme: str
    note: str
    url: str

@router.post("/collect")
async def collect(payload: CollectPayload):
    print(payload)
    return {"message": "Item saved"}
