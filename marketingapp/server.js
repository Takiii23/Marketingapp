// server.js - Fő backend alkalmazás
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// OpenAI API az AI-alapú marketing szöveg generálásához
app.post('/generate-text', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: "Adj meg egy promptot!" });
        }

        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [{ role: "user", content: `Fogalmazd meg röviden, fiatalosan, viccesen: ${prompt}` }],
            max_tokens: 500,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({ text: response.data.choices[0].message.content.trim() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Unsplash API az élethű képek keresésére
app.get('/search-image', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ error: "Adj meg egy keresési kulcsszót!" });
        }

        const response = await axios.get(`https://api.unsplash.com/search/photos`, {
            params: { query, per_page: 1 },
            headers: { 'Authorization': `Client-ID ${process.env.UNSPLASH_API_KEY}` }
        });
        res.json({ imageUrl: response.data.results[0]?.urls?.regular || null });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// "Jó tudni" érdekességek generálása
app.get('/fun-fact', async (req, res) => {
    try {
        const { location } = req.query;
        if (!location) {
            return res.status(400).json({ error: "Adj meg egy helyszínt!" });
        }

        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: `Adj egy rövid, fiatalos, humoros tényt erről a helyszínről: ${location}` }],
            max_tokens: 100,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        res.json({ fact: response.data.choices[0].message.content.trim() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// TikTok videó generálás alapja (AI szöveg + kép)
app.post('/generate-tiktok-video', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: "Adj meg egy témát a TikTok videóhoz!" });
        }

        const textResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [{ role: "user", content: `Írj egy rövid TikTok videó szöveget a következő témában, fiatalosan és viccesen: ${prompt}` }],
            max_tokens: 150,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const imageResponse = await axios.get(`https://api.unsplash.com/search/photos`, {
            params: { query: prompt, per_page: 1 },
            headers: { 'Authorization': `Client-ID ${process.env.UNSPLASH_API_KEY}` }
        });

        res.json({
            text: textResponse.data.choices[0].message.content.trim(),
            imageUrl: imageResponse.data.results[0]?.urls?.regular || null
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
