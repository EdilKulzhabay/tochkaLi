import VideoProgress from '../Models/VideoProgress.js';
import User from '../Models/User.js';

// Сохранение или обновление прогресса просмотра
export const saveProgress = async (req, res) => {
    try {
        const { contentType, contentId, currentTime, duration, userId: bodyUserId } = req.body;
        let userId = req.userId; // Из authMiddleware

        // Если нет userId из токена, используем из body (для Telegram пользователей)
        if (!userId && bodyUserId) {
            userId = bodyUserId;
        }

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Пользователь не авторизован'
            });
        }

        if (!contentType || !contentId || currentTime === undefined || !duration) {
            return res.status(400).json({
                success: false,
                message: 'Необходимо предоставить contentType, contentId, currentTime и duration'
            });
        }

        // Вычисляем прогресс в процентах
        const progress = duration > 0 ? Math.round((currentTime / duration) * 100) : 0;
        const completed = progress >= 90; // Считаем завершенным, если просмотрено 90% или больше

        // Ищем существующий прогресс или создаем новый
        const existingProgress = await VideoProgress.findOne({
            userId,
            contentType,
            contentId
        });

        if (existingProgress) {
            // Обновляем существующий прогресс
            existingProgress.currentTime = currentTime;
            existingProgress.duration = duration;
            existingProgress.progress = progress;
            existingProgress.completed = completed;
            existingProgress.lastWatched = new Date();
            await existingProgress.save();

            return res.status(200).json({
                success: true,
                data: existingProgress
            });
        } else {
            // Создаем новый прогресс
            const newProgress = new VideoProgress({
                userId,
                contentType,
                contentId,
                currentTime,
                duration,
                progress,
                completed,
                lastWatched: new Date()
            });
            await newProgress.save();

            return res.status(201).json({
                success: true,
                data: newProgress
            });
        }
    } catch (error) {
        console.error('Ошибка сохранения прогресса:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сохранения прогресса',
            error: error.message
        });
    }
};

// Получение прогресса просмотра
export const getProgress = async (req, res) => {
    try {
        const { contentType, contentId } = req.params;
        const userId = req.userId; // Из authMiddleware

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Пользователь не авторизован'
            });
        }

        const progress = await VideoProgress.findOne({
            userId,
            contentType,
            contentId
        });

        if (!progress) {
            return res.status(200).json({
                success: true,
                data: {
                    currentTime: 0,
                    duration: 0,
                    progress: 0,
                    completed: false
                }
            });
        }

        return res.status(200).json({
            success: true,
            data: progress
        });
    } catch (error) {
        console.error('Ошибка получения прогресса:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения прогресса',
            error: error.message
        });
    }
};

// Получение всех прогрессов пользователя по типу контента
export const getUserProgresses = async (req, res) => {
    try {
        const { contentType } = req.params;
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Пользователь не авторизован'
            });
        }

        const progresses = await VideoProgress.find({
            userId,
            ...(contentType && { contentType })
        }).sort({ lastWatched: -1 });

        return res.status(200).json({
            success: true,
            data: progresses
        });
    } catch (error) {
        console.error('Ошибка получения прогрессов:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения прогрессов',
            error: error.message
        });
    }
};

// Получение прогрессов для списка контента (для отображения в карточках)
export const getProgressesForContents = async (req, res) => {
    try {
        const { contentType } = req.params;
        let userId = req.userId;

        // Если нет userId из токена, пытаемся получить из query параметра (для Telegram пользователей)
        if (!userId && req.query.userId) {
            userId = req.query.userId;
        }

        if (!userId) {
            return res.status(200).json({
                success: true,
                data: {}
            });
        }

        const { contentIds } = req.body; // Массив ID контента

        if (!Array.isArray(contentIds) || contentIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Необходимо предоставить массив contentIds'
            });
        }

        const progresses = await VideoProgress.find({
            userId,
            contentType,
            contentId: { $in: contentIds }
        });

        // Преобразуем в объект для быстрого доступа по contentId
        const progressMap = {};
        progresses.forEach(progress => {
            progressMap[progress.contentId.toString()] = {
                progress: progress.progress,
                currentTime: progress.currentTime,
                duration: progress.duration,
                completed: progress.completed
            };
        });

        return res.status(200).json({
            success: true,
            data: progressMap
        });
    } catch (error) {
        console.error('Ошибка получения прогрессов для контента:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения прогрессов',
            error: error.message
        });
    }
};

