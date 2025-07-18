"""
Test authentication flow with the backend API
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

def check_auth(token):
    """Check if the token is valid by making a request to a protected endpoint"""
    print(f"Testing authentication with token: {token[:15]}...")
    
    try:
        # Try to access the /clips endpoint which requires authentication
        response = requests.get(
            f"{API_URL}/clips", 
            headers={"Authorization": f"Bearer {token}"}
        )
        
        # Check if request was successful
        if response.status_code == 200:
            print("Authentication successful!")
            data = response.json()
            print(f"Retrieved {len(data)} clips")
            return True
        else:
            print(f"Authentication failed with status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"Error during authentication test: {e}")
        return False

def parse_token(token):
    """Parse and display token information"""
    print("\nToken Information:")
    print("-----------------")
    
    try:
        # Split the token into parts
        parts = token.split('.')
        
        if len(parts) != 3:
            print(f"Invalid token format. Expected 3 parts, got {len(parts)}")
            return
        
        # Decode the payload (middle part)
        import base64
        # Add padding if needed
        payload_b64 = parts[1] + "=" * ((4 - len(parts[1]) % 4) % 4)
        payload_bytes = base64.b64decode(payload_b64)
        payload = json.loads(payload_bytes)
        
        # Display token information
        print(f"Subject (email): {payload.get('sub', 'Not found')}")
        
        # Check expiration
        if 'exp' in payload:
            exp_time = datetime.fromtimestamp(payload['exp'])
            now = datetime.now()
            time_remaining = exp_time - now
            
            print(f"Expiration: {exp_time}")
            print(f"Current time: {now}")
            print(f"Time remaining: {time_remaining}")
            
            if exp_time < now:
                print("WARNING: Token is EXPIRED!")
            else:
                print(f"Token is valid for {time_remaining}")
        else:
            print("WARNING: No expiration claim in token!")
            
    except Exception as e:
        print(f"Error parsing token: {e}")

def main():
    """Main function to run the authentication test"""
    if len(sys.argv) < 3:
        print("Usage: python auth_test.py <email> <password>")
        return
    
    email = sys.argv[1]
    password = sys.argv[2]
    
    # Attempt to login
    token = login(email, password)
    
    if token:
        # Parse and display token information
        parse_token(token)
        
        # Test authentication with the token
        check_auth(token)
    
if __name__ == "__main__":
    main()
