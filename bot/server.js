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

// Функция для очистки HTML от недопустимых тегов Telegram
// Telegram поддерживает только: <b>, <strong>, <i>, <em>, <u>, <ins>, <s>, <strike>, <del>, <a>, <code>, <pre>, <span class="tg-spoiler">
const cleanTelegramHTML = (html) => {
    if (!html) return '';
    
    let cleaned = html;
    
    // Сначала сохраняем правильные <span class="tg-spoiler">, заменяя их временным маркером
    const spoilerPlaceholders = [];
    // Более точное регулярное выражение для поиска spoiler тегов
    cleaned = cleaned.replace(/<span\s+class\s*=\s*["']tg-spoiler["'][^>]*>(.*?)<\/span>/gis, (match, content) => {
        const placeholder = `__SPOILER_${spoilerPlaceholders.length}__`;
        spoilerPlaceholders.push(`<span class="tg-spoiler">${content}</span>`);
        return placeholder;
    });
    
    // Удаляем ВСЕ остальные <span> теги (включая вложенные и с другими атрибутами)
    // Используем более агрессивный подход - удаляем все <span> и </span>, кроме уже сохраненных spoiler
    // Повторяем несколько раз для надежности (на случай вложенных тегов)
    for (let i = 0; i < 5; i++) {
        cleaned = cleaned.replace(/<span[^>]*>(.*?)<\/span>/gis, '$1'); // Удаляем парные <span>...</span>
    }
    cleaned = cleaned.replace(/<span[^>]*>/gi, ''); // Удаляем все оставшиеся открывающие <span>
    cleaned = cleaned.replace(/<\/span>/gi, ''); // Удаляем все оставшиеся закрывающие </span>
    
    // Восстанавливаем правильные spoiler теги
    spoilerPlaceholders.forEach((spoiler, index) => {
        cleaned = cleaned.replace(`__SPOILER_${index}__`, spoiler);
    });
    
    // Удаляем другие недопустимые теги
    cleaned = cleaned
        .replace(/<div[^>]*>/gi, '') // <div> -> удаляем
        .replace(/<\/div>/gi, '\n') // </div> -> новая строка
        .replace(/<p[^>]*>/gi, '') // <p> -> удаляем
        .replace(/<\/p>/gi, '\n\n') // </p> -> двойная новая строка
        .replace(/<br\s*\/?>/gi, '\n') // <br> -> новая строка
        // Удаляем все остальные недопустимые теги (кроме разрешенных Telegram)
        // Разрешенные: b, strong, i, em, u, ins, s, strike, del, a, code, pre, span (только с class="tg-spoiler")
        .replace(/<(?!\/?(?:b|strong|i|em|u|ins|s|strike|del|a|code|pre|span)\b)[^>]+>/gi, '')
        // Нормализуем пробелы
        .replace(/&nbsp;/g, ' ') // &nbsp; -> пробел
        .replace(/\n\s*\n\s*\n/g, '\n\n') // Убираем лишние пустые строки
        .trim();
    
    return cleaned;
};

// Получаем ID группы и канала из переменных окружения
const CHANNEL_ID = process.env.CHANNEL_ID;
const GROUP_ID = process.env.GROUP_ID;

// Функция для добавления пользователя в группу или канал
const addUserToChat = async (chatId, userId) => {
    try {
        // 1. Сначала разбаниваем пользователя, если он был забанен
        try {
            await bot.telegram.unbanChatMember(chatId, userId, {
                only_if_banned: true
            });
            console.log(`Пользователь ${userId} разбанен в чате ${chatId}`);
        } catch (unbanError) {
            // Это нормально, если пользователь не был забанен
            if (!unbanError.response?.description?.includes('not found')) {
                console.log(`Пользователь ${userId} не был забанен в чате ${chatId}`);
            }
        }
        
        // 2. Проверяем, является ли пользователь уже участником
        try {
            const member = await bot.telegram.getChatMember(chatId, userId);
            if (member && ['member', 'administrator', 'creator'].includes(member.status)) {
                return { 
                    success: true, 
                    message: 'Пользователь уже является участником',
                    alreadyMember: true
                };
            }
        } catch (memberError) {
            // Пользователь не является участником, продолжаем
            console.log(`Пользователь ${userId} не является участником ${chatId}`);
        }
        
        // 3. Создаем одноразовую пригласительную ссылку
        const inviteLink = await bot.telegram.createChatInviteLink(chatId, {
            member_limit: 1, // Одноразовая ссылка
        });
        
        console.log(`Создана пригласительная ссылка для пользователя ${userId}: ${inviteLink.invite_link}`);
        
        // 4. Отправляем пригласительную ссылку пользователю в личку
        try {
            await bot.telegram.sendMessage(userId, 
                `🎉 Вам открыт доступ к закрытым материалам!\n\n` +
                `📌 Присоединяйтесь к нашему сообществу по ссылке ниже:\n\n` +
                `${inviteLink.invite_link}\n\n` +
                `⏰ Ссылка действует 1 час.`,
                {
                    reply_markup: {
                        inline_keyboard: [[
                            {
                                text: '🔗 Присоединиться',
                                url: inviteLink.invite_link
                            }
                        ]]
                    }
                }
            );
            
            return { 
                success: true, 
                message: 'Пригласительная ссылка отправлена пользователю',
                inviteLink: inviteLink.invite_link
            };
        } catch (sendError) {
            // Если не удалось отправить в личку, возвращаем ссылку
            console.error(`Не удалось отправить ссылку пользователю ${userId}:`, sendError.message);
            return { 
                success: true, 
                message: 'Пригласительная ссылка создана, но не удалось отправить в личку',
                inviteLink: inviteLink.invite_link,
                warning: 'Пользователь заблокировал бота или не начал диалог'
            };
        }
    } catch (error) {
        const errorMessage = error.response?.description || error.message || 'Неизвестная ошибка';
        const errorCode = error.response?.error_code;
        
        console.error(`Ошибка добавления пользователя ${userId} в чат ${chatId}:`, errorMessage);
        return { 
            success: false, 
            error: errorMessage, 
            errorCode,
            details: 'Проверьте, что бот является администратором в группе/канале с правами на создание пригласительных ссылок'
        };
    }
};

