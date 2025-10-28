import Horoscope from "../Models/Horoscope.js";

// Создать новый гороскоп
export const create = async (req, res) => {
    try {
        const { title, subtitle, mainContent, dates, lines, accessType } = req.body;

        if (!title || !subtitle || !mainContent || !dates || !lines || lines.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Все обязательные поля должны быть заполнены",
            });
        }

        const horoscope = new Horoscope({
            title,
            subtitle,
            mainContent,
            dates,
            lines,
            accessType: accessType || 'free',
        });

        await horoscope.save();

        res.status(201).json({
            success: true,
            data: horoscope,
            message: "Гороскоп успешно создан",
        });
    } catch (error) {
        console.log("Ошибка в HoroscopeController.create:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при создании гороскопа",
            error: error.message,
        });
    }
};

// Получить все гороскопы
export const getAll = async (req, res) => {
    try {
        const { accessType, isActive } = req.query;
        
        const filter = {};
        if (accessType) filter.accessType = accessType;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const horoscopes = await Horoscope.find(filter).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: horoscopes,
            count: horoscopes.length,
        });
    } catch (error) {
        console.log("Ошибка в HoroscopeController.getAll:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при получении гороскопов",
            error: error.message,
        });
    }
};

// Получить гороскоп по ID
export const getById = async (req, res) => {
    try {
        const { id } = req.params;

        const horoscope = await Horoscope.findById(id);

        if (!horoscope) {
            return res.status(404).json({
                success: false,
                message: "Гороскоп не найден",
            });
        }

        res.json({
            success: true,
            data: horoscope,
        });
    } catch (error) {
        console.log("Ошибка в HoroscopeController.getById:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при получении гороскопа",
            error: error.message,
        });
    }
};

// Обновить гороскоп
export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const horoscope = await Horoscope.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!horoscope) {
            return res.status(404).json({
                success: false,
                message: "Гороскоп не найден",
            });
        }

        res.json({
            success: true,
            data: horoscope,
            message: "Гороскоп успешно обновлен",
        });
    } catch (error) {
        console.log("Ошибка в HoroscopeController.update:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при обновлении гороскопа",
            error: error.message,
        });
    }
};

// Удалить гороскоп
export const remove = async (req, res) => {
    try {
        const { id } = req.params;

        const horoscope = await Horoscope.findByIdAndDelete(id);

        if (!horoscope) {
            return res.status(404).json({
                success: false,
                message: "Гороскоп не найден",
            });
        }

        res.json({
            success: true,
            message: "Гороскоп успешно удален",
        });
    } catch (error) {
        console.log("Ошибка в HoroscopeController.remove:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при удалении гороскопа",
            error: error.message,
        });
    }
};
