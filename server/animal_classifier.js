const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.API_KEY;
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

const classifyAnimalHelper = async (imageBuffer) => {
    try {
        const base64Image = imageBuffer.toString('base64');

        const payload = {
            model: "gpt-4-turbo",
            messages: [
                { role: "system", content: "You are an AI that identifies animals in images. Respond only with the animal's name and nothing else." },
                { role: "user", content: [
                    { type: "text", text: "What animal is in this image?" },
                    { type: "image_url", image_url: { url: `data:image/png;base64,${base64Image}` } }
                ]}
            ],
            max_tokens: 10
        };

        const headers = { 
            Authorization: `Bearer ${process.env.API_KEY}`, 
            "Content-Type": "application/json" 
        };

        const response = await axios.post(OPENAI_URL, payload, { headers });
        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error("Error classifying animal:", error);
        return null;
    }
};

module.exports = classifyAnimalHelper;