// Функция для удаления пользователя из группы или канала
const removeUserFromChat = async (chatId, userId) => {
    try {
        // 1. Проверяем, является ли пользователь участником
        try {
            const member = await bot.telegram.getChatMember(chatId, userId);
            if (member && ['left', 'kicked'].includes(member.status)) {
                return { 
                    success: true, 
                    message: 'Пользователь уже не является участником',
                    alreadyRemoved: true
                };
            }
        } catch (memberError) {
            // Пользователь не найден - уже не участник
            return { 
                success: true, 
                message: 'Пользователь не является участником',
                alreadyRemoved: true
            };
        }
        
        // 2. Баним пользователя (это удаляет его из группы/канала)
        await bot.telegram.banChatMember(chatId, userId);
        console.log(`Пользователь ${userId} забанен (удален) из чата ${chatId}`);
        
        // 3. Сразу разбаниваем, чтобы пользователь мог вернуться позже по новой ссылке
        // Но он уже будет удален из группы/канала
        await bot.telegram.unbanChatMember(chatId, userId);
        console.log(`Пользователь ${userId} разбанен (может вернуться по ссылке) в чате ${chatId}`);
        
        // 4. Уведомляем пользователя о завершении подписки (опционально)
        try {
            await bot.telegram.sendMessage(userId, 
                `⏰ Ваша подписка завершена.\n\n` +
                `Вы были удалены из закрытых групп и каналов.\n\n` +
                `Для возобновления доступа, пожалуйста, продлите подписку.`
            );
        } catch (sendError) {
            // Если не удалось отправить уведомление, это не критично
            console.log(`Не удалось отправить уведомление пользователю ${userId}:`, sendError.message);
        }
        
        return { 
            success: true, 
            message: 'Пользователь успешно удален',
            notified: true
        };
    } catch (error) {
        const errorMessage = error.response?.description || error.message || 'Неизвестная ошибка';
        const errorCode = error.response?.error_code;
        
        // Если пользователь не в группе/канале, это не ошибка
        if (errorMessage.includes('not a member') || errorMessage.includes('not in the chat') || errorMessage.includes('USER_NOT_PARTICIPANT')) {
            return { 
                success: true, 
                message: 'Пользователь не является участником',
                alreadyRemoved: true
            };
        }
        
        console.error(`Ошибка удаления пользователя ${userId} из чата ${chatId}:`, errorMessage);
        return { 
            success: false, 
            error: errorMessage, 
            errorCode,
            details: 'Проверьте, что бот является администратором в группе/канале с правами на удаление пользователей'
        };
    }
};

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
        .replace(/<span[^>]*>(.*?)<\/span>/gi, '$1') // <span> -> удаляем, оставляем содержимое
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
        const { text, telegramIds, parseMode, imageUrl, buttonText, buttonUrl, usersData } = req.body;
        
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

        // Проверяем соответствие количества usersData и telegramIds
        if (usersData && usersData.length !== telegramIds.length) {
            console.warn('Количество usersData не соответствует количеству telegramIds');
        }

        // Определяем режим парсинга (HTML, Markdown или текст)
        const parse_mode = parseMode || 'HTML';
        
        // Если режим HTML, но текст содержит HTML теги, используем HTML парсинг
        // Иначе конвертируем HTML в текст
        let messageText = text;
        let finalParseMode = parse_mode;
        
        if (parse_mode === 'HTML' && /<[^>]+>/.test(text)) {
            // Текст содержит HTML теги, очищаем от недопустимых тегов Telegram
            messageText = cleanTelegramHTML(text);
            
            // Дополнительная проверка: если после очистки все еще есть <span> без tg-spoiler, удаляем их
            // Это защита на случай, если регулярное выражение пропустило какие-то теги
            if (/<span(?!\s+class=["']tg-spoiler["'])[^>]*>/i.test(messageText)) {
                console.warn('Обнаружены <span> теги без tg-spoiler после очистки, выполняем дополнительную очистку');
                messageText = messageText.replace(/<span(?!\s+class=["']tg-spoiler["'])[^>]*>/gi, '');
                messageText = messageText.replace(/<\/span>/gi, '');
            }
            
            console.log('Очищенный HTML (первые 200 символов):', messageText.substring(0, 200)); // Логируем для отладки
            finalParseMode = 'HTML';
        } else if (parse_mode === 'HTML') {
            // HTML режим, но тегов нет - используем текст
            finalParseMode = undefined;
        } else if (parse_mode === 'Markdown') {
            // Для Markdown конвертируем HTML в Markdown формат
            // Сначала конвертируем HTML теги в Markdown синтаксис
            messageText = text
                .replace(/<br\s*\/?>/gi, '\n') // <br> -> новая строка
                .replace(/<\/p>/gi, '\n\n') // </p> -> двойная новая строка
                .replace(/<p>/gi, '') // <p> -> удаляем
                .replace(/<\/div>/gi, '\n') // </div> -> новая строка
                .replace(/<div[^>]*>/gi, '') // <div> -> удаляем
                .replace(/<span[^>]*>(.*?)<\/span>/gi, '$1') // <span> -> удаляем
                .replace(/<strong>(.*?)<\/strong>/gi, '*$1*') // <strong> -> жирный текст
                .replace(/<b>(.*?)<\/b>/gi, '*$1*') // <b> -> жирный текст
                .replace(/<em>(.*?)<\/em>/gi, '_$1_') // <em> -> курсив
                .replace(/<i>(.*?)<\/i>/gi, '_$1_') // <i> -> курсив
                .replace(/<u>(.*?)<\/u>/gi, '__$1__') // <u> -> подчеркивание
                .replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)') // <a> -> Markdown ссылка
                .replace(/<code>(.*?)<\/code>/gi, '`$1`') // <code> -> код
                .replace(/<pre>(.*?)<\/pre>/gis, '```\n$1\n```') // <pre> -> блок кода
                .replace(/<[^>]+>/g, '') // Удаляем все остальные HTML теги
                .replace(/&nbsp;/g, ' ') // &nbsp; -> пробел
                .replace(/&amp;/g, '&') // &amp; -> &
                .replace(/&lt;/g, '<') // &lt; -> <
                .replace(/&gt;/g, '>') // &gt; -> >
                .replace(/&quot;/g, '"') // &quot; -> "
                .replace(/&#39;/g, "'") // &#39; -> '
                .replace(/\n\s*\n\s*\n/g, '\n\n') // Убираем лишние пустые строки
                .trim();
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
        if (imageUrl) {
            console.log('Будет отправлено изображение:', imageUrl);
        }
        if (buttonText && buttonUrl) {
            console.log('Будет добавлена inline кнопка:', buttonText);
        }

        // Функция для формирования URL кнопки с базовым URL и параметрами
        const buildButtonUrl = (userData) => {
            if (!userData) return 'https://kulzhabay.kz/';
            
            const baseUrl = 'https://kulzhabay.kz/';
            const params = new URLSearchParams();
            
            // Всегда добавляем telegramId
            if (userData.telegramId) {
                params.append('telegramId', userData.telegramId);
            }
            
            // Добавляем profilePhotoUrl только если он не пустой
            if (userData.profilePhotoUrl && userData.profilePhotoUrl.trim() !== '') {
                params.append('profilePhotoUrl', userData.profilePhotoUrl);
            }
            
            // Формируем финальный URL с параметрами
            return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
        };

        for (let i = 0; i < telegramIds.length; i++) {
            const telegramId = telegramIds[i];
            const userData = usersData && usersData[i] ? usersData[i] : { telegramId, telegramUserName: '', profilePhotoUrl: '' };
            
            try {
                // Формируем опции для отправки сообщения
                const messageOptions = {
                    parse_mode: finalParseMode
                };

                // Добавляем inline кнопку, если указан текст
                if (buttonText) {
                    const finalButtonUrl = buildButtonUrl(userData);
                    messageOptions.reply_markup = {
                        inline_keyboard: [[
                            {
                                text: buttonText,
                                web_app: {
                                    url: finalButtonUrl
                                }
                            }
                        ]]
                    };
                }

                // Если есть изображение, отправляем фото с подписью
                if (imageUrl) {
                    // Формируем полный URL изображения
                    // Если URL уже полный (начинается с http/https), используем как есть
                    // Иначе добавляем базовый URL API сервера
                    const API_BASE_URL = process.env.API_URL || process.env.BOT_API_URL || 'http://localhost:3002';
                    const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${API_BASE_URL}${imageUrl}`;
                    
                    console.log(`Отправка фото пользователю ${telegramId}, URL: ${fullImageUrl}`);
                    
                    await bot.telegram.sendPhoto(telegramId, fullImageUrl, {
                        caption: messageText,
                        parse_mode: finalParseMode,
                        ...(messageOptions.reply_markup && { reply_markup: messageOptions.reply_markup })
                    });
                } else {
                    // Отправляем обычное текстовое сообщение
                    await bot.telegram.sendMessage(telegramId, messageText, messageOptions);
                }
                
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

// API эндпоинт для добавления пользователя в группу и канал
app.post('/api/bot/add-user', async (req, res) => {
    try {
        const { telegramId } = req.body;
        
        if (!telegramId) {
            return res.status(400).json({
                success: false,
                error: 'Необходимо предоставить telegramId'
            });
        }

        const results = {
            channel: null,
            group: null
        };

        // Добавляем в канал, если указан
        if (CHANNEL_ID) {
            try {
                results.channel = await addUserToChat(CHANNEL_ID, parseInt(telegramId));
            } catch (error) {
                console.error(`Ошибка добавления в канал ${CHANNEL_ID}:`, error);
                results.channel = {
                    success: false,
                    error: error.message || 'Неизвестная ошибка'
                };
            }
        } else {
            results.channel = {
                success: false,
                error: 'CHANNEL_ID не указан в переменных окружения'
            };
        }

        // Добавляем в группу, если указана
        if (GROUP_ID) {
            try {
                results.group = await addUserToChat(GROUP_ID, parseInt(telegramId));
            } catch (error) {
                console.error(`Ошибка добавления в группу ${GROUP_ID}:`, error);
                results.group = {
                    success: false,
                    error: error.message || 'Неизвестная ошибка'
                };
            }
        } else {
            results.group = {
                success: false,
                error: 'GROUP_ID не указан в переменных окружения'
            };
        }

        const allSuccess = results.channel?.success && results.group?.success;
        const hasErrors = !results.channel?.success || !results.group?.success;

        res.status(allSuccess ? 200 : (hasErrors ? 207 : 200)).json({
            success: allSuccess,
            message: allSuccess 
                ? 'Пользователь успешно добавлен в группу и канал'
                : 'Частичное выполнение операции',
            results
        });
    } catch (error) {
        console.error('Ошибка при добавлении пользователя:', error);
        res.status(500).json({
            success: false,
            error: 'Внутренняя ошибка сервера',
            message: error.message
        });
    }
});

// API эндпоинт для удаления пользователя из группы и канала
app.post('/api/bot/remove-user', async (req, res) => {
    try {
        const { telegramId } = req.body;
        
        if (!telegramId) {
            return res.status(400).json({
                success: false,
                error: 'Необходимо предоставить telegramId'
            });
        }

        const results = {
            channel: null,
            group: null
        };

        // Удаляем из канала, если указан
        if (CHANNEL_ID) {
            try {
                results.channel = await removeUserFromChat(CHANNEL_ID, parseInt(telegramId));
            } catch (error) {
                console.error(`Ошибка удаления из канала ${CHANNEL_ID}:`, error);
                results.channel = {
                    success: false,
                    error: error.message || 'Неизвестная ошибка'
                };
            }
        } else {
            results.channel = {
                success: false,
                error: 'CHANNEL_ID не указан в переменных окружения'
            };
        }

        // Удаляем из группы, если указана
        if (GROUP_ID) {
            try {
                results.group = await removeUserFromChat(GROUP_ID, parseInt(telegramId));
            } catch (error) {
                console.error(`Ошибка удаления из группы ${GROUP_ID}:`, error);
                results.group = {
                    success: false,
                    error: error.message || 'Неизвестная ошибка'
                };
            }
        } else {
            results.group = {
                success: false,
                error: 'GROUP_ID не указан в переменных окружения'
            };
        }

        const allSuccess = results.channel?.success && results.group?.success;
        const hasErrors = !results.channel?.success || !results.group?.success;

        res.status(allSuccess ? 200 : (hasErrors ? 207 : 200)).json({
            success: allSuccess,
            message: allSuccess 
                ? 'Пользователь успешно удален из группы и канала'
                : 'Частичное выполнение операции',
            results
        });
    } catch (error) {
        console.error('Ошибка при удалении пользователя:', error);
        res.status(500).json({
            success: false,
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