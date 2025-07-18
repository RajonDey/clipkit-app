"""
List users in the database
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

# Add the parent directory to the path so we can import the app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the User model and database session
from app.models.db_models import User
from app.db.session import SessionLocal
from app.core.auth import get_password_hash, verify_password

def list_users():
    """List all users in the database"""
    db = SessionLocal()
    try:
        users = db.query(User).all()
        
        print(f"Found {len(users)} users in the database:")
        for i, user in enumerate(users, 1):
            print(f"User {i}:")
            print(f"  ID: {user.id}")
            print(f"  Name: {user.name}")
            print(f"  Email: {user.email}")
            print(f"  Password Hash: {user.hashed_password[:20]}...")
            print()
    finally:
        db.close()

def check_password(email, password):
    """Check if a password matches for a specific user"""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            print(f"No user found with email: {email}")
            return
        
        print(f"Found user: {user.name} ({user.email})")
        
        # Check the password
        if verify_password(password, user.hashed_password):
            print("✅ Password is correct!")
        else:
            print("❌ Password is incorrect!")
            
        # Print the first 20 chars of the hashed password for debugging
        print(f"Stored password hash: {user.hashed_password[:20]}...")
    finally:
        db.close()
        
def add_user(email, name, password):
    """Add a new user to the database"""
    db = SessionLocal()
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"User with email {email} already exists!")
            return
        
        # Hash the password
        hashed_password = get_password_hash(password)
        
        # Create new user
        new_user = User(
            email=email,
            name=name,
            hashed_password=hashed_password
        )
        
        # Add user to the database
        db.add(new_user)
        db.commit()
        
        print(f"User {name} ({email}) added successfully!")
    finally:
        db.close()
        
def update_password(email, new_password):
    """Update a user's password"""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            print(f"No user found with email: {email}")
            return
        
        # Hash the new password
        hashed_password = get_password_hash(new_password)
        
        # Update the password
        user.hashed_password = hashed_password
        db.commit()
        
        print(f"Password updated for user: {user.name} ({user.email})")
    finally:
        db.close()

def main():
    """Main function"""
    if len(sys.argv) < 2:
        print("Usage: python check_users.py [list|check|add|update]")
        print("  list - List all users")
        print("  check <email> <password> - Check if a password is correct")
        print("  add <email> <name> <password> - Add a new user")
        print("  update <email> <new_password> - Update a user's password")
        return
    
    command = sys.argv[1]
    
    if command == "list":
        list_users()
    elif command == "check" and len(sys.argv) >= 4:
        check_password(sys.argv[2], sys.argv[3])
    elif command == "add" and len(sys.argv) >= 5:
        add_user(sys.argv[2], sys.argv[3], sys.argv[4])
    elif command == "update" and len(sys.argv) >= 4:
        update_password(sys.argv[2], sys.argv[3])
    else:
        print("Invalid command or missing arguments!")
        print("Run 'python check_users.py' without arguments for usage information.")

if __name__ == "__main__":
    main()
