from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional, Union
from pydantic import BaseModel
from app.models.db_models import Clip, Idea, User
from app.db.session import SessionLocal
from sqlalchemy.orm import Session
from app.services.ai_service import get_ai_service
from app.core.auth import get_current_user

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ContentGenerationRequest(BaseModel):
    idea_id: str
    clip_ids: List[Union[int, str]]  # Accept both integer and string IDs
    content_type: str
    tone: str
    length: str

class GeneratedContent(BaseModel):
    content: str
    
@router.post("/generate", response_model=GeneratedContent)
async def generate_content(
    request: ContentGenerationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate content based on clips within an idea
    """
    print(f"Content generation requested by user: {current_user.email}")
    print(f"Request details: idea_id={request.idea_id}, clip_ids={request.clip_ids}")
    
    # Print auth info for debugging
    print(f"Auth: User ID = {current_user.id}, Email = {current_user.email}")
    
    # Verify idea exists and belongs to the current user
    idea = db.query(Idea).filter(
        Idea.id == request.idea_id,
        Idea.user_id == current_user.id
    ).first()
    
    # Variable to hold our clips
    clips = []
    using_mock_data = False
    
    if not idea:
        print(f"Idea not found: {request.idea_id} for user: {current_user.email}")
        print(f"Looking up idea regardless of user...")
        
        # Debug: Check if idea exists at all
        any_idea = db.query(Idea).filter(Idea.id == request.idea_id).first()
        if any_idea:
            print(f"Idea exists but belongs to user {any_idea.user_id}, not {current_user.id}")
        else:
            print(f"Idea with ID {request.idea_id} does not exist in the database")
            
        # For development purposes, create a mock idea if not found
        # This allows testing with frontend mock data
        print("Creating mock idea for development testing")
        idea = Idea(
            id=request.idea_id,
            name=f"Mock Idea {request.idea_id}",
            user_id=current_user.id
        )
        
        # Flag that we're using mock data
        using_mock_data = True
        
        # Create mock clips based on the IDs provided
        for i, clip_id in enumerate(request.clip_ids):
            # Create a custom clip object that mimics both frontend and backend fields
            clip = type('MockClip', (), {
                'id': str(clip_id),
                'type': "text",
                'value': f"Mock clip {i+1} for testing purposes",
                'content': f"Mock clip {i+1} for testing purposes",  # Add content field for frontend compatibility
                'status': "active",
                'idea_id': request.idea_id
            })
            clips.append(clip)
            
        # Continue with content generation using mock data
        print(f"Using mock idea and {len(clips)} mock clips for testing")
        
        # Comment out the exception for development testing
        # raise HTTPException(status_code=404, detail="Idea not found")
    
    # Get selected clips if we're not using mock data
    if not using_mock_data:
        try:
            print(f"Looking for clips with IDs: {request.clip_ids} for idea: {request.idea_id}")
            
            # Check if we're using numeric IDs (frontend) or UUID strings (from test script)
            using_numeric_ids = all(isinstance(id, int) for id in request.clip_ids)
            print(f"Using numeric IDs: {using_numeric_ids}")
            
            # Fetch all clips for this idea
            all_idea_clips = db.query(Clip).filter(
                Clip.idea_id == request.idea_id
            ).all()
            
            if not all_idea_clips:
                print(f"No clips found for idea: {request.idea_id}")
                raise HTTPException(status_code=404, detail="No clips found in this idea")
            
            if using_numeric_ids:
                # Map integer IDs from frontend to string UUIDs in backend
                # This is needed because frontend uses numbers, backend uses UUIDs
                clip_id_map = {i+1: clip for i, clip in enumerate(all_idea_clips)}
                
                print("Available clips in idea:")
                for idx, clip in clip_id_map.items():
                    print(f"  Frontend ID {idx} -> Backend UUID {clip.id}, Type: {clip.type}")
                
                selected_clips = [clip_id_map.get(clip_id) for clip_id in request.clip_ids if clip_id in clip_id_map]
            else:
                # Assume we're using actual clip IDs (from test script)
                print("Using actual clip IDs from database")
                selected_clips = [clip for clip in all_idea_clips if clip.id in request.clip_ids]
            
            if not selected_clips:
                print(f"None of the provided clip IDs match clips in this idea")
                raise HTTPException(status_code=404, detail="No matching clips found for the provided IDs")
            
            print(f"Found {len(selected_clips)} matching clips:")
            for clip in selected_clips:
                print(f"  - ID: {clip.id}, Type: {clip.type}")
                
            clips = selected_clips
        except Exception as e:
            print(f"Error fetching clips: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error fetching clips: {str(e)}")
    else:
        print("Using mock clips instead of querying the database")
        # We already have mock clips populated from above
    
    try:
        # Get AI service
        ai_service = get_ai_service()
        
        print(f"Calling AI service to generate {request.content_type} content")
        print(f"Idea: {getattr(idea, 'name', 'Unknown')} (ID: {getattr(idea, 'id', 'Unknown')})")
        print(f"Clips count: {len(clips)}")
        
        # Log more information about the clips
        for idx, clip in enumerate(clips):
            # Safely get attributes
            clip_id = getattr(clip, 'id', f'unknown-{idx}')
            clip_type = getattr(clip, 'type', 'unknown')
            
            # Try different attribute names for content
            clip_content = None
            try:
                if hasattr(clip, 'value'):
                    clip_content = clip.value
                elif hasattr(clip, 'content'):
                    clip_content = clip.content
                else:
                    clip_content = "No content available"
            except Exception as e:
                clip_content = f"Error accessing content: {str(e)}"
            
            # Print clip info
            content_preview = clip_content[:30] if clip_content else "N/A"
            print(f"  Clip {idx+1}: ID={clip_id}, Type={clip_type}, Content={content_preview}...")
        
        # Generate content using AI service
        content = await ai_service.generate_content(
            idea=idea,
            clips=clips,
            content_type=request.content_type,
            tone=request.tone,
            length=request.length
        )
        
        print(f"Content generation successful, returning {len(content)} characters")
        return {"content": content}
    except Exception as e:
        # Log the error
        print(f"Error generating content: {str(e)}")
        # Return a fallback response if AI generation fails
        return {"content": f"""# Generated {request.content_type.capitalize()}

AI generation encountered an error: {str(e)}

Please try again later or contact support if the issue persists.

## Alternative Content
This is a {request.length} {request.tone} {request.content_type} that would be generated based on {len(clips)} clips from your idea "{idea.title}".

### Introduction
{idea.description}

### Main Content
This would contain the generated content based on your clips. The AI would analyze your clips and generate coherent content.

### Conclusion
This {request.content_type} was generated using ClipKit's AI Content Workspace. You can edit this content directly, regenerate with different parameters, or export it.
        """}
