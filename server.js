const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Дозволяємо запити з будь-якого сайту (включаючи Netlify)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.post('/api/generate', async (req, res) => {
    try {
        const { prompt } = req.body;
        const apiKey = process.env.OPENAI_API_KEY; // або GROQ_API_KEY

        if (!apiKey) {
            return res.status(500).json({ error: 'API ключ відсутній.' });
        }

        // Запит до OpenAI (або Groq)
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }]
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey.trim()}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({ result: response.data.choices[0].message.content });

    } catch (error) {
        console.error('SERVER ERROR:', error.response ? error.response.data : error.message);
        res.status(500).json({ 
            error: error.response?.data?.error?.message || 'Помилка виконання запиту на сервері.' 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
