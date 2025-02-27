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

        // Különböző stílusokhoz külön AI promptok
        const styles = [
            { type: "Komoly", prompt: `Írj egy részletes, hivatalos és informatív marketing szöveget erről a témáról: ${prompt}`, maxTokens: 1200 },
            { type: "Fun Fact", prompt: `Adj hozzá egy humoros és figyelemfelkeltő érdekes tényt erről a témáról, röviden és fiatalosan: ${prompt}`, maxTokens: 250 },
            { type: "Motiváló", prompt: `Írj egy inspiráló, rövid motivációs szöveget erről a témáról: ${prompt}`, maxTokens: 300 },
            { type: "Fiatalos", prompt: `Fogalmazd meg viccesen, laza és fiatalos nyelvezetben, használj modern szlenget és humoros példákat: ${prompt}`, maxTokens: 300 },
            { type: "Drámai", prompt: `Írj egy drámai és érzelmes rövid szöveget erről a témáról, amely érzelmi reakciót vált ki az olvasóból: ${prompt}`, maxTokens: 350 },
            { type: "Szarkasztikus", prompt: `Írj egy szarkasztikus, csipkelődő szöveget erről a témáról röviden és ütősen: ${prompt}`, maxTokens: 250 },
            { type: "Kreatív", prompt: `Írj egy teljesen egyedi, kreatív rövid szöveget erről a témáról: ${prompt}`, maxTokens: 300 },
            { type: "Tudományos", prompt: `Írj egy tudományos megközelítésű, rövid és lényegretörő szöveget erről a témáról: ${prompt}`, maxTokens: 400 },
            { type: "Közösségi média poszt", prompt: `Írj egy tömör és figyelemfelkeltő közösségi média posztot erről a témáról, emojikkal és hashtagekkel: ${prompt}`, maxTokens: 200 }
        ];

        const variations = await Promise.all(styles.map(async ({ type, prompt, maxTokens }) => {
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-3.5-turbo',
                messages: [{ role: "user", content: prompt }],
                max_tokens: maxTokens,
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                type: type || "Általános", // Ha nincs érték, akkor alapértelmezett címkét adunk
                text: response.data.choices[0].message.content.trim()
            };

        }));

        res.json({ variations });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
