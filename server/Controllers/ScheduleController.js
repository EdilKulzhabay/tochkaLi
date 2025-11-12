import Schedule from "../Models/Schedule.js";

// Создать новое событие
export const create = async (req, res) => {
    try {
        const { eventTitle, eventDate, location, eventLink, description } = req.body;

        // if (!eventTitle || !eventDate || !location || !description) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Все обязательные поля должны быть заполнены",
        //     });
        // }

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

// Функция для парсинга даты из формата DD.MM.YYYY
const parseDate = (dateString) => {
    if (!dateString) return null;
    
    // Формат DD.MM.YYYY
    const parts = dateString.split('.');
    if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // месяцы в JS начинаются с 0
        const year = parseInt(parts[2], 10);
        
        const date = new Date(year, month, day);
        
        // Проверка валидности даты
        if (isNaN(date.getTime())) {
            return null;
        }
        
        return date;
    }
    
    // Попытка стандартного парсинга
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return null;
    }
    
    return date;
};

// Получить все события
export const getAll = async (req, res) => {
    try {
        const { startDate, endDate, upcoming } = req.query;
        
        const filter = {};
        
        // Фильтр для предстоящих событий
        if (upcoming === 'true') {
            filter.eventDate = { $gte: new Date() };
        }
        
        // Фильтр по диапазону дат
        if (startDate && endDate) {
            const parsedStartDate = parseDate(startDate);
            const parsedEndDate = parseDate(endDate);
            
            if (parsedStartDate && parsedEndDate) {
                // Устанавливаем время начала дня для startDate
                const start = new Date(parsedStartDate);
                start.setHours(0, 0, 0, 0);
                
                // Устанавливаем время конца дня для endDate
                const end = new Date(parsedEndDate);
                end.setHours(23, 59, 59, 999);
                
                filter.eventDate = { 
                    $gte: start, 
                    $lte: end 
                };
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Неверный формат даты. Используйте формат DD.MM.YYYY",
                });
            }
        } else if (startDate || endDate) {
            // Если передана только одна дата
            return res.status(400).json({
                success: false,
                message: "Необходимо указать обе даты: startDate и endDate",
            });
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

