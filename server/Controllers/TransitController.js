import Transit from "../Models/Transit.js";

// Создать новый транзит
export const create = async (req, res) => {
    try {
        const { startDate, endDate, title, subtitle, lines, accessType } = req.body;

        if (!startDate || !endDate || !title) {
            return res.status(400).json({
                success: false,
                message: "Начальная дата, конечная дата и заголовок обязательны",
            });
        }

        const transit = new Transit({
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            title,
            subtitle: subtitle || '',
            lines: lines || [],
            accessType: accessType || 'subscription',
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
        const transits = await Transit.find().sort({ createdAt: -1 });

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
        const updateData = { ...req.body };

        // Преобразуем даты в объекты Date, если они присутствуют
        if (updateData.startDate) {
            updateData.startDate = new Date(updateData.startDate);
        }
        if (updateData.endDate) {
            updateData.endDate = new Date(updateData.endDate);
        }

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

// Получить текущий транзит
export const getCurrent = async (req, res) => {
    try {
        const transit = await Transit.getCurrent();

        if (!transit) {
            return res.status(404).json({
                success: false,
                message: "Текущий транзит не найден",
            });
        }

        res.json({
            success: true,
            data: transit,
        });
    } catch (error) {
        console.log("Ошибка в TransitController.getCurrent:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при получении текущего транзита",
            error: error.message,
        });
    }
};
