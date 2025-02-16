document.addEventListener("DOMContentLoaded", function () {
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
    const quizSection = document.getElementById("quizSection");
    const quizContainer = document.getElementById("quizContainer");
    const quizForm = document.getElementById("quizForm");
    const quizResult = document.getElementById("quizResult");

    let fakeFactsGlobal = [];

    // Show a preview of the selected image
    imageInput.addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                previewImage.src = e.target.result;
                previewImage.style.display = "block";
            };
            reader.readAsDataURL(file);
        } else {
            previewImage.style.display = "none";
        }
    });

    // Toggle facts dropdown
    toggleFactsBtn.addEventListener("click", function () {
        if (factsBox.style.display === "none" || factsBox.style.display === "") {
            factsBox.style.display = "block";
            toggleFactsBtn.innerText = "▼ Fun Facts";
        } else {
            factsBox.style.display = "none";
            toggleFactsBtn.innerText = "▶ Fun Facts";
        }
    });

    // Handle form submission for classification + facts
    uploadForm.addEventListener("submit", async function (event) {
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
        quizSection.style.display = "none";

        const formData = new FormData();
        formData.append("image", imageInput.files[0]);

        try {
            const response = await fetch("/upload-and-get-facts", {
                method: "POST",
                body: formData,
            });

            loadingBar.style.display = "none";
            const data = await response.json();

            if (!response.ok) {
                resultDiv.innerText = `Error: ${data.error}`;
                return;
            }

            resultDiv.innerText = `Animal Classified: ${data.animal}`;

            // Fetch Wikipedia image
            const wikiImageResponse = await fetch(
                `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(data.animal)}`
            );
            const wikiData = await wikiImageResponse.json();

            if (wikiData.thumbnail && wikiData.thumbnail.source) {
                animalImage.src = wikiData.thumbnail.source;
                animalImageContainer.style.display = "block";
            }

            // Display fun facts
            if (data.facts) {
                factsContainer.innerHTML = ""; // Clear previous facts

                const factItems = data.facts.split("\n").map(fact => fact.trim()).filter(fact => fact !== "");
                factItems.forEach(fact => {
                    const factDiv = document.createElement("div");
                    factDiv.classList.add("fact-item");
                    factDiv.innerText = fact;
                    factsContainer.appendChild(factDiv);
                });

                factsDropdown.style.display = "block";
                toggleFactsBtn.innerText = "▶ Fun Facts";
                factsBox.style.display = "none";
            }

            // Display quiz
            if (data.real_facts && data.fake_facts) {
                quizContainer.innerHTML = ""; // Clear previous quiz data
                fakeFactsGlobal = data.fake_facts;

                // Combine real and fake facts into a single array
                const allFacts = [...data.real_facts, ...data.fake_facts];
                const shuffledFacts = allFacts.sort(() => 0.5 - Math.random()); // Shuffle facts

                shuffledFacts.forEach((fact, index) => {
                    const factItem = document.createElement("div");
                    factItem.classList.add("quiz-item");

                    const checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.name = "fact";
                    checkbox.value = fact;
                    checkbox.id = `fact${index}`;

                    const sanitizedFact = fact.replace(/^\d+\.\s*/, "");

                    const label = document.createElement("label");
                    label.htmlFor = `fact${index}`;
                    label.innerText = sanitizedFact;

                    factItem.appendChild(checkbox);
                    factItem.appendChild(label);
                    quizContainer.appendChild(factItem);
                });

                quizSection.style.display = "block";
                quizResult.innerText = ""; // Reset quiz result
            }
        } catch (error) {
            console.error("Error processing request:", error);
            loadingBar.style.display = "none";
            resultDiv.innerText = "An error occurred while processing.";
        }
    });

    // Handle quiz submission (Prevent multiple event listeners)
    quizForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const selectedFacts = Array.from(document.querySelectorAll('input[name="fact"]:checked')).map(
            (input) => input.value
        );

        if (selectedFacts.length !== 2) {
            quizResult.innerText = "Please select exactly 2 facts.";
            quizResult.style.color = "red";
            return;
        }

        const isCorrect = selectedFacts.every((fact) => fakeFactsGlobal.includes(fact));

        if (isCorrect) {
            quizResult.innerText = "Correct! You spotted the fake facts!";
            quizResult.style.color = "green";
        } else {
            quizResult.innerText = "Incorrect! Try again.";
            quizResult.style.color = "red";
        }
    });
});