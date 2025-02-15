from flask import Flask, request, jsonify
import requests
import base64
import json
import wikipediaapi
import os
import random

# OpenAI API Key (Replace with your actual API key)
API_KEY = os.getenv("API_KEY")

# OpenAI API endpoint
OPENAI_URL = "https://api.openai.com/v1/chat/completions"

# Flask App
app = Flask(__name__)

with open("Animals.json", "r", encoding="utf-8") as file:
    animals_data = json.load(file)["animals"]

@app.route('/animals', methods=['GET'])
def get_random_animals():
    """
    Returns `n` random animals from animals.json.
    Usage: /animals?count=5
    """
    # Get 'count' parameter from URL (default = 1)
    count = request.args.get("count", default=1, type=int)

    # Ensure `count` does not exceed total animals
    count = min(count, len(animals_data))

    # Select `count` random animals
    selected_animals = random.sample(animals_data, count)

    return jsonify({"count": count, "animals": selected_animals})

### 🚀 Endpoint 1: Classify Animal from Image ###
@app.route('/classify-animal', methods=['POST'])
def classify_animal():
    """
    Accepts an image file and identifies the animal in it.
    """
    if 'file' not in request.files:
        return jsonify({"error": "No image file uploaded"}), 400

    image_file = request.files['file']
    base64_image = base64.b64encode(image_file.read()).decode("utf-8")

    # OpenAI request payload
    payload = {
        "model": "gpt-4-turbo",
        "messages": [
            {"role": "system", "content": "You are an AI that identifies animals in images. Respond only with the animal's name and nothing else."},
            {"role": "user", "content": [
                {"type": "text", "text": "What animal is in this image?"},
                {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{base64_image}"}}
            ]}
        ],
        "max_tokens": 10
    }

    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
    response = requests.post(OPENAI_URL, json=payload, headers=headers)

    if response.status_code == 200:
        animal_name = response.json()["choices"][0]["message"]["content"].strip()
        return jsonify({"animal": animal_name})
    else:
        return jsonify({"error": "Failed to classify image", "details": response.json()}), 500


### 🚀 Endpoint 2: Fetch Wikipedia Animal Facts ###
@app.route('/animal-facts/<animal_name>', methods=['GET'])
def get_animal_facts(animal_name):
    """
    Fetches Wikipedia summary and extracts 5 facts using OpenAI.
    """
    wiki = wikipediaapi.Wikipedia(user_agent="MyPythonScript/1.0 (andy@example.com)", language="en")
    page = wiki.page(animal_name)

    if not page.exists():
        return jsonify({"error": f"No Wikipedia page found for '{animal_name}'."}), 404

    wikipedia_data = page.summary

    system_prompt = (
        "You are an AI assistant that strictly extracts information only from the given Wikipedia data. "
        "Do not use any external knowledge, only rely on the provided text. "
        "If the information is missing, say 'Not enough information provided.' "
        "Your task is to extract exactly 5 common facts about the animal."
    )

    user_query = "List 5 common facts about this animal, using only the provided data. Do not give the animal's name; refer to the animal as 'this animal', treat this as a trivia."

    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Here is Wikipedia data:\n\n{wikipedia_data}\n\n{user_query}"}
        ],
        "temperature": 0.3
    }

    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
    response = requests.post(OPENAI_URL, json=payload, headers=headers)

    if response.status_code == 200:
        facts = response.json()["choices"][0]["message"]["content"]
        return jsonify({"animal": animal_name, "facts": facts})
    else:
        return jsonify({"error": "Failed to retrieve facts", "details": response.json()}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
