from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from app.core.auth import (
    get_db,
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    SECRET_KEY,
    ALGORITHM
)
from app.models.db_models import User
from app.models.schemas import UserCreate, Token, RefreshRequest

router = APIRouter()

@router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        name=user_data.name,
        hashed_password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_data.email}, expires_delta=access_token_expires
    )
    
    # Create refresh token
    refresh_token = create_refresh_token(data={"sub": user_data.email})
    
    return {"access_token": access_token, "token_type": "bearer", "refresh_token": refresh_token}

@router.post("/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Login endpoint for authenticating users.
    """
    # Enhanced logging for debugging
    print("=" * 50)
    print(f"LOGIN ATTEMPT DETAILS:")
    print(f"- Username/Email: {form_data.username}")
    print(f"- Password provided: {'*' * len(form_data.password)} (length: {len(form_data.password)})")
    print("=" * 50)
    # Find user by email
    print(f"Login attempt for email: {form_data.username}")
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user:
        print(f"User not found: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"Found user: {user.email}, password hash: {user.hashed_password[:20]}...")
    
    # Verify password
    verification_result = verify_password(form_data.password, user.hashed_password)
    print(f"Password verification result: {verification_result}")
    print(f"Provided password: {form_data.password}")
    
    if not verification_result:
        print(f"Invalid password for user: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    # Create refresh token
    refresh_token = create_refresh_token(data={"sub": user.email})
    
    print(f"Login successful for: {user.email}")
    return {"access_token": access_token, "token_type": "bearer", "refresh_token": refresh_token}

@router.post("/auth/refresh", response_model=Token)
async def refresh_token(refresh_request: RefreshRequest, db: Session = Depends(get_db)):
    try:
        # Decode the refresh token
        payload = jwt.decode(refresh_request.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Verify this is a refresh token
        if payload.get("token_type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token type",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Get the email from the token
        email = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check if user exists
        user = db.query(User).filter(User.email == email).first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Generate new tokens
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": email}, expires_delta=access_token_expires
        )
        
        # Generate a new refresh token as well
        new_refresh_token = create_refresh_token(data={"sub": email})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "refresh_token": new_refresh_token
        }
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
