from fastapi import APIRouter, Depends, Request, HTTPException, status
from fastapi.responses import JSONResponse
from app.core.auth import get_current_user
from app.models.db_models import User

router = APIRouter(tags=["debug"])

@router.get("/debug/check-auth")
async def check_auth(request: Request, user: User = Depends(get_current_user)):
    """
    Check the authentication of the current user.
    This endpoint is useful for debugging token issues.
    """
    # Extract token from header
    auth_header = request.headers.get("Authorization")
    token = auth_header.split("Bearer ")[1] if auth_header and auth_header.startswith("Bearer ") else None
    
    # Token info to return (don't return the whole token for security)
    token_info = None
    if token:
        token_info = {
            "length": len(token),
            "prefix": token[:15] + "..." if len(token) > 15 else token,
        }
    
    return JSONResponse(
        content={
            "authenticated": True,
            "user": {
                "email": user.email,
                "name": user.name,
                "id": str(user.id)
            },
            "token_info": token_info,
            "headers": {
                "authorization": auth_header,
                "content_type": request.headers.get("Content-Type"),
                "user_agent": request.headers.get("User-Agent")
            }
        },
        status_code=200
    )
