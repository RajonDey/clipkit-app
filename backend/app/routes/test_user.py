from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.core.auth import get_db, get_password_hash, create_access_token, create_refresh_token
from app.models.db_models import User
from datetime import timedelta

router = APIRouter(tags=["debug"])

@router.get("/debug/create-test-user")
async def create_test_user(db: Session = Depends(get_db)):
    """
    Create a test user for development purposes.
    WARNING: This should only be used in development!
    """
    # Check if test user already exists
    test_email = "test@example.com"
    existing_user = db.query(User).filter(User.email == test_email).first()
    
    if existing_user:
        # Generate tokens for the existing user
        access_token = create_access_token(data={"sub": test_email})
        refresh_token = create_refresh_token(data={"sub": test_email})
        
        return JSONResponse(
            content={
                "message": "Test user already exists",
                "user": {
                    "email": test_email,
                    "name": existing_user.name,
                    "id": str(existing_user.id)
                },
                "access_token": access_token,
                "refresh_token": refresh_token
            },
            status_code=200
        )
    
    # Create new test user
    plain_password = "testpassword"
    hashed_password = get_password_hash(plain_password)
    print(f"Creating test user with email: {test_email}")
    print(f"Plain password: {plain_password}")
    print(f"Hashed password: {hashed_password}")
    
    test_user = User(
        email=test_email,
        name="Test User",
        hashed_password=hashed_password
    )
    
    db.add(test_user)
    db.commit()
    db.refresh(test_user)
    
    # Generate tokens
    access_token = create_access_token(data={"sub": test_email})
    refresh_token = create_refresh_token(data={"sub": test_email})
    
    return JSONResponse(
        content={
            "message": "Test user created successfully",
            "user": {
                "email": test_email,
                "name": test_user.name,
                "id": str(test_user.id)
            },
            "access_token": access_token,
            "refresh_token": refresh_token,
            "login_credentials": {
                "email": test_email,
                "password": "testpassword"
            }
        },
        status_code=201
    )

@router.get("/debug/reset-test-user-password")
async def reset_test_user_password(db: Session = Depends(get_db)):
    """
    Reset the test user's password for development purposes.
    WARNING: This should only be used in development!
    """
    # Check if test user exists
    test_email = "test@example.com"
    user = db.query(User).filter(User.email == test_email).first()
    
    if not user:
        return JSONResponse(
            content={"message": "Test user not found"},
            status_code=404
        )
    
    # Reset password
    plain_password = "testpassword"
    hashed_password = get_password_hash(plain_password)
    
    print(f"Resetting password for test user: {test_email}")
    print(f"Current password hash: {user.hashed_password[:20]}...")
    print(f"New password hash: {hashed_password[:20]}...")
    
    user.hashed_password = hashed_password
    db.commit()
    
    # Verify the password works
    verification_result = verify_password(plain_password, user.hashed_password)
    print(f"Password verification result: {verification_result}")
    
    return JSONResponse(
        content={
            "message": "Test user password reset successfully",
            "user": {
                "email": test_email,
                "name": user.name,
                "id": str(user.id)
            },
            "login_credentials": {
                "email": test_email,
                "password": plain_password
            },
            "verification_result": verification_result
        },
        status_code=200
    )
