import requests
import base64
import json

# OpenAI API Key (Replace with your actual API key)
API_KEY = "Key"

# Path to the image file
image_path = "image.jpg"

# Read the image file and encode it as Base64
with open(image_path, "rb") as image_file:
    base64_image = base64.b64encode(image_file.read()).decode("utf-8")

# OpenAI API endpoint
url = "https://api.openai.com/v1/chat/completions"

# Define the request payload
payload = {
    "model": "gpt-4-turbo",
    "messages": [
        {
            "role": "system",
            "content": "You are an AI that identifies animals in images. Respond only with the animal's name and nothing else."
        },
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What animal is in this image?"},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/png;base64,{base64_image}"
                    }
                }
            ]
        }
    ],
    "max_tokens": 10
}

# Define headers with the API key
headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# Send the request to OpenAI
response = requests.post(url, json=payload, headers=headers)

# Print the response (animal name)
if response.status_code == 200:
    result = response.json()
    animal_name = result["choices"][0]["message"]["content"]
    print(animal_name)
else:
    print("Error:", response.json())
