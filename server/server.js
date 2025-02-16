const express = require('express');
const path = require('path');
const multer = require('multer');
const dotenv = require('dotenv');
const axios = require('axios');
const FormData = require('form-data');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, '../public')));

/**
 * Upload an image and classify the animal
 */
app.post('/upload-and-get-facts', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
        const buffer = Buffer.from(await blob.arrayBuffer());

        const formData = new FormData();
        formData.append("file", buffer, {
            filename: "image.jpg",
            contentType: req.file.mimetype
        });

        const classificationResponse = await axios.post(
            "https://cuddly-swim-production.up.railway.app/classify-animal",
            formData,
            { headers: { ...formData.getHeaders() } }
        );

        const classifiedAnimal = classificationResponse.data.animal;
        console.log(`Classified Animal: ${classifiedAnimal}`);

        const animalFactsResponse = await axios.get(
            `https://cuddly-swim-production.up.railway.app/animal-facts/${encodeURIComponent(classifiedAnimal)}`
        );

        const animalFacts = animalFactsResponse.data.facts;

        res.json({
            message: 'Image successfully uploaded, classified, and facts retrieved',
            animal: classifiedAnimal,
            facts: animalFacts
        });

    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).json({ error: 'Classification or fact retrieval failed' });
    }
});

/**
 * Serve home page (home.html)
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/home.html'));
});

// Start the server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));