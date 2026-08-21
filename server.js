const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
require('dotenv').config();

const app = express();

app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, 
    max: 20,
    message: { error: 'Занадто багато запитів. Зачекайте хвилину.' }
});

app.use('/api/', limiter);

app.post('/api/generate', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt || prompt.length > 2000) {
            return res.status(400).json({ error: 'Запит порожній або надто довгий.' });
        }

        const apiKey = process.env.GROQ_API_KEY;
        
        if (!apiKey) {
            return res.status(500).json({ error: 'API Key не налаштовано на сервері.' });
        }

        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.1-8b-instant',
                messages: [{ role: 'user', content: prompt }]
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const reply = response.data.choices[0].message.content;
        res.json({ result: reply });

    } catch (error) {
        console.error('Server error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Помилка генерації відповідей. Спробуйте ще раз.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔒 Server running on port ${PORT}`));
