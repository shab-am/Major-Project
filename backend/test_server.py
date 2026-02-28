"""
Quick test script to verify the Flask server is working
Run this after starting the server to test all endpoints
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_endpoint(method, endpoint, data=None):
    """Test an API endpoint"""
    try:
        if method == 'GET':
            response = requests.get(f"{BASE_URL}{endpoint}")
        elif method == 'POST':
            response = requests.post(
                f"{BASE_URL}{endpoint}",
                json=data,
                headers={'Content-Type': 'application/json'}
            )
        
        print(f"\n{'='*60}")
        print(f"{method} {endpoint}")
        print(f"Status: {response.status_code}")
        print(f"Response:")
        print(json.dumps(response.json(), indent=2))
        return response.status_code == 200
    except requests.exceptions.ConnectionError:
        print(f"\n{'='*60}")
        print(f"ERROR: Could not connect to {BASE_URL}")
        print("Make sure the Flask server is running!")
        return False
    except Exception as e:
        print(f"\n{'='*60}")
        print(f"ERROR: {str(e)}")
        return False

if __name__ == '__main__':
    print("Testing Flask Backend Server")
    print("="*60)
    
    # Test root endpoint
    test_endpoint('GET', '/')
    
    # Test health check
    test_endpoint('GET', '/api/health')
    
    # Test list datasets
    test_endpoint('GET', '/api/python/datasets')
    
    # Test list scripts
    test_endpoint('GET', '/api/python/scripts')
    
    # Test run script (this will fail if no dataset, but should return proper error)
    test_endpoint('POST', '/api/python/run', {
        'script_name': 'plant_health_model',
        'dataset': 'plant_health_data.csv'
    })
    
    print("\n" + "="*60)
    print("Testing complete!")
    print("="*60)

