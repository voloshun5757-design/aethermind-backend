const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// 1. HTTP-безпека
app.use(helmet());

// 2. CORS (налаштуйте домен після розгортання)
app.use(cors());

app.use(express.json());

// 3. Обмеження запитів (Rate Limit)
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, 
    max: 15,
    message: { error: 'Занадто багато запитів. Спробуйте через хвилину.' }
});

app.use('/api/', limiter);

// 4. Захищений API роут
app.post('/api/generate', async (req, res) => {
    try {
        const { prompt, model } = req.body;

        if (!prompt || prompt.length > 2000) {
            return res.status(400).json({ error: 'Запит надто довгий або порожній.' });
        }

        // Автоматичне фоллбек-з'єднання з безкоштовним API
        const response = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: 'Ти — AetherMind AI Pro, преміальний інтелектуальний помічник.' },
                    { role: 'user', content: prompt }
                ],
                model: model === 'claude-3-5' ? 'claude' : 'openai'
            })
        });

        const text = await response.text();
        res.json({ result: text });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Помилка сервера. Спробуйте пізніше.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔒 AetherMind Secure Server running on port ${PORT}`));