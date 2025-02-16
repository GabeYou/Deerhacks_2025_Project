document.addEventListener("DOMContentLoaded", function() {
    const uploadForm = document.getElementById("upload-form");
    const imageInput = document.getElementById("imageInput");
    const previewImage = document.getElementById("previewImage");
    const resultDiv = document.getElementById("result"); // New result div

    // Handle Image Preview
    imageInput.addEventListener("change", function(event) {
        const file = event.target.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                previewImage.style.display = "block";
            };
            reader.readAsDataURL(file);
        } else {
            previewImage.style.display = "none";
        }
    });

    // Handle Image Upload
    uploadForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        if (!imageInput.files.length) {
            resultDiv.innerText = "Please select an image before uploading.";
            return;
        }

        const formData = new FormData();
        formData.append("image", imageInput.files[0]);

        try {
            const response = await fetch("/upload", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            // Display the result message below the form instead of alerting
            if (response.ok) {
                resultDiv.innerText = `Animal Classified: ${data.animal}`;
            } else {
                resultDiv.innerText = `Error: ${data.error}`;
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            resultDiv.innerText = "An error occurred while uploading the image.";
        }
    });


    const startGameBtn = document.getElementById("start-game");
    const gameContainer = document.getElementById("game-container");
    const factDisplay = document.getElementById("fact-display");
    const imageGrid = document.getElementById("image-grid");

    let correctAnimalImage = "";
    let facts = [];
    let factIndex = 0;

    startGameBtn.addEventListener("click", function () {
        fetch("https://cuddly-swim-production.up.railway.app/trivia-game")
            .then(response => response.json())
            .then(data => {
                // Reset game state
                factIndex = 0;
                facts = data.facts;
                correctAnimalImage = data.correct_animal_image;
                imageGrid.innerHTML = "";

                // Show first fact
                factDisplay.textContent = facts[factIndex];

                // Display all 9 images
                data.image_urls.forEach(imageUrl => {
                    const img = document.createElement("img");
                    img.src = imageUrl;
                    img.classList.add("animal-tile");

                    // Click event for selecting an answer
                    img.addEventListener("click", function () {
                        if (img.src === correctAnimalImage) {
                            factDisplay.textContent = "✅ Correct! You found the right animal!";
                            // Optionally: Disable further clicks
                            imageGrid.querySelectorAll("img").forEach(img => img.style.pointerEvents = "none");
                        } else {
                            img.style.opacity = "0.3"; // Fade out wrong choice
                            img.style.pointerEvents = "none"; // Disable click

                            // Show next fact
                            factIndex++;
                            if (factIndex < facts.length) {
                                factDisplay.textContent = facts[factIndex];
                            } else {
                                factDisplay.textContent = "❌ No more hints! The answer was the correct animal.";
                            }
                        }
                    });

                    imageGrid.appendChild(img);
                });

                gameContainer.style.display = "block";
            })
            .catch(error => console.error("Error fetching trivia game:", error));
    });
});
