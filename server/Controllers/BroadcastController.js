import User from "../Models/User.js";
import axios from "axios";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Отправка сообщения через Telegram Bot API
const sendTelegramMessage = async (chatId, message) => {
    try {
        const response = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML',
        });
        return { success: true, data: response.data };
    } catch (error) {
        console.log(`Ошибка отправки сообщения пользователю ${chatId}:`, error.response?.data || error.message);
        return { success: false, error: error.response?.data || error.message };
    }
};

// Получить пользователей с фильтрацией по статусу и поиску
export const getFilteredUsers = async (req, res) => {
    try {
        const { status, search } = req.query;

        let filter = {};
        
        // Фильтр по статусу (если указан)
        if (status && status !== 'all') {
            filter.status = status;
        }

        // Получаем только пользователей с saleBotId (для рассылки)
        filter.saleBotId = { $exists: true, $ne: null, $ne: '' };

        // Поиск по нескольким полям
        if (search && search.trim()) {
            const searchRegex = new RegExp(search.trim(), 'i');
            filter.$or = [
                { telegramUserName: searchRegex },
                { userName: searchRegex },
                { fullName: searchRegex },
                { phone: searchRegex },
            ];
        }

        const users = await User.find(filter)
            .select('saleBotId telegramId telegramUserName userName fullName phone status createdAt')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: users,
            count: users.length,
        });
    } catch (error) {
        console.log("Ошибка в getFilteredUsers:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка получения пользователей",
        });
    }
};

// Функция для задержки
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Функция для разбивки массива на чанки
const chunkArray = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        if (i + size > array.length) {
            chunks.push(array.slice(i, array.length));
            break;
        }
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};

// Отправить рассылку
export const sendBroadcast = async (req, res) => {
    try {
        const { message, status, search, userIds } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Сообщение обязательно для отправки",
            });
        }

        if (!TELEGRAM_BOT_TOKEN) {
            return res.status(500).json({
                success: false,
                message: "Telegram Bot Token не настроен в переменных окружения",
            });
        }

        let filter = {};
        let users;

        // Если переданы конкретные ID пользователей (выборочная отправка)
        if (userIds && Array.isArray(userIds) && userIds.length > 0) {
            filter._id = { $in: userIds };
            filter.saleBotId = { $exists: true, $ne: null, $ne: '' };
            users = await User.find(filter).select('saleBotId telegramUserName userName fullName phone status');
        } else {
            // Иначе используем фильтры по статусу и поиску
            
            // Фильтр по статусу (если указан)
            if (status && status !== 'all') {
                filter.status = status;
            }

            // Получаем только пользователей с saleBotId
            filter.saleBotId = { $exists: true, $ne: null, $ne: '' };

            // Поиск по нескольким полям
            if (search && search.trim()) {
                const searchRegex = new RegExp(search.trim(), 'i');
                filter.$or = [
                    { telegramUserName: searchRegex },
                    { userName: searchRegex },
                    { fullName: searchRegex },
                    { phone: searchRegex },
                ];
            }

            users = await User.find(filter).select('saleBotId telegramUserName userName fullName phone status');
        }

        if (users.length === 0) {
            return res.json({
                success: true,
                message: "Нет пользователей для отправки",
                sent: 0,
                failed: 0,
                total: 0,
            });
        }

        const clientsId = users.map(user => user.saleBotId);
        
        // Разбиваем на пакеты по 100 пользователей
        const BATCH_SIZE = 100;
        const DELAY_MS = 15000; // 15 секунд
        const batches = chunkArray(clientsId, BATCH_SIZE);

        console.log(`Начинаем рассылку для ${clientsId.length} пользователей в ${batches.length} пакетах`);

        let totalSent = 0;
        let totalFailed = 0;
        let allFailedUsers = [];

        // Отправляем каждый пакет с задержкой
        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            console.log(`Отправка пакета ${i + 1}/${batches.length} (${batch.length} пользователей)...`);

            console.log("batch: ", batch);
            try {
                const response = await axios.post(`https://chatter.salebot.pro/api/${process.env.TELEGRAM_BOT_TOKEN}/broadcast`, {
                    clients: batch,
                    message,
                    shift: 0.3,
                }, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                console.log("response: ", response.data);
            } catch (error) {
                console.error(`Ошибка отправки пакета ${i + 1}:`, error.response?.data || error.message);
                totalFailed += batch.length;
            }

            if (i < batches.length - 1) {
                console.log(`Ожидание ${DELAY_MS / 1000} секунд перед следующим пакетом...`);
                await delay(DELAY_MS);
            }
        }

        console.log(`Рассылка завершена. Отправлено: ${totalSent}, Ошибок: ${totalFailed}`);

        return res.status(200).json({
            success: true,
            message: "Рассылка завершена",
            sent: totalSent,
            failed: totalFailed,
            total: users.length,
            batches: batches.length,
            failedUsers: allFailedUsers,
        });
    } catch (error) {
        console.log("Ошибка в sendBroadcast:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при отправке рассылки",
        });
    }
};

// Отправить тестовое сообщение (только себе - админу)
export const sendTestMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.userId;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Сообщение обязательно для отправки",
            });
        }

        if (!TELEGRAM_BOT_TOKEN) {
            return res.status(500).json({
                success: false,
                message: "Telegram Bot Token не настроен в переменных окружения",
            });
        }

        // Получаем telegramId текущего пользователя (админа)
        const user = await User.findById(userId).select('telegramId');

        if (!user || !user.telegramId) {
            return res.status(400).json({
                success: false,
                message: "У вас не привязан Telegram аккаунт",
            });
        }

        const result = await sendTelegramMessage(user.telegramId, message);

        if (result.success) {
            res.json({
                success: true,
                message: "Тестовое сообщение отправлено",
            });
        } else {
            res.status(500).json({
                success: false,
                message: "Ошибка отправки тестового сообщения",
                error: result.error,
            });
        }
    } catch (error) {
        console.log("Ошибка в sendTestMessage:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при отправке тестового сообщения",
        });
    }
};

