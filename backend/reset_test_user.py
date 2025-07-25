# Reset test user password script
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.db_models import User
from app.db.session import SessionLocal
from app.core.auth import get_password_hash, verify_password

# Connect to database
db = SessionLocal()

# Find test user
test_user = db.query(User).filter(User.email == 'test@example.com').first()

if test_user:
    print(f'User found: {test_user.email}')
    print(f'Current hash: {test_user.hashed_password[:20]}...')
    
    # Create new password hash
    new_hash = get_password_hash('testpassword')
    print(f'New hash: {new_hash[:20]}...')
    
    # Test verification
    print(f'Verification with current hash: {verify_password("testpassword", test_user.hashed_password)}')
    print(f'Verification with new hash: {verify_password("testpassword", new_hash)}')
    
    # Update password
    test_user.hashed_password = new_hash
    db.commit()
    
    # Verify update was successful
    updated_user = db.query(User).filter(User.email == 'test@example.com').first()
    print(f'Updated hash: {updated_user.hashed_password[:20]}...')
    print(f'Verification after update: {verify_password("testpassword", updated_user.hashed_password)}')
    
    print("Password updated successfully!")
else:
    print("Test user not found!")
