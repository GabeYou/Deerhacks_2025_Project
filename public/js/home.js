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
});
