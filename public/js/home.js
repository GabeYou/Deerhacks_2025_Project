document.addEventListener("DOMContentLoaded", function() {
    const uploadForm = document.getElementById("upload-form");
    const imageInput = document.getElementById("imageInput");
    const previewImage = document.getElementById("previewImage");
    const loadingBar = document.getElementById("loadingBar");
    const resultDiv = document.getElementById("result");
    const animalImageContainer = document.getElementById("animalImageContainer");
    const animalImage = document.getElementById("animalImage");
    const factsDropdown = document.getElementById("factsDropdown");
    const toggleFactsBtn = document.getElementById("toggleFactsBtn");
    const factsBox = document.getElementById("factsBox");
    const factsContainer = document.getElementById("factsContainer");

    // Show a preview of the selected image
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

    // Toggle facts dropdown (initially hidden)
    toggleFactsBtn.addEventListener("click", function() {
        if (factsBox.style.display === "none" || factsBox.style.display === "") {
            factsBox.style.display = "block";
            toggleFactsBtn.innerText = "▼ Fun Facts";
        } else {
            factsBox.style.display = "none";
            toggleFactsBtn.innerText = "▶ Fun Facts";
        }
    });

    // Handle the form submission for classification + facts
    uploadForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        if (!imageInput.files.length) {
            resultDiv.innerText = "Please select an image before uploading.";
            return;
        }

        loadingBar.style.display = "block";

        resultDiv.innerText = "";
        animalImageContainer.style.display = "none";
        factsBox.style.display = "none";
        factsDropdown.style.display = "none";

        const formData = new FormData();
        formData.append("image", imageInput.files[0]);

        try {
            const response = await fetch("/upload-and-get-facts", {
                method: "POST",
                body: formData
            });

            loadingBar.style.display = "none";

            const data = await response.json();

            if (!response.ok) {
                resultDiv.innerText = `Error: ${data.error}`;
                return;
            }

            resultDiv.innerText = `Animal Classified: ${data.animal}`;

            const wikiImageResponse = await fetch(
                `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(data.animal)}`
            );
            const wikiData = await wikiImageResponse.json();

            if (wikiData.thumbnail && wikiData.thumbnail.source) {
                animalImage.src = wikiData.thumbnail.source;
                animalImageContainer.style.display = "block";
            }

            if (data.facts) {
                factsContainer.innerHTML = ""; // Clear previous facts

                // Split the facts string into individual fact items
                const factItems = data.facts.split("\n").map(fact => fact.trim()).filter(fact => fact !== "");

                factItems.forEach(fact => {
                    const factDiv = document.createElement("div");
                    factDiv.classList.add("fact-item");
                    factDiv.innerText = fact;
                    factsContainer.appendChild(factDiv);
                });

                factsDropdown.style.display = "block"; // Show the dropdown button
                toggleFactsBtn.innerText = "▶ Fun Facts";
                factsBox.style.display = "none";
            }
        } catch (error) {
            console.error("Error processing request:", error);
            loadingBar.style.display = "none";
            resultDiv.innerText = "An error occurred while processing.";
        }
    });
});