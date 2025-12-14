import User from "../Models/User.js";
import Broadcast from "../Models/Broadcast.js";
import axios from "axios";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
// URL бот сервера для рассылки
const BOT_SERVER_URL = process.env.BOT_SERVER_URL || 'http://localhost:5011';

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
        const { status, search } = req.body;
        console.log("status: ", status);
        console.log("search: ", search);

        let filter = {
            notifyPermission: true,
            // Исключаем заблокированных пользователей
            isBlocked: { $ne: true },
        };
        
        // Фильтр по статусу (если указан)
        if (status && status !== 'all') {
            if (status === 'blocked') {
                // Если фильтр "blocked", показываем только заблокированных
                filter.isBlocked = true;
            } else {
                // Иначе исключаем заблокированных и фильтруем по статусу
                filter.status = status;
                filter.isBlocked = { $ne: true };
            }
        }

        // Получаем только пользователей с telegramId (для рассылки)
        filter.telegramId = { $exists: true, $ne: null, $ne: '' };

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
            .select('telegramId telegramUserName userName fullName phone status isBlocked createdAt')
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

// Отправить рассылку
export const sendBroadcast = async (req, res) => {
    try {
        const { message, status, search, userIds, imageUrl, parseMode, buttonText, buttonUrl, broadcastId, broadcastTitle } = req.body;
        
        // Если передан broadcastId или broadcastTitle, загружаем сохраненную рассылку
        let savedBroadcast = null;
        if (broadcastId) {
            savedBroadcast = await Broadcast.findById(broadcastId);
            if (!savedBroadcast) {
                return res.status(404).json({
                    success: false,
                    message: "Сохраненная рассылка не найдена",
                });
            }
        } else if (broadcastTitle) {
            savedBroadcast = await Broadcast.findOne({ title: broadcastTitle });
            if (!savedBroadcast) {
                return res.status(404).json({
                    success: false,
                    message: "Сохраненная рассылка не найдена",
                });
            }
        }
        
        // Используем данные из сохраненной рассылки, если они есть
        const finalMessage = message || savedBroadcast?.content || '';
        const finalImageUrl = imageUrl || savedBroadcast?.imgUrl || undefined;
        const finalButtonText = buttonText || savedBroadcast?.buttonText || undefined;

        if (!finalMessage) {
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
            filter.telegramId = { $exists: true, $ne: null, $ne: '' };
            // Исключаем заблокированных пользователей
            filter.isBlocked = { $ne: true };
            // Только пользователи с разрешением на уведомления
            filter.notifyPermission = true;
            users = await User.find(filter).select('telegramId telegramUserName userName fullName phone status isBlocked profilePhotoUrl');
        } else {
            // Иначе используем фильтры по статусу и поиску
            
            // Исключаем заблокированных пользователей (заблокированным не отправляем рассылку)
            filter.isBlocked = { $ne: true };
            // Только пользователи с разрешением на уведомления
            filter.notifyPermission = true;
            
            // Фильтр по статусу (если указан)
            if (status && status !== 'all') {
                // Если статус "blocked", не отправляем рассылку (уже исключены выше)
                if (status !== 'blocked') {
                    filter.status = status;
                }
            }

            // Получаем только пользователей с telegramId
            filter.telegramId = { $exists: true, $ne: null, $ne: '' };

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

            users = await User.find(filter).select('telegramId telegramUserName userName fullName phone status isBlocked profilePhotoUrl');
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

        const telegramIds = users.map(user => user.telegramId).filter(id => id); // Фильтруем пустые значения
        
        if (telegramIds.length === 0) {
            return res.json({
                success: true,
                message: "Нет пользователей с telegramId для отправки",
                sent: 0,
                failed: 0,
                total: 0,
            });
        }

        console.log(`Начинаем рассылку для ${telegramIds.length} пользователей через бот сервер`);
        console.log(`BOT_SERVER_URL: ${BOT_SERVER_URL}`);

        // Проверяем доступность бот сервера
        if (!BOT_SERVER_URL || BOT_SERVER_URL === 'http://localhost:5011') {
            console.warn('BOT_SERVER_URL не настроен или использует значение по умолчанию');
        }

        // Подготавливаем данные пользователей для подстановки в URL кнопки
        const usersData = users.map(user => ({
            telegramId: user.telegramId,
            telegramUserName: user.telegramUserName || '',
            profilePhotoUrl: user.profilePhotoUrl || '',
        }));

        // Отправляем запрос на бот сервер для рассылки
        try {
            const response = await axios.post(`${BOT_SERVER_URL}/api/bot/broadcast`, {
                text: finalMessage,
                telegramIds: telegramIds,
                imageUrl: finalImageUrl,
                parseMode: parseMode || 'HTML',
                buttonText: finalButtonText,
                buttonUrl: buttonUrl || undefined,
                usersData: usersData, // Данные пользователей для подстановки в URL
            }, {
                headers: {
                    "Content-Type": "application/json",
                },
                timeout: 300000, // 5 минут таймаут для больших рассылок
            });

            // Проверяем структуру ответа
            if (!response.data || !response.data.results) {
                console.error('Неожиданная структура ответа от бот сервера:', response.data);
                return res.status(500).json({
                    success: false,
                    message: "Неожиданный формат ответа от бот сервера",
                    error: response.data,
                });
            }

            const { results } = response.data;
            const totalSent = results.success?.length || 0;
            const totalFailed = results.failed?.length || 0;

            console.log(`Рассылка завершена. Отправлено: ${totalSent}, Ошибок: ${totalFailed}`);

            return res.status(200).json({
                success: true,
                message: "Рассылка завершена",
                sent: totalSent,
                failed: totalFailed,
                total: telegramIds.length,
                failedUsers: results.failed || [],
            });
        } catch (error) {
            console.error('Ошибка при отправке запроса на бот сервер:', {
                message: error.message,
                code: error.code,
                response: error.response?.data,
                status: error.response?.status,
                url: `${BOT_SERVER_URL}/api/bot/broadcast`
            });
            
            // Более детальная обработка ошибок
            if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
                return res.status(500).json({
                    success: false,
                    message: `Бот сервер недоступен по адресу ${BOT_SERVER_URL}. Проверьте, что бот сервер запущен и доступен.`,
                    error: error.message,
                });
            }
            
            if (error.response) {
                return res.status(error.response.status || 500).json({
                    success: false,
                    message: "Ошибка при отправке рассылки на бот сервер",
                    error: error.response.data || error.message,
                });
            }
            
            return res.status(500).json({
                success: false,
                message: "Ошибка при отправке рассылки на бот сервер",
                error: error.message,
            });
        }
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

// Создать сохраненную рассылку
export const createBroadcast = async (req, res) => {
    try {
        const { title, imgUrl, content, buttonText } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: "Название и содержание рассылки обязательны",
            });
        }

        // Проверяем, существует ли уже рассылка с таким названием
        const existingBroadcast = await Broadcast.findOne({ title });
        if (existingBroadcast) {
            return res.status(400).json({
                success: false,
                message: "Рассылка с таким названием уже существует",
            });
        }

        const broadcast = new Broadcast({
            title,
            imgUrl: imgUrl || '',
            content,
            buttonText: buttonText || '',
        });

        await broadcast.save();

        res.status(201).json({
            success: true,
            message: "Рассылка успешно сохранена",
            data: broadcast,
        });
    } catch (error) {
        console.log("Ошибка в createBroadcast:", error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Рассылка с таким названием уже существует",
            });
        }
        res.status(500).json({
            success: false,
            message: "Ошибка при сохранении рассылки",
            error: error.message,
        });
    }
};

