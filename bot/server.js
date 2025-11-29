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

// Функция для конвертации HTML в текст для Telegram
const htmlToTelegramText = (html) => {
    if (!html) return '';
    
    // Удаляем HTML теги и заменяем их на текстовые эквиваленты
    let text = html
        .replace(/<br\s*\/?>/gi, '\n') // <br> -> новая строка
        .replace(/<\/p>/gi, '\n\n') // </p> -> двойная новая строка
        .replace(/<p>/gi, '') // <p> -> удаляем
        .replace(/<\/div>/gi, '\n') // </div> -> новая строка
        .replace(/<div[^>]*>/gi, '') // <div> -> удаляем
        .replace(/<strong>(.*?)<\/strong>/gi, '*$1*') // <strong> -> жирный текст
        .replace(/<b>(.*?)<\/b>/gi, '*$1*') // <b> -> жирный текст
        .replace(/<em>(.*?)<\/em>/gi, '_$1_') // <em> -> курсив
        .replace(/<i>(.*?)<\/i>/gi, '_$1_') // <i> -> курсив
        .replace(/<u>(.*?)<\/u>/gi, '__$1__') // <u> -> подчеркивание
        .replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, '$2 ($1)') // <a> -> текст (ссылка)
        .replace(/<[^>]+>/g, '') // Удаляем все остальные HTML теги
        .replace(/&nbsp;/g, ' ') // &nbsp; -> пробел
        .replace(/&amp;/g, '&') // &amp; -> &
        .replace(/&lt;/g, '<') // &lt; -> <
        .replace(/&gt;/g, '>') // &gt; -> >
        .replace(/&quot;/g, '"') // &quot; -> "
        .replace(/&#39;/g, "'") // &#39; -> '
        .replace(/\n\s*\n\s*\n/g, '\n\n') // Убираем лишние пустые строки
        .trim();
    
    return text;
};

app.post('/api/bot/broadcast', async (req, res) => {
    try {
        const { text, telegramIds, parseMode } = req.body;
        
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

        // Определяем режим парсинга (HTML, Markdown или текст)
        const parse_mode = parseMode || 'HTML';
        
        // Если режим HTML, но текст содержит HTML теги, используем HTML парсинг
        // Иначе конвертируем HTML в текст
        let messageText = text;
        let finalParseMode = parse_mode;
        
        if (parse_mode === 'HTML' && /<[^>]+>/.test(text)) {
            // Текст содержит HTML теги, используем HTML парсинг
            finalParseMode = 'HTML';
        } else if (parse_mode === 'HTML') {
            // HTML режим, но тегов нет - используем текст
            finalParseMode = undefined;
        } else if (parse_mode === 'Markdown') {
            finalParseMode = 'Markdown';
        } else {
            // Текстовый режим - конвертируем HTML в текст
            messageText = htmlToTelegramText(text);
            finalParseMode = undefined;
        }

        // Используем переданную задержку или значение по умолчанию
        const messageDelay = DELAY_BETWEEN_MESSAGES;

        // Отправка сообщений всем пользователям
        const results = {
            success: [],
            failed: []
        };

        console.log(`Начинаем рассылку для ${telegramIds.length} пользователей. Режим парсинга: ${finalParseMode || 'текст'}`);

        for (let i = 0; i < telegramIds.length; i++) {
            const telegramId = telegramIds[i];
            try {
                // Отправляем сообщение с поддержкой HTML разметки
                await bot.telegram.sendMessage(telegramId, messageText, {
                    parse_mode: finalParseMode
                });
                
                results.success.push(telegramId);
                
                // Добавляем задержку между сообщениями (кроме последнего)
                if (i < telegramIds.length - 1) {
                    await delay(messageDelay);
                }
            } catch (error) {
                const errorMessage = error.response?.description || error.message || 'Неизвестная ошибка';
                const errorCode = error.response?.error_code;
                
                console.error(`Ошибка отправки сообщения пользователю ${telegramId}:`, errorMessage);
                
                // Если это ошибка rate limit, добавляем дополнительную задержку
                if (errorCode === 429 || errorMessage.includes('Too Many Requests')) {
                    console.log('Обнаружен rate limit, добавляем дополнительную задержку...');
                    await delay(1000); // Задержка 1 секунда при rate limit
                }
                
                // Если пользователь заблокировал бота или не найден, не добавляем большую задержку
                if (errorCode === 403 || errorCode === 400) {
                    // Пользователь заблокировал бота или неверный chat_id
                    console.log(`Пользователь ${telegramId} заблокировал бота или не найден`);
                }
                
                results.failed.push({
                    telegramId,
                    error: errorMessage,
                    errorCode: errorCode
                });
            }
        }

        console.log(`Рассылка завершена. Успешно: ${results.success.length}, Ошибок: ${results.failed.length}`);

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