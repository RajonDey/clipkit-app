"""
Test the AI service directly to diagnose issues
"""
import sys
import asyncio
from app.models.db_models import Clip, Idea
from app.services.ai_service import get_ai_service

class MockIdea:
    """Mock Idea object for testing"""
    def __init__(self, id="test-id", name="Test Idea"):
        self.id = id
        self.name = name

class MockClip:
    """Mock Clip object for testing"""
    def __init__(self, id="test-clip-id", type="text", value="Test clip content"):
        self.id = id
        self.type = type
        self.value = value

async def test_ai_service():
    """Test the AI service with mock data"""
    print("Testing AI service with mock data")
    
    # Create mock idea and clips
    idea = MockIdea()
    clips = [
        MockClip(id="clip1", type="text", value="This is a test clip with some content."),
        MockClip(id="clip2", type="link", value="https://example.com/test-link")
    ]
    
    # Get AI service
    ai_service = get_ai_service()
    
    # Test content generation
    print("\nGenerating mock content...")
    try:
        content = await ai_service.generate_content(
            idea=idea,
            clips=clips,
            content_type="article",
            tone="professional",
            length="short"
        )
        
        print("\nGenerated content:")
        print("-" * 50)
        print(content[:500] + "..." if len(content) > 500 else content)
        print("-" * 50)
        print(f"Content length: {len(content)} characters")
        
    except Exception as e:
        print(f"Error testing AI service: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_ai_service())
