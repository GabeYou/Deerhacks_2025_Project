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
            resultDiv.innerText = `Animal Classified: ${data.animal}`;

            // Fetch Wikipedia image
            const wikiImageResponse = await fetch(
                `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(data.animal)}`
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
const pokedexBtn = document.getElementById("pokedex-btn");
const pokedexModal = document.getElementById("pokedex-modal");
const closeModal = document.querySelector(".close-btn");
const pokedexList = document.getElementById("pokedex-list");
const pokedexEntry = document.getElementById("pokedex-entry");
const backBtn = document.getElementById("back-btn");
const animalName = document.getElementById("animal-name");
const animalPhoto = document.getElementById("animal-photo");
const animalFacts = document.getElementById("animal-facts");

// Sample Collected Animals
const collectedAnimals = [
    { name: "Red Fox", image: "https://example.com/redfox.jpg", facts: "Red foxes are highly adaptable." },
    { name: "Bald Eagle", image: "https://example.com/baldeagle.jpg", facts: "Bald eagles have a wingspan of 7 feet." }
];

// Open Pokedex
pokedexBtn.addEventListener("click", () => {
    pokedexModal.style.display = "flex";
    displayPokedex();
});

// Close Pokedex
closeModal.addEventListener("click", () => {
    pokedexModal.style.display = "none";
    pokedexEntry.classList.add("hidden");
});

// Display Pokedex List
function displayPokedex() {
    pokedexList.innerHTML = ""; // Clear previous list
    collectedAnimals.forEach((animal, index) => {
        const entry = document.createElement("div");
        entry.textContent = animal.name;
        entry.classList.add("pokedex-item");
        entry.style.cursor = "pointer";
        entry.style.padding = "10px";
        entry.style.border = "1px solid black";
        entry.style.borderRadius = "5px";
        entry.addEventListener("click", () => showAnimalEntry(index));
        pokedexList.appendChild(entry);
    });
}

// Get Pokedex title and list container
const pokedexTitle = document.querySelector("#pokedex-modal h2");

function showAnimalEntry(index) {
    const animal = collectedAnimals[index];

    // Hide Pokedex title and list
    pokedexTitle.style.display = "none";
    pokedexList.style.display = "none";

    // Show the selected animal entry
    animalName.textContent = animal.name;
    animalPhoto.src = animal.image;
    animalFacts.textContent = animal.facts;

    pokedexEntry.classList.remove("hidden");
}


// Back to List
backBtn.addEventListener("click", () => {
    pokedexEntry.classList.add("hidden");

    // Show Pokedex title and list again
    pokedexTitle.style.display = "block";
    pokedexList.style.display = "block";
});

document.addEventListener("DOMContentLoaded", function () {
    const loginBtn = document.querySelector(".login-btn");
    const loginModal = document.getElementById("login-modal");
    const closeModal = document.querySelector("#login-modal .close-btn");
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const switchToRegister = document.getElementById("switch-to-register");
    const switchToLogin = document.getElementById("switch-to-login");
    const modalTitle = document.getElementById("modal-title");
    const loginMessage = document.getElementById("login-message");

    loginBtn.addEventListener("click", () => {
        loginModal.style.display = "flex";
        loginForm.style.display = "block";
        registerForm.style.display = "none";
        modalTitle.innerText = "Login";
        loginMessage.innerText = "";
    });

    closeModal.addEventListener("click", () => {
        loginModal.style.display = "none";
    });

    window.addEventListener("click", (event) => {
        if (event.target === loginModal) {
            loginModal.style.display = "none";
        }
    });

    switchToRegister.addEventListener("click", (event) => {
        event.preventDefault();
        loginForm.style.display = "none";
        registerForm.style.display = "block";
        modalTitle.innerText = "Register";
        loginMessage.innerText = "";
    });

    switchToLogin.addEventListener("click", (event) => {
        event.preventDefault();
        registerForm.style.display = "none";
        loginForm.style.display = "block";
        modalTitle.innerText = "Login";
        loginMessage.innerText = "";
    });

    registerForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const username = document.getElementById("register-username").value.trim();
        const password = document.getElementById("register-password").value.trim();

        if (localStorage.getItem(username)) {
            loginMessage.innerText = "Username already exists!";
            loginMessage.style.color = "red";
        } else {
            localStorage.setItem(username, password);
            loginMessage.innerText = "Registration successful. You can now log in.";
            loginMessage.style.color = "green";

            setTimeout(() => {
                registerForm.style.display = "none";
                loginForm.style.display = "block";
                modalTitle.innerText = "Login";
                loginMessage.innerText = "";
            }, 1500);
        }
    });

    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const username = document.getElementById("login-username").value.trim();
        const password = document.getElementById("login-password").value.trim();

        if (localStorage.getItem(username) === password) {
            loginMessage.innerText = "Login successful.";
            loginMessage.style.color = "green";

            setTimeout(() => {
                loginModal.style.display = "none";
            }, 1000);
        } else {
            loginMessage.innerText = "Invalid username or password.";
            loginMessage.style.color = "red";
        }
    });
});