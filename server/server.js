const express = require('express');
const multer = require('multer');
const dotenv = require('dotenv');
const path = require('path');
const classifyAnimalHelper = require('./animal_classifier'); // Import classification function

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure Multer to store files in memory (instead of saving them to disk)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware
app.use(express.static(path.join(__dirname, '../public')));

/**
 * Upload an image and classify the animal (without saving locally)
 */
app.post('/upload', upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    try {
        const imageBuffer = req.file.buffer; // Image as buffer (in memory)
        const classifiedAnimal = await classifyAnimalHelper(imageBuffer); // Pass buffer to classifier

        if (!classifiedAnimal) {
            return res.status(500).json({ error: 'Could not determine the animal' });
        }

        res.json({ 
            message: 'Image successfully uploaded and classified', 
            animal: classifiedAnimal 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Classification failed' });
    }
});

/**
 * Get animal facts from Wikipedia.
 */
app.get('/animal-facts/:animal_name', async (req, res) => {
    const animalName = req.params.animal_name;
    const facts = await getAnimalFacts(animalName);

    if (!facts) {
        return res.status(404).json({ error: `No Wikipedia page found for '${animalName}'` });
    }

    res.json({ animal: animalName, facts });
});

/**
 * Serve home page (`home.html`)
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/home.html'));
});

// Start the server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));