import VideoLesson from "../Models/VideoLesson.js";

// Создать новый видео урок
export const create = async (req, res) => {
    try {
        const { title, subtitle, category, shortDescription, fullDescription, imageUrl, videoUrl, accessType, duration } = req.body;

        if (!title || !subtitle || !category || !shortDescription || !fullDescription || !imageUrl || !videoUrl) {
            return res.status(400).json({
                success: false,
                message: "Все обязательные поля должны быть заполнены",
            });
        }

        const videoLesson = new VideoLesson({
            title,
            subtitle,
            category,
            shortDescription,
            fullDescription,
            imageUrl,
            videoUrl,
            accessType: accessType || 'free',
            duration,
        });

        await videoLesson.save();

        res.status(201).json({
            success: true,
            data: videoLesson,
            message: "Видео урок успешно создан",
        });
    } catch (error) {
        console.log("Ошибка в VideoLessonController.create:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при создании видео урока",
            error: error.message,
        });
    }
};

// Получить все видео уроки
export const getAll = async (req, res) => {
    try {
        const { category, accessType, isActive } = req.query;
        
        const filter = {};
        if (category) filter.category = category;
        if (accessType) filter.accessType = accessType;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const videoLessons = await VideoLesson.find(filter).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: videoLessons,
            count: videoLessons.length,
        });
    } catch (error) {
        console.log("Ошибка в VideoLessonController.getAll:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при получении видео уроков",
            error: error.message,
        });
    }
};

// Получить видео урок по ID
export const getById = async (req, res) => {
    try {
        const { id } = req.params;

        const videoLesson = await VideoLesson.findById(id);

        if (!videoLesson) {
            return res.status(404).json({
                success: false,
                message: "Видео урок не найден",
            });
        }

        res.json({
            success: true,
            data: videoLesson,
        });
    } catch (error) {
        console.log("Ошибка в VideoLessonController.getById:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при получении видео урока",
            error: error.message,
        });
    }
};

// Обновить видео урок
export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const videoLesson = await VideoLesson.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!videoLesson) {
            return res.status(404).json({
                success: false,
                message: "Видео урок не найден",
            });
        }

        res.json({
            success: true,
            data: videoLesson,
            message: "Видео урок успешно обновлен",
        });
    } catch (error) {
        console.log("Ошибка в VideoLessonController.update:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при обновлении видео урока",
            error: error.message,
        });
    }
};

// Удалить видео урок
export const remove = async (req, res) => {
    try {
        const { id } = req.params;

        const videoLesson = await VideoLesson.findByIdAndDelete(id);

        if (!videoLesson) {
            return res.status(404).json({
                success: false,
                message: "Видео урок не найден",
            });
        }

        res.json({
            success: true,
            message: "Видео урок успешно удален",
        });
    } catch (error) {
        console.log("Ошибка в VideoLessonController.remove:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при удалении видео урока",
            error: error.message,
        });
    }
};

