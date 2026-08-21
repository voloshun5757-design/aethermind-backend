const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
require('dotenv').config();

const app = express();

app.use(helmet());
app.use(cors());
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

        // Прямий запит через axios до безкоштовного API
        const response = await axios.get(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`, {
            params: { model: 'mistral' },
            timeout: 10000
        });

        res.json({ result: response.data });

    } catch (error) {
        console.error('Server error details:', error.message);
        res.status(500).json({ error: 'Помилка генерації відповідей. Спробуйте ще раз.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔒 Server running on port ${PORT}`));
