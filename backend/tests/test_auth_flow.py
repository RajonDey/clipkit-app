import requests
import json

BASE_URL = "http://localhost:8000"

def test_auth_flow():
    # 1. Register a new user
    register_data = {
        "email": "test@example.com",
        "password": "testpass123",
        "name": "Test User"
    }
    
    register_response = requests.post(
        f"{BASE_URL}/auth/register",
        json=register_data
    )
    assert register_response.status_code == 200
    assert "access_token" in register_response.json()
    
    # 2. Login with the user
    login_response = requests.post(
        f"{BASE_URL}/auth/login",
        data={
            "username": "test@example.com",
            "password": "testpass123"
        }
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    
    # 3. Access protected endpoint (ideas)
    headers = {"Authorization": f"Bearer {token}"}
    ideas_response = requests.get(
        f"{BASE_URL}/ideas",
        headers=headers
    )
    assert ideas_response.status_code == 200
    
    # 4. Try accessing without token (should fail)
    no_auth_response = requests.get(f"{BASE_URL}/ideas")
    assert no_auth_response.status_code == 401

if __name__ == "__main__":
    test_auth_flow()
    print("All tests passed successfully!")
