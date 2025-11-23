import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import bot from './bot.js';

const app = express();

app.use(express.json());
app.use(cors());

// Функция задержки между отправками (в миллисекундах)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Задержка между сообщениями (50 мс = безопасная частота ~20 сообщений/сек)
// Telegram позволяет до 30 сообщений/сек, но лучше быть консервативнее
const DELAY_BETWEEN_MESSAGES = 50;

app.post('/api/bot/broadcast', async (req, res) => {
    try {
        const { text, telegramIds } = req.body;
        
        // Валидация входных данных
        if (!text || !telegramIds || !Array.isArray(telegramIds)) {
            return res.status(400).json({ 
                error: 'Необходимо предоставить text (текст сообщения) и telegramIds (массив ID пользователей)' 
            });
        }

        if (telegramIds.length === 0) {
            return res.status(400).json({ 
                error: 'Список telegramIds не может быть пустым' 
            });
        }

        // Используем переданную задержку или значение по умолчанию
        const messageDelay = DELAY_BETWEEN_MESSAGES;

        // Отправка сообщений всем пользователям
        const results = {
            success: [],
            failed: []
        };

        for (let i = 0; i < telegramIds.length; i++) {
            const telegramId = telegramIds[i];
            try {
                await bot.telegram.sendMessage(telegramId, text);
                results.success.push(telegramId);
                
                // Добавляем задержку между сообщениями (кроме последнего)
                if (i < telegramIds.length - 1) {
                    await delay(messageDelay);
                }
            } catch (error) {
                console.error(`Ошибка отправки сообщения пользователю ${telegramId}:`, error.message);
                
                // Если это ошибка rate limit, добавляем дополнительную задержку
                if (error.response?.error_code === 429 || error.message.includes('Too Many Requests')) {
                    console.log('Обнаружен rate limit, добавляем дополнительную задержку...');
                    await delay(1000); // Задержка 1 секунда при rate limit
                }
                
                results.failed.push({
                    telegramId,
                    error: error.message
                });
            }
        }

        res.status(200).json({
            message: 'Рассылка завершена',
            total: telegramIds.length,
            success: results.success.length,
            failed: results.failed.length,
            results
        });
    } catch (error) {
        console.error('Ошибка при выполнении рассылки:', error);
        res.status(500).json({ 
            error: 'Внутренняя ошибка сервера',
            message: error.message 
        });
    }
});

// Запускаем бота при старте сервера
bot.launch().then(() => {
    console.log('Telegram bot started');
}).catch((error) => {
    console.error('Error starting bot:', error);
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});