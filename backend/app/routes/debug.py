from fastapi import APIRouter
from fastapi.responses import JSONResponse
from app.core.auth import create_access_token
from datetime import timedelta
from app.core.auth import ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter()

@router.get("/auth/debug-token")
async def debug_token():
    """
    Generate a debug token for testing purposes.
    WARNING: This should not be used in production!
    """
    # Create a debug token with a long expiration
    access_token_expires = timedelta(days=7)  # Very long expiration for testing
    access_token = create_access_token(
        data={"sub": "test@example.com"}, expires_delta=access_token_expires
    )
    
    return JSONResponse(
        content={
            "access_token": access_token,
            "token_type": "bearer",
            "note": "This is a debug token. Do not use in production!"
        },
        status_code=200
    )
