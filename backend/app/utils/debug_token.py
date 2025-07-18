"""
Token debugging utility
"""

import jwt
from datetime import datetime, timedelta
import sys

# Same settings as in auth.py
SECRET_KEY = "your-secret-key-keep-it-secret"
ALGORITHM = "HS256"

def debug_token(token_str):
    """Decode and debug a JWT token"""
    print(f"Analyzing token: {token_str[:15]}...")
    
    try:
        # Split the token
        parts = token_str.split('.')
        if len(parts) != 3:
            print(f"ERROR: Invalid token format. Expected 3 parts, got {len(parts)}")
            return
            
        # Decode without verification first to see what's in it
        try:
            header_bytes = parts[0] + '=' * (-len(parts[0]) % 4)  # Add padding if needed
            header = jwt.utils.base64url_decode(header_bytes)
            print(f"Header (raw): {header}")
            
            payload_bytes = parts[1] + '=' * (-len(parts[1]) % 4)  # Add padding if needed
            payload = jwt.utils.base64url_decode(payload_bytes)
            print(f"Payload (raw): {payload}")
        except Exception as e:
            print(f"ERROR decoding token parts: {e}")
        
        # Now verify with library
        try:
            decoded = jwt.decode(token_str, SECRET_KEY, algorithms=[ALGORITHM])
            print(f"Successfully decoded token: {decoded}")
            
            # Check expiration
            if 'exp' in decoded:
                exp_time = datetime.fromtimestamp(decoded['exp'])
                now = datetime.utcnow()
                print(f"Token expires at: {exp_time}")
                print(f"Current UTC time: {now}")
                print(f"Time until expiration: {exp_time - now}")
                if exp_time < now:
                    print("WARNING: Token is EXPIRED!")
                else:
                    print("Token is still valid")
            else:
                print("WARNING: No expiration claim in token!")
                
            # Check subject
            if 'sub' in decoded:
                print(f"Token subject (user): {decoded['sub']}")
            else:
                print("WARNING: No subject claim in token!")
                
        except jwt.ExpiredSignatureError:
            print("ERROR: Token has expired")
        except jwt.InvalidTokenError as e:
            print(f"ERROR: Invalid token: {e}")
            
    except Exception as e:
        print(f"ERROR: Failed to analyze token: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python debug_token.py <token>")
        sys.exit(1)
        
    token = sys.argv[1]
    debug_token(token)
