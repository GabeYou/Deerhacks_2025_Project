document.addEventListener("DOMContentLoaded", function() {
    const uploadForm = document.getElementById("upload-form");
    const imageInput = document.getElementById("imageInput");
    const previewImage = document.getElementById("previewImage");
    const resultDiv = document.getElementById("result");
    const loadingBar = document.getElementById("loadingBar");
    const animalImageContainer = document.getElementById("animalImageContainer");
    const animalImage = document.getElementById("animalImage");
    const factsContainer = document.getElementById("factsContainer");

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

        // Reset previous results and show loading bar
        resultDiv.innerText = "";
        factsContainer.innerText = "";
        animalImageContainer.style.display = "none";
        loadingBar.style.display = "block"; 

        try {
            // Step 1: Upload Image and Classify Animal
            const response = await fetch("/upload-and-get-facts", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                resultDiv.innerText = `Error: ${data.error}`;
                loadingBar.style.display = "none";
                return;
            }

            // Step 2: Display classified animal
            const classifiedAnimal = data.animal;
            resultDiv.innerText = `Animal Classified: ${classifiedAnimal}`;

            // Fetch and Display Animal Image from Wikipedia
            const wikiImageResponse = await fetch(
                `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(classifiedAnimal)}`
            );
            const wikiData = await wikiImageResponse.json();
            if (wikiData.thumbnail && wikiData.thumbnail.source) {
                animalImage.src = wikiData.thumbnail.source;
                animalImageContainer.style.display = "block";
            }

            // Step 3: Display Facts
            factsContainer.innerText = `Facts:\n${data.facts}`;
            
        } catch (error) {
            console.error("Error processing request:", error);
            resultDiv.innerText = "An error occurred while processing.";
        } finally {
            // Hide loading bar
            loadingBar.style.display = "none";
        }
    });
});