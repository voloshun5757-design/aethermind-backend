const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/generate', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Запит порожній.' });
        }

        const apiKey = process.env.GROQ_API_KEY;
        
        if (!apiKey) {
            return res.status(500).json({ error: 'API ключ не знайдено в налаштуваннях Render.' });
        }

        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.1-8b-instant',
                messages: [{ role: 'user', content: prompt }]
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey.trim()}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const reply = response.data.choices[0].message.content;
        res.json({ result: reply });

    } catch (error) {
        console.error('Помилка Groq API:', error.response ? error.response.data : error.message);
        const errorMessage = error.response?.data?.error?.message || 'Помилка генерації відповідей.';
        res.status(500).json({ error: errorMessage });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔒 Server running on port ${PORT}`));
