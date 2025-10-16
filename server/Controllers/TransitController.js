import Transit from "../Models/Transit.js";

// Создать новый транзит
export const create = async (req, res) => {
    try {
        const { title, category, description, planet, aspect, intensity, startDate, endDate, affectedZodiacs, accessType } = req.body;

        if (!title || !category || !description || !planet || !aspect || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "Все обязательные поля должны быть заполнены",
            });
        }

        const transit = new Transit({
            title,
            category,
            description,
            planet,
            aspect,
            intensity: intensity || 'medium',
            startDate,
            endDate,
            affectedZodiacs: affectedZodiacs || [],
            accessType: accessType || 'free',
        });

        await transit.save();

        res.status(201).json({
            success: true,
            data: transit,
            message: "Транзит успешно создан",
        });
    } catch (error) {
        console.log("Ошибка в TransitController.create:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при создании транзита",
            error: error.message,
        });
    }
};

// Получить все транзиты
export const getAll = async (req, res) => {
    try {
        const { planet, category, intensity, accessType, isActive, active } = req.query;
        
        const filter = {};
        if (planet) filter.planet = planet;
        if (category) filter.category = category;
        if (intensity) filter.intensity = intensity;
        if (accessType) filter.accessType = accessType;
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        
        // Фильтр для активных транзитов (текущая дата между startDate и endDate)
        if (active === 'true') {
            const now = new Date();
            filter.startDate = { $lte: now };
            filter.endDate = { $gte: now };
        }

        const transits = await Transit.find(filter).sort({ startDate: -1 });

        res.json({
            success: true,
            data: transits,
            count: transits.length,
        });
    } catch (error) {
        console.log("Ошибка в TransitController.getAll:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при получении транзитов",
            error: error.message,
        });
    }
};

// Получить транзит по ID
export const getById = async (req, res) => {
    try {
        const { id } = req.params;

        const transit = await Transit.findById(id);

        if (!transit) {
            return res.status(404).json({
                success: false,
                message: "Транзит не найден",
            });
        }

        res.json({
            success: true,
            data: transit,
        });
    } catch (error) {
        console.log("Ошибка в TransitController.getById:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при получении транзита",
            error: error.message,
        });
    }
};

// Обновить транзит
export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const transit = await Transit.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!transit) {
            return res.status(404).json({
                success: false,
                message: "Транзит не найден",
            });
        }

        res.json({
            success: true,
            data: transit,
            message: "Транзит успешно обновлен",
        });
    } catch (error) {
        console.log("Ошибка в TransitController.update:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при обновлении транзита",
            error: error.message,
        });
    }
};

// Удалить транзит
export const remove = async (req, res) => {
    try {
        const { id } = req.params;

        const transit = await Transit.findByIdAndDelete(id);

        if (!transit) {
            return res.status(404).json({
                success: false,
                message: "Транзит не найден",
            });
        }

        res.json({
            success: true,
            message: "Транзит успешно удален",
        });
    } catch (error) {
        console.log("Ошибка в TransitController.remove:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при удалении транзита",
            error: error.message,
        });
    }
};

