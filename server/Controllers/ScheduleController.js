import Schedule from "../Models/Schedule.js";

// Создать новое событие
export const create = async (req, res) => {
    try {
        const { eventTitle, eventDate, location, eventLink, description } = req.body;

        if (!eventTitle || !eventDate || !location || !description) {
            return res.status(400).json({
                success: false,
                message: "Все обязательные поля должны быть заполнены",
            });
        }

        const schedule = new Schedule({
            eventTitle,
            eventDate,
            location,
            eventLink,
            description,
        });

        await schedule.save();

        res.status(201).json({
            success: true,
            data: schedule,
            message: "Событие успешно создано",
        });
    } catch (error) {
        console.log("Ошибка в ScheduleController.create:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при создании события",
            error: error.message,
        });
    }
};

// Получить все события
export const getAll = async (req, res) => {
    try {
        const { upcoming } = req.query;
        
        const filter = {};
        
        // Фильтр для предстоящих событий
        if (upcoming === 'true') {
            filter.eventDate = { $gte: new Date() };
        }

        const schedules = await Schedule.find(filter).sort({ eventDate: 1 });

        res.json({
            success: true,
            data: schedules,
            count: schedules.length,
        });
    } catch (error) {
        console.log("Ошибка в ScheduleController.getAll:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при получении событий",
            error: error.message,
        });
    }
};

// Получить событие по ID
export const getById = async (req, res) => {
    try {
        const { id } = req.params;

        const schedule = await Schedule.findById(id);

        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: "Событие не найдено",
            });
        }

        res.json({
            success: true,
            data: schedule,
        });
    } catch (error) {
        console.log("Ошибка в ScheduleController.getById:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при получении события",
            error: error.message,
        });
    }
};

// Обновить событие
export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const schedule = await Schedule.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: "Событие не найдено",
            });
        }

        res.json({
            success: true,
            data: schedule,
            message: "Событие успешно обновлено",
        });
    } catch (error) {
        console.log("Ошибка в ScheduleController.update:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при обновлении события",
            error: error.message,
        });
    }
};

// Удалить событие
export const remove = async (req, res) => {
    try {
        const { id } = req.params;

        const schedule = await Schedule.findByIdAndDelete(id);

        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: "Событие не найдено",
            });
        }

        res.json({
            success: true,
            message: "Событие успешно удалено",
        });
    } catch (error) {
        console.log("Ошибка в ScheduleController.remove:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при удалении события",
            error: error.message,
        });
    }
};

