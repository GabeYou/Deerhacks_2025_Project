import requests
import json
import wikipediaapi  # Wikipedia API client
import sys  # For command-line arguments

# OpenAI API Key
API_KEY = "key"

# OpenAI API endpoint
API_URL = "https://api.openai.com/v1/chat/completions"

def fetch_wikipedia_summary(search_term, lang="en"):
    """
    Fetches a summary of the Wikipedia page for the given search term.
    """
    wiki_wiki = wikipediaapi.Wikipedia(user_agent="MyPythonScript/1.0 (andy@example.com)", language=lang)
    page = wiki_wiki.page(search_term)

    if not page.exists():
        return f"No Wikipedia page found for '{search_term}'."

    return page.summary  # Return only the summary (not the full content)

def query_gpt4o_mini(system_prompt, user_query, data):
    """
    Queries OpenAI GPT-4o Mini with Wikipedia data.
    """
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Here is Wikipedia data:\n\n{data}\n\n{user_query}"}
    ]

    payload = {
        "model": "gpt-4o-mini",
        "messages": messages,
        "temperature": 0.3
    }

    response = requests.post(API_URL, headers=headers, data=json.dumps(payload))

    if response.status_code == 200:
        return response.json()["choices"][0]["message"]["content"]
    else:
        print("Error:", response.status_code, response.text)
        return None

if __name__ == "__main__":
    # Check if a search term is provided as a command-line argument
    if len(sys.argv) < 2:
        print("Usage: python code.py <search_term>")
        sys.exit(1)

    # Get the search term from the command-line argument
    search_term = " ".join(sys.argv[1:])  # Join all arguments in case of spaces

    # Fetch Wikipedia summary
    wikipedia_data = fetch_wikipedia_summary(search_term)
    print("Done fetching Wikipedia data.")

    if wikipedia_data.startswith("No Wikipedia page found"):
        print(wikipedia_data)
    else:
        system_prompt = (
            "You are an AI assistant that strictly extracts information only from the given Wikipedia data. "
            "Do not use any external knowledge, only rely on the provided text. "
            "If the information is missing, say 'Not enough information provided.' "
            "Your task is to extract exactly 5 common facts about the animal."
        )

        user_query = "List 5 common facts about this animal, using only the provided data. Do not give the animal's name; refer to the animal as 'this animal', treat this as a trivia."

        response = query_gpt4o_mini(system_prompt, user_query, wikipedia_data)

        if response:
            print("\nGPT-4o Mini Response:\n", response)
