const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Повне розблокування CORS для всіх методів та джерел
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Явна обробка Preflight (OPTIONS) запитів від браузера
app.options('*', cors());

app.use(express.json());

// Головний ендпоінт генерації
app.post('/api/generate', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        // Підтримує і OPENAI_API_KEY, і GROQ_API_KEY
        const apiKey = process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'API-ключ не налаштовано в Environment Variables на Render.' });
        }

        // Запит до OpenAI (якщо використовуєте Groq — замініть URL та модель)
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
            error: error.response?.data?.error?.message || 'Помилка під час генерації відповіді.' 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
