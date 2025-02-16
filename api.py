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

# -------------------- Helper Functions -------------------- #

def get_random_animals_helper(count):
    """
    Returns `n` random animals from animals.json.
    """
    count = min(count, len(animals_data))  # Ensure `count` does not exceed total
    return random.sample(animals_data, count)


def classify_animal_helper(image_file):
    """
    Calls OpenAI to classify an animal in the image.
    """
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
        return response.json()["choices"][0]["message"]["content"].strip()
    else:
        return None


def get_animal_facts_helper(animal_name):
    """
    Fetches Wikipedia summary and extracts 5 facts using OpenAI.
    """
    wiki = wikipediaapi.Wikipedia(user_agent="MyPythonScript/1.0 (andy@example.com)", language="en")
    page = wiki.page(animal_name)

    if not page.exists():
        return None

    wikipedia_data = page.summary

    system_prompt = (
    	"You are an AI assistant that strictly extracts information only from the given Wikipedia data. "
    	"Do not use any external knowledge, only rely on the provided text. "
  	"If the information is missing, say 'Not enough information provided.' "
    	"Your task is to extract exactly 5 clear, short, and distinct facts about the animal, in proper English."
	)

    user_query = (
    	"List exactly 5 common facts about this animal, using only the provided data. Do not give the animal's name; refer to the animal as 'this animal', treat this as a trivia."
    	"Format the response as plain text with each fact on a new line, like this:\n"
    	"1. Fact one.\n"
    	"2. Fact two.\n"
    	"3. Fact three.\n"
    	"4. Fact four.\n"
    	"5. Fact five."
	)

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
        return response.json()["choices"][0]["message"]["content"]
    else:
        return None


def classify_helper(image_file):
    """
    Classifies an image, fetches real & fake facts using helper functions instead of API calls.
    """
    # Step 1: Classify the animal using the helper function
    classified_animal = classify_animal_helper(image_file)
    if not classified_animal:
        return {"error": "Could not determine the animal"}, 400

    # Step 2: Get 2 real facts using the helper function and split them correctly
    real_facts_raw = get_animal_facts_helper(classified_animal)
    if not real_facts_raw:
        return {"error": f"No facts found for '{classified_animal}'"}, 404

    real_facts = real_facts_raw.split("\n")  # Split into list of facts
    real_facts = [fact.strip() for fact in real_facts if fact.strip()]  # Remove empty entries
    real_facts = real_facts[:2]  # Take the first 2 real facts

    # Step 3: Get 2 random animals for fake facts using the helper function
    fake_animals = get_random_animals_helper(2)
    fake_facts = []

    # Step 4: Fetch 1 fact from each fake animal using the helper function
    for animal in fake_animals:
        animal_name = animal.get("animal", "").strip()
        if not animal_name:
            continue

        fake_fact_raw = get_animal_facts_helper(animal_name)
        if fake_fact_raw:
            fake_fact_list = fake_fact_raw.split("\n")  # Split into list of facts
            fake_fact_list = [fact.strip() for fact in fake_fact_list if fact.strip()]  # Remove empty entries

            if fake_fact_list:
                fake_facts.append(fake_fact_list[0])  # Pick the first fact

        # Ensure we get exactly 2 fake facts
        if len(fake_facts) == 2:
            break

    return {
        "classified_animal": classified_animal,
        "real_facts": real_facts,
        "fake_facts": fake_facts
    }, 200

def generate_trivia_game_helper():
    """
    Generates a trivia game with 9 animal images and 5 facts about one correct animal.
    """
    # Step 1: Get 9 random animals
    animals = get_random_animals_helper(9)

    # Step 2: Select one animal as the correct answer
    correct_animal = random.choice(animals)
    correct_animal_name = correct_animal["animal"]
    correct_animal_image = correct_animal.get("image_url", "No image available")

    # Step 3: Get 5 facts about the correct animal
    facts_raw = get_animal_facts_helper(correct_animal_name)
    if not facts_raw:
        return {"error": f"No facts found for '{correct_animal_name}'"}, 404

    # Step 4: Split and clean facts
    facts = facts_raw.split("\n")  # Split into list of facts
    facts = [fact.strip() for fact in facts if fact.strip()]  # Remove empty entries
    facts = facts[:5]  # Ensure only 5 facts

    # Step 5: Extract image URLs
    image_urls = [animal["image_url"] for animal in animals if "image_url" in animal]

    return {
        "correct_animal": correct_animal_name,
        "correct_animal_image": correct_animal_image,
        "facts": facts,
        "image_urls": image_urls
    }, 200



# -------------------- Routes -------------------- #

@app.route('/animals', methods=['GET'])
def get_random_animals():
    count = request.args.get("count", default=1, type=int)
    animals = get_random_animals_helper(count)
    return jsonify({"count": count, "animals": animals})


@app.route('/classify-animal', methods=['POST'])
def classify_animal():
    if 'file' not in request.files:
        return jsonify({"error": "No image file uploaded"}), 400

    animal_name = classify_animal_helper(request.files['file'])
    if animal_name:
        return jsonify({"animal": animal_name})
    else:
        return jsonify({"error": "Failed to classify image"}), 500


@app.route('/animal-facts/<animal_name>', methods=['GET'])
def get_animal_facts(animal_name):
    facts = get_animal_facts_helper(animal_name)
    if facts:
        return jsonify({"animal": animal_name, "facts": facts})
    else:
        return jsonify({"error": f"No Wikipedia page found for '{animal_name}'"}), 404


@app.route('/classify', methods=['POST'])
def classify():
    if 'file' not in request.files:
        return jsonify({"error": "No image file uploaded"}), 400

    response, status_code = classify_helper(request.files['file'])
    return jsonify(response), status_code

@app.route('/trivia-game', methods=['GET'])
def trivia_game():
    """
    Returns 9 animal images and 5 facts about one correct animal.
    """
    response, status_code = generate_trivia_game_helper()
    return jsonify(response), status_code



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
