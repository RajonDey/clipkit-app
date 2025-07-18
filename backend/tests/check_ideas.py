"""
Check ideas in the database
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

# Add the parent directory to the path so we can import the app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the User model and database session
from app.models.db_models import User, Idea, Clip
from app.db.session import SessionLocal

def list_ideas():
    """List all ideas in the database"""
    db = SessionLocal()
    try:
        ideas = db.query(Idea).all()
        
        print(f"Found {len(ideas)} ideas in the database:")
        for i, idea in enumerate(ideas, 1):
            print(f"Idea {i}:")
            print(f"  ID: {idea.id}")
            print(f"  Name: {idea.name}")
            print(f"  User ID: {idea.user_id}")
            
            # Count clips
            clips = db.query(Clip).filter(Clip.idea_id == idea.id).all()
            print(f"  Clip count: {len(clips)}")
            
            # Get user if available
            if idea.user_id:
                user = db.query(User).filter(User.id == idea.user_id).first()
                if user:
                    print(f"  User: {user.name} ({user.email})")
                else:
                    print(f"  User: Not found (ID: {idea.user_id})")
            else:
                print("  User: None")
                
            print()
    finally:
        db.close()

def create_test_idea(user_email, idea_name="Test Idea"):
    """Create a test idea for a user"""
    db = SessionLocal()
    try:
        # Find user by email
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            print(f"No user found with email: {user_email}")
            return
            
        # Create a new idea
        new_idea = Idea(
            name=idea_name,
            category="Test",
            user_id=user.id
        )
        
        db.add(new_idea)
        db.commit()
        db.refresh(new_idea)
        
        print(f"Created new idea '{idea_name}' with ID: {new_idea.id}")
        return new_idea.id
    finally:
        db.close()
        
def create_test_clip(idea_id, clip_type="text", clip_value="This is a test clip"):
    """Create a test clip for an idea"""
    db = SessionLocal()
    try:
        # Find idea
        idea = db.query(Idea).filter(Idea.id == idea_id).first()
        if not idea:
            print(f"No idea found with ID: {idea_id}")
            return
            
        # Create a new clip
        new_clip = Clip(
            type=clip_type,
            value=clip_value,
            status="active",
            idea_id=idea_id
        )
        
        db.add(new_clip)
        db.commit()
        db.refresh(new_clip)
        
        print(f"Created new clip with ID: {new_clip.id}")
        return new_clip.id
    finally:
        db.close()

def main():
    """Main function"""
    if len(sys.argv) < 2:
        print("Usage: python check_ideas.py [list|create_idea|create_clip]")
        print("  list - List all ideas")
        print("  create_idea <user_email> <idea_name> - Create a test idea")
        print("  create_clip <idea_id> <type> <value> - Create a test clip")
        return
    
    command = sys.argv[1]
    
    if command == "list":
        list_ideas()
    elif command == "create_idea" and len(sys.argv) >= 3:
        user_email = sys.argv[2]
        idea_name = sys.argv[3] if len(sys.argv) > 3 else "Test Idea"
        create_test_idea(user_email, idea_name)
    elif command == "create_clip" and len(sys.argv) >= 3:
        idea_id = sys.argv[2]
        clip_type = sys.argv[3] if len(sys.argv) > 3 else "text"
        clip_value = sys.argv[4] if len(sys.argv) > 4 else "This is a test clip"
        create_test_clip(idea_id, clip_type, clip_value)
    else:
        print("Invalid command or missing arguments!")
        print("Run 'python check_ideas.py' without arguments for usage information.")

if __name__ == "__main__":
    main()
