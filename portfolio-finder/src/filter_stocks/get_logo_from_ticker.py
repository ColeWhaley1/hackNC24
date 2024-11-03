import requests

# FILE MADE BY CHATGPT

API_KEY = "mEjL0nZ1ZK7bJSweOXc7AA==32PXGKZKnbImMthh" # Should be in .env but not working

def get_logo_from_ticker(ticker: str) -> str:
    url = f"https://api.api-ninjas.com/v1/logo?ticker={ticker}"
    
    headers = {
        'X-Api-Key': API_KEY,
    }
    
    try:
        response = requests.get(url, headers=headers)

        if response.status_code != 200:
            raise Exception(f"Error: {response.status_code} {response.text}")
        
        data = response.json()
        
        if data:  # Check if data is not empty
            return data[0]["image"]
        else:
            return ""
    except Exception as error:
        print('Request failed:', error)
        return ""

