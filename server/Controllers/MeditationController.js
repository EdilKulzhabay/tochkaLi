import Meditation from "../Models/Meditation.js";

// Создать новую медитацию
export const create = async (req, res) => {
    try {
        const { title, subtitle, category, shortDescription, fullDescription, imageUrl, videoUrl, accessType } = req.body;

        if (!title || !subtitle || !category || !shortDescription || !fullDescription || !imageUrl || !videoUrl) {
            return res.status(400).json({
                success: false,
                message: "Все обязательные поля должны быть заполнены",
            });
        }

        const meditation = new Meditation({
            title,
            subtitle,
            category,
            shortDescription,
            fullDescription,
            imageUrl,
            videoUrl,
            accessType: accessType || 'free',
        });

        await meditation.save();

        res.status(201).json({
            success: true,
            data: meditation,
            message: "Медитация успешно создана",
        });
    } catch (error) {
        console.log("Ошибка в MeditationController.create:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при создании медитации",
            error: error.message,
        });
    }
};

// Получить все медитации
export const getAll = async (req, res) => {
    try {
        const { category, accessType, isActive } = req.query;
        
        const filter = {};
        if (category) filter.category = category;
        if (accessType) filter.accessType = accessType;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const meditations = await Meditation.find(filter).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: meditations,
            count: meditations.length,
        });
    } catch (error) {
        console.log("Ошибка в MeditationController.getAll:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при получении медитаций",
            error: error.message,
        });
    }
};

// Получить медитацию по ID
export const getById = async (req, res) => {
    try {
        const { id } = req.params;

        const meditation = await Meditation.findById(id);

        if (!meditation) {
            return res.status(404).json({
                success: false,
                message: "Медитация не найдена",
            });
        }

        res.json({
            success: true,
            data: meditation,
        });
    } catch (error) {
        console.log("Ошибка в MeditationController.getById:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при получении медитации",
            error: error.message,
        });
    }
};

// Обновить медитацию
export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const meditation = await Meditation.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!meditation) {
            return res.status(404).json({
                success: false,
                message: "Медитация не найдена",
            });
        }

        res.json({
            success: true,
            data: meditation,
            message: "Медитация успешно обновлена",
        });
    } catch (error) {
        console.log("Ошибка в MeditationController.update:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при обновлении медитации",
            error: error.message,
        });
    }
};

// Удалить медитацию
export const remove = async (req, res) => {
    try {
        const { id } = req.params;

        const meditation = await Meditation.findByIdAndDelete(id);

        if (!meditation) {
            return res.status(404).json({
                success: false,
                message: "Медитация не найдена",
            });
        }

        res.json({
            success: true,
            message: "Медитация успешно удалена",
        });
    } catch (error) {
        console.log("Ошибка в MeditationController.remove:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при удалении медитации",
            error: error.message,
        });
    }
};

