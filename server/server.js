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
app.post('/upload', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        // Requires Node.js v18+
        const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
        const buffer = Buffer.from(await blob.arrayBuffer());

        const formData = new FormData();
        formData.append("file", buffer, {
            filename: "image.jpg",
            contentType: req.file.mimetype
        });

        const externalAPIResponse = await axios.post(
            "https://cuddly-swim-production.up.railway.app/classify-animal",
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                }
            }
        );
        const classifiedAnimal = externalAPIResponse.data.animal;

        res.json({ 
            message: 'Image successfully uploaded and classified', 
            animal: classifiedAnimal 
        });
    } catch (error) {
        console.error("Error classifying image:", error);
        res.status(500).json({ error: 'Classification failed' });
    }
});

/**
 * Serve home page (`home.html`)
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/home.html'));
});

// Start the server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));