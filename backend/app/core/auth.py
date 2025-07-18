from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.models.db_models import User
from app.models.schemas import TokenData
from app.db.session import SessionLocal

# Configuration
SECRET_KEY = "your-secret-key-keep-it-secret"  # Change this in production!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 720  # Extend to 12 hours for better testing

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Function to verify password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Function to hash password
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# Function to create access token
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    
    # Ensure sub field exists
    if "sub" not in to_encode:
        raise ValueError("Token data must contain 'sub' field")
    
    print(f"Creating token with payload: {to_encode}")
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    print(f"Generated token: {encoded_jwt[:10]}...")
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        print("No token provided")
        raise credentials_exception
        
    print(f"Received token: {token[:15]}...")
    
    try:
        # Add more detailed error handling
        if not token or len(token.split('.')) != 3:
            print(f"Invalid token format: {token[:15]}...")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token format",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"Decoded payload: {payload}")
        
        email: str = payload.get("sub")
        print(f"Decoded payload with email: {email}")
        
        if email is None:
            print("No email in token payload")
            raise credentials_exception
            
        # Check token expiration manually
        expiration = payload.get("exp")
        if not expiration:
            print("No expiration in token")
            raise credentials_exception
        
        current_time = datetime.utcnow().timestamp()
        if current_time > expiration:
            print(f"Token expired at {datetime.fromtimestamp(expiration)}, current time: {datetime.utcnow()}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        token_data = TokenData(email=email)
    except JWTError as e:
        print(f"JWT Error: {str(e)}")
        raise credentials_exception

    user = db.query(User).filter(User.email == token_data.email).first()
    if user is None:
        print(f"No user found with email: {token_data.email}")
        raise credentials_exception
        
    print(f"Successfully authenticated user: {user.email}")
    return user