// Получить все сохраненные рассылки
export const getAllBroadcasts = async (req, res) => {
    try {
        const broadcasts = await Broadcast.find()
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: broadcasts,
            count: broadcasts.length,
        });
    } catch (error) {
        console.log("Ошибка в getAllBroadcasts:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка получения сохраненных рассылок",
        });
    }
};

// Получить сохраненную рассылку по ID
export const getBroadcastById = async (req, res) => {
    try {
        const { id } = req.params;

        const broadcast = await Broadcast.findById(id);

        if (!broadcast) {
            return res.status(404).json({
                success: false,
                message: "Сохраненная рассылка не найдена",
            });
        }

        res.json({
            success: true,
            data: broadcast,
        });
    } catch (error) {
        console.log("Ошибка в getBroadcastById:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка получения сохраненной рассылки",
        });
    }
};

// Обновить сохраненную рассылку
export const updateBroadcast = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, imgUrl, content, buttonText } = req.body;

        const broadcast = await Broadcast.findById(id);

        if (!broadcast) {
            return res.status(404).json({
                success: false,
                message: "Сохраненная рассылка не найдена",
            });
        }

        // Если изменяется title, проверяем уникальность
        if (title && title !== broadcast.title) {
            const existingBroadcast = await Broadcast.findOne({ title });
            if (existingBroadcast) {
                return res.status(400).json({
                    success: false,
                    message: "Рассылка с таким названием уже существует",
                });
            }
            broadcast.title = title;
        }

        if (imgUrl !== undefined) broadcast.imgUrl = imgUrl;
        if (content !== undefined) broadcast.content = content;
        if (buttonText !== undefined) broadcast.buttonText = buttonText;

        await broadcast.save();

        res.json({
            success: true,
            message: "Рассылка успешно обновлена",
            data: broadcast,
        });
    } catch (error) {
        console.log("Ошибка в updateBroadcast:", error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Рассылка с таким названием уже существует",
            });
        }
        res.status(500).json({
            success: false,
            message: "Ошибка при обновлении рассылки",
            error: error.message,
        });
    }
};

// Удалить сохраненную рассылку
export const deleteBroadcast = async (req, res) => {
    try {
        const { id } = req.params;

        const broadcast = await Broadcast.findById(id);

        if (!broadcast) {
            return res.status(404).json({
                success: false,
                message: "Сохраненная рассылка не найдена",
            });
        }

        await Broadcast.findByIdAndDelete(id);

        res.json({
            success: true,
            message: "Рассылка успешно удалена",
        });
    } catch (error) {
        console.log("Ошибка в deleteBroadcast:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при удалении рассылки",
        });
    }
};

