document.addEventListener("DOMContentLoaded", function() {
    const uploadForm = document.getElementById("upload-form");
    const imageInput = document.getElementById("imageInput");
    const previewImage = document.getElementById("previewImage");

    imageInput.addEventListener("change", function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                previewImage.style.display = "block";
            };
            reader.readAsDataURL(file);
        }
    });

    uploadForm.addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent form from reloading the page

        const formData = new FormData();
        formData.append("image", imageInput.files[0]);

        fetch("/upload", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            console.log("File saved at:", data.filePath);
        })
        .catch(error => {
            console.error("Error uploading image:", error);
        });
    });
});