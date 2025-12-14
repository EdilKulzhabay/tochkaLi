import Horoscope from "../Models/Horoscope.js";

// Вспомогательная функция для конвертации даты в формат MM-DD
const dateToMMDD = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}-${day}`;
};

// Создать новый гороскоп
export const create = async (req, res) => {
    try {
        const { startDate, endDate, title, subtitle, image, lines, accessType } = req.body;

        if (!startDate || !endDate || !title) {
            return res.status(400).json({
                success: false,
                message: "Начальная дата, конечная дата и заголовок обязательны",
            });
        }

        // Конвертируем даты в формат MM-DD, если они пришли в полном формате
        let formattedStartDate = startDate;
        let formattedEndDate = endDate;
        
        if (startDate.includes('-') && startDate.length > 5) {
            formattedStartDate = dateToMMDD(startDate);
        }
        if (endDate.includes('-') && endDate.length > 5) {
            formattedEndDate = dateToMMDD(endDate);
        }

        const horoscope = new Horoscope({
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            title,
            subtitle: subtitle || '',
            image: image || '',
            lines: lines || [],
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

        const horoscopes = await Horoscope.find().sort({ startDate: 1 });

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
        const updateData = { ...req.body };

        // Конвертируем даты в формат MM-DD, если они пришли в полном формате
        if (updateData.startDate && updateData.startDate.includes('-') && updateData.startDate.length > 5) {
            updateData.startDate = dateToMMDD(updateData.startDate);
        }
        if (updateData.endDate && updateData.endDate.includes('-') && updateData.endDate.length > 5) {
            updateData.endDate = dateToMMDD(updateData.endDate);
        }

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

// Получить текущий гороскоп
export const getCurrent = async (req, res) => {
    try {
        const horoscope = await Horoscope.getCurrent();

        if (!horoscope) {
            return res.status(404).json({
                success: false,
                message: "Текущий гороскоп не найден",
            });
        }

        res.json({
            success: true,
            data: horoscope.toObject(),
        });
    } catch (error) {
        console.log("Ошибка в HoroscopeController.getCurrent:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при получении текущего гороскопа",
            error: error.message,
        });
    }
};

// Метод для миграции старых дат в новый формат
export const correctHoroscopeDates = async (req, res) => {
    try {
        const horoscopes = await Horoscope.find();
        let updated = 0;
        let skipped = 0;

        for (const horoscope of horoscopes) {
            // Проверяем, нужно ли конвертировать даты
            const needsConversion = 
                typeof horoscope.startDate !== 'string' ||
                horoscope.startDate.length > 5 ||
                typeof horoscope.endDate !== 'string' ||
                horoscope.endDate.length > 5;

            if (needsConversion) {
                try {
                    const startDate = new Date(horoscope.startDate);
                    const endDate = new Date(horoscope.endDate);
                    
                    const newStartDate = `${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
                    const newEndDate = `${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

                    await Horoscope.findByIdAndUpdate(
                        horoscope._id,
                        {
                            startDate: newStartDate,
                            endDate: newEndDate
                        },
                        { runValidators: false }
                    );
                    
                    updated++;
                    console.log(`Обновлен гороскоп ${horoscope._id}: ${newStartDate} - ${newEndDate}`);
                } catch (error) {
                    console.log(`Ошибка обновления гороскопа ${horoscope._id}:`, error.message);
                }
            } else {
                skipped++;
            }
        }

        res.json({
            success: true,
            message: "Миграция дат завершена",
            updated,
            skipped,
            total: horoscopes.length
        });
    } catch (error) {
        console.log("Ошибка в HoroscopeController.correctHoroscopeDates:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при миграции дат",
            error: error.message,
        });
    }
};

export const fillEnergyCorridor = async (req, res) => {
    try {
        await Horoscope.updateMany({}, { energyCorridor: false });
        res.json({
            success: true,
            message: "Энергетический коридор обновлен",
        });
    } catch (error) {
        console.log("Ошибка в HoroscopeController.fillEnergyCorridor:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при обновлении энергетических коридоров",
        });
    }
};
