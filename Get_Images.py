import json
import requests
from bs4 import BeautifulSoup
import time

# Load the animal data from Animals.json
with open("Animals.json", "r", encoding="utf-8") as file:
    data = json.load(file)

def get_high_res_image_url(animal_name):
    """Searches Google Images for large format images and returns the first result."""
    search_url = f"https://www.google.com/search?tbm=isch&tbs=isz:l&q={animal_name.replace(' ', '+')}"
    headers = {"User-Agent": "Mozilla/5.0"}
    
    response = requests.get(search_url, headers=headers)
    if response.status_code != 200:
        print(f"Failed to fetch results for {animal_name}")
        return None

    soup = BeautifulSoup(response.text, "html.parser")
    img_tags = soup.find_all("img")

    # Google often includes a placeholder image first, so real images start from index 1
    for img in img_tags[1:]:
        img_url = img.get("src") or img.get("data-src")
        if img_url:
            return img_url

    return None

# Iterate through animals and fetch high-res images
for animal in data["animals"]:
    # print(f"Fetching image for {animal['animal']}...")
    image_url = get_high_res_image_url(animal["animal"] + " animal")
    if image_url:
        animal["image_url"] = image_url
    time.sleep(3)  # Adding delay to avoid being blocked by Google

# Save updated data
with open("Animals.json", "w", encoding="utf-8") as file:
    json.dump(data, file, indent=4)

