import os
import httpx
from typing import List, Dict, Any
from pydantic import BaseModel
from app.models.db_models import Clip, Idea

# Environment variables
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "llama3-70b-8192" # or another model available in GROQ

class AIService:
    """Service for AI-related operations"""
    
    def __init__(self, api_key: str = None, model: str = MODEL):
        self.api_key = api_key or GROQ_API_KEY
        self.model = model
        # Don't raise an error, just log a warning if API key is missing
        if not self.api_key:
            print("WARNING: GROQ API key is not set. Using mock responses for content generation.")
            self.use_mock = True
        else:
            self.use_mock = False
    
    async def generate_content(
        self,
        idea: Idea,
        clips: List[Clip],
        content_type: str,
        tone: str,
        length: str
    ) -> str:
        """Generate content based on clips and parameters"""
        
        try:
            # Process clips based on type
            text_clips = []
            image_clips = []
            link_clips = []
            video_clips = []
            code_clips = []
            
            for clip in clips:
                try:
                    # Handle different attribute names (content vs value)
                    clip_content = getattr(clip, 'value', None)
                    if clip_content is None:
                        clip_content = getattr(clip, 'content', 'No content available')
                    
                    if clip.type == "text":
                        text_clips.append(clip_content)
                    elif clip.type == "image":
                        image_clips.append(f"Image URL: {clip_content}")
                    elif clip.type == "link":
                        link_clips.append(f"Link: {clip_content}")
                    elif clip.type == "video":
                        video_clips.append(f"Video URL: {clip_content}")
                    elif clip.type == "code":
                        # Fallback if lang is not available
                        code_clips.append(f"Code snippet:\n```\n{clip_content}\n```")
                except AttributeError as e:
                    print(f"Error processing clip {getattr(clip, 'id', 'unknown')}: {str(e)}")
                    print(f"Clip attributes: {dir(clip)}")
            
            # Build prompt for content generation
            prompt = self._build_prompt(
                idea=idea,
                text_clips=text_clips,
                image_clips=image_clips,
                link_clips=link_clips,
                video_clips=video_clips,
                code_clips=code_clips,
                content_type=content_type,
                tone=tone,
                length=length
            )
            
            # Make API request to GROQ
            try:
                # Use mock response if no API key
                if self.use_mock:
                    print("Using mock response for content generation (no API key)")
                    return self._generate_mock_content(
                        idea=idea,
                        text_clips=text_clips,
                        image_clips=image_clips,
                        link_clips=link_clips,
                        video_clips=video_clips,
                        code_clips=code_clips,
                        content_type=content_type,
                        tone=tone,
                        length=length
                    )
                    
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        GROQ_API_URL,
                        headers={
                            "Authorization": f"Bearer {self.api_key}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "model": self.model,
                            "messages": [
                                {"role": "system", "content": "You are a professional content creator that specializes in creating high-quality content based on collected research and notes."},
                                {"role": "user", "content": prompt}
                            ],
                            "temperature": 0.7,
                            "max_tokens": self._get_max_tokens(length)
                        },
                        timeout=60.0  # Increased timeout for longer generations
                    )
                    
                    if response.status_code != 200:
                        print(f"Error from GROQ API: {response.text}")
                        return f"Error generating content: {response.status_code}"
                    
                    result = response.json()
                    return result["choices"][0]["message"]["content"]
                    
            except Exception as e:
                print(f"Error calling GROQ API: {str(e)}")
                return f"Error generating content: {str(e)}"
                
        except Exception as e:
            print(f"Unexpected error in generate_content: {str(e)}")
            return f"Error in content generation: {str(e)}"
    
    def _build_prompt(
        self,
        idea: Idea,
        text_clips: List[str],
        image_clips: List[str],
        link_clips: List[str],
        video_clips: List[str],
        code_clips: List[str],
        content_type: str,
        tone: str,
        length: str
    ) -> str:
        """Build a detailed prompt for content generation"""
        
        # Handle different attribute names (name vs title)
        try:
            idea_name = getattr(idea, 'name', None)
            if idea_name is None:
                idea_name = getattr(idea, 'title', 'Untitled Idea')
                
            idea_description = getattr(idea, 'description', None)
            if idea_description is None:
                idea_description = 'No description available'
        except Exception as e:
            print(f"Error accessing idea attributes: {str(e)}")
            idea_name = "Mock Idea"
            idea_description = "No description available"
        
        prompt = f"""
Create a {length} {tone} {content_type} based on the following idea and collection of research clips.

IDEA: {idea_name}
DESCRIPTION: {idea_description}

COLLECTED RESEARCH CLIPS:
"""
        
        # Add text clips
        if text_clips:
            prompt += "\n--- TEXT NOTES ---\n"
            for i, clip in enumerate(text_clips, 1):
                prompt += f"{i}. {clip}\n"
        
        # Add image descriptions
        if image_clips:
            prompt += "\n--- IMAGE REFERENCES ---\n"
            for i, clip in enumerate(image_clips, 1):
                prompt += f"{i}. {clip}\n"
        
        # Add links
        if link_clips:
            prompt += "\n--- LINKS AND RESOURCES ---\n"
            for i, clip in enumerate(link_clips, 1):
                prompt += f"{i}. {clip}\n"
        
        # Add videos
        if video_clips:
            prompt += "\n--- VIDEO REFERENCES ---\n"
            for i, clip in enumerate(video_clips, 1):
                prompt += f"{i}. {clip}\n"
        
        # Add code snippets
        if code_clips:
            prompt += "\n--- CODE SNIPPETS ---\n"
            for i, clip in enumerate(code_clips, 1):
                prompt += f"{i}. {clip}\n"
        
        # Add specific instructions based on content type
        prompt += f"""
CONTENT SPECIFICATIONS:
- Type: {content_type}
- Tone: {tone}
- Length: {length}
"""

        if content_type == "article":
            prompt += """
Create a well-structured article with:
- An engaging headline
- A compelling introduction
- Clear section headings
- A strong conclusion
- Use markdown formatting for structure
"""
        elif content_type == "script":
            prompt += """
Create a video script with:
- A hook to grab attention
- Clear sections for introduction, main points, and conclusion
- Visual and audio cues (marked as [VISUAL] or [AUDIO])
- Conversational tone suitable for speaking
- Use markdown formatting for structure
"""
        elif content_type == "social":
            prompt += """
Create a social media post that:
- Is concise and engaging
- Includes relevant hashtags
- Has a clear call-to-action
- Is optimized for sharing
- Use markdown formatting if needed
"""
        elif content_type == "outline":
            prompt += """
Create a detailed content outline with:
- Main sections and subsections
- Key points for each section
- Suggested references or examples
- Use markdown formatting for hierarchical structure
"""
        elif content_type == "email":
            prompt += """
Create an email with:
- A relevant subject line
- Professional greeting
- Clear and concise body
- Appropriate call-to-action
- Professional signature
- Use markdown formatting for structure
"""
        elif content_type == "blog":
            prompt += """
Create a blog post with:
- An attention-grabbing title
- Engaging introduction with a hook
- Well-structured body with subheadings
- Relevant examples or stories
- A conclusion with takeaways
- Call-to-action for readers
- Use markdown formatting for structure
"""
        
        prompt += "\nThe content should be formatted in Markdown."
        
        return prompt
    
    def _generate_mock_content(
        self,
        idea: Idea,
        text_clips: List[str],
        image_clips: List[str],
        link_clips: List[str],
        video_clips: List[str],
        code_clips: List[str],
        content_type: str,
        tone: str,
        length: str
    ) -> str:
        """Generate mock content when no API key is available"""
        try:
            # Create a title based on the idea name or title
            idea_name = None
            try:
                # Try to get the name attribute
                idea_name = getattr(idea, 'name', None)
                if idea_name is None:
                    # If name is not available, try title
                    idea_name = getattr(idea, 'title', 'Unknown Idea')
            except Exception as e:
                print(f"Error accessing idea name/title: {str(e)}")
                idea_name = "Unknown Idea"
                
            title = f"# {idea_name.title()}: A Generated {content_type.title()}"
            
            # Create introduction
            intro = f"""
## Introduction

This is a mock {content_type} generated in a {tone} tone with {length} length.
This content is being generated because the GROQ API key is not configured.
To use actual AI-generated content, please set the GROQ_API_KEY environment variable.
            """
            
            # Create sections from clips
            sections = []
            
            if text_clips:
                sections.append("## Text Clips Summary")
                for clip in text_clips:
                    sections.append(f"- {clip[:100]}...")
            
            if link_clips:
                sections.append("## Referenced Links")
                for link in link_clips:
                    sections.append(f"- {link}")
            
            if image_clips:
                sections.append("## Image References")
                for img in image_clips:
                    sections.append(f"- {img}")
            
            if video_clips:
                sections.append("## Video References")
                for video in video_clips:
                    sections.append(f"- {video}")
            
            if code_clips:
                sections.append("## Code Snippets")
                for code in code_clips:
                    sections.append(code)
            
            # Create conclusion
            conclusion = """
## Conclusion

This is a mock conclusion for the generated content. In a real implementation,
this would be generated by an AI model using the GROQ API.

Thank you for using ClipKit!
            """
            
            # Combine all parts
            all_parts = [title, intro] + sections + [conclusion]
            return "\n\n".join(all_parts)
            
        except Exception as e:
            print(f"Error in mock content generation: {str(e)}")
            return f"""# Error in Mock Content Generation

An error occurred while generating mock content: {str(e)}

This is likely due to an issue with accessing attributes on the idea or clips.
Please check the server logs for more details.

## Debugging Information
- Idea type: {type(idea)}
- Number of clips: text={len(text_clips)}, links={len(link_clips)}, images={len(image_clips)}
- Content type: {content_type}
- Tone: {tone}
- Length: {length}
"""
            
    def _get_max_tokens(self, length: str) -> int:
        """Determine max tokens based on requested length"""
        if length == "short":
            return 1000
        elif length == "medium":
            return 2500
        else:  # long
            return 5000

# Create singleton instance
ai_service = None

def get_ai_service():
    """Get or create AI service instance"""
    global ai_service
    if ai_service is None:
        ai_service = AIService()
    return ai_service
