"""
Test content generation API endpoint
"""
import requests
import sys
import json
from datetime import datetime

# Configuration
API_URL = "http://localhost:8000"

def login(email, password):
    """Attempt to login with the provided credentials"""
    print(f"Attempting to login with email: {email}")
    
    # Create form data for login request
    form_data = {
        "username": email,
        "password": password
    }
    
    try:
        response = requests.post(
            f"{API_URL}/auth/login", 
            data=form_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        # Check if login was successful
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            print(f"Login successful! Token: {token[:15]}...")
            return token
        else:
            print(f"Login failed with status code: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"Error during login request: {e}")
        return None

def list_ideas(token):
    """List all ideas for the authenticated user"""
    print("Retrieving ideas...")
    
    try:
        response = requests.get(
            f"{API_URL}/ideas",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            ideas = response.json()
            print(f"Found {len(ideas)} ideas:")
            for i, idea in enumerate(ideas, 1):
                print(f"Idea {i}:")
                print(f"  ID: {idea.get('id')}")
                print(f"  Name: {idea.get('name')}")
                print()
            return ideas
        else:
            print(f"Failed to retrieve ideas: {response.status_code}")
            print(f"Response: {response.text}")
            return []
    except Exception as e:
        print(f"Error retrieving ideas: {e}")
        return []

def list_clips(token, idea_id=None):
    """List all clips for the authenticated user, optionally filtered by idea"""
    url = f"{API_URL}/clips"
    if idea_id:
        url += f"?idea={idea_id}"
        
    print(f"Retrieving clips from {url}...")
    
    try:
        response = requests.get(
            url,
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            clips = response.json()
            print(f"Found {len(clips)} clips:")
            for i, clip in enumerate(clips, 1):
                print(f"Clip {i}:")
                print(f"  ID: {clip.get('id')}")
                print(f"  Type: {clip.get('type')}")
                print(f"  Value: {clip.get('value')[:30]}...")
                print(f"  Idea ID: {clip.get('idea_id')}")
                print()
            return clips
        else:
            print(f"Failed to retrieve clips: {response.status_code}")
            print(f"Response: {response.text}")
            return []
    except Exception as e:
        print(f"Error retrieving clips: {e}")
        return []

def generate_content(token, idea_id, clip_ids, content_type="article", tone="professional", length="medium"):
    """Generate content using the API"""
    print(f"Generating content for idea {idea_id} with {len(clip_ids)} clips...")
    
    data = {
        "idea_id": idea_id,
        "clip_ids": clip_ids,
        "content_type": content_type,
        "tone": tone,
        "length": length
    }
    
    try:
        response = requests.post(
            f"{API_URL}/content/generate",
            json=data,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
        )
        
        if response.status_code == 200:
            content = response.json()
            print("Content generated successfully!")
            print("\nGENERATED CONTENT:")
            print("=================")
            print(content.get("content"))
            return content
        else:
            print(f"Failed to generate content: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"Error generating content: {e}")
        return None

def main():
    """Main function to run the content generation test"""
    if len(sys.argv) < 3:
        print("Usage: python test_content_gen.py <email> <password> [idea_id]")
        return
    
    email = sys.argv[1]
    password = sys.argv[2]
    
    # Optional idea ID argument
    idea_id = sys.argv[3] if len(sys.argv) > 3 else None
    
    # Login first
    token = login(email, password)
    if not token:
        print("Login failed, cannot continue.")
        return
    
    # If no idea ID was provided, list ideas and ask user to select one
    if not idea_id:
        ideas = list_ideas(token)
        if not ideas:
            print("No ideas found. Please create an idea first.")
            return
        
        # Ask user to select an idea
        idea_index = int(input("Enter the number of the idea to use: ")) - 1
        if idea_index < 0 or idea_index >= len(ideas):
            print("Invalid idea number.")
            return
        
        idea_id = ideas[idea_index].get('id')
    
    # List clips for the selected idea
    clips = list_clips(token, idea_id)
    if not clips:
        print("No clips found for this idea. Please add some clips first.")
        return
    
    # Use first few clips (or all if less than 3)
    if clips:
        # Use actual clip IDs instead of indices
        clip_ids = [clip.get('id') for clip in clips[:2]]
        print(f"Using clip IDs: {clip_ids}")
    else:
        print("No clips found, cannot generate content")
        return
    
    # Generate content
    generate_content(token, idea_id, clip_ids)

if __name__ == "__main__":
    main()
