import PurposeEnergy from "../Models/PurposeEnergy.js";
import { addAdminAction } from "../utils/addAdminAction.js";

// Вспомогательная функция для конвертации даты в формат MM-DD
const dateToMMDD = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}-${day}`;
};

export const create = async (req, res) => {
    try {
        const user = req.user;
        const { startDate, endDate, title, subtitle, image, content, accessType } = req.body;

        if (!startDate || !endDate || !title) {
            return res.status(400).json({
                success: false,
                message: "Начальная дата, конечная дата и заголовок обязательны",
            });
        }

        let formattedStartDate = startDate;
        let formattedEndDate = endDate;

        if (startDate.includes('-') && startDate.length > 5) {
            formattedStartDate = dateToMMDD(startDate);
        }
        if (endDate.includes('-') && endDate.length > 5) {
            formattedEndDate = dateToMMDD(endDate);
        }

        const purposeEnergy = new PurposeEnergy({
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            title,
            subtitle: subtitle || '',
            image: image || '',
            content: content || [],
            accessType: accessType || 'subscription',
        });

        await purposeEnergy.save();

        await addAdminAction(user._id, `Создал(а) энергию предназначения: "${title}"`);

        res.status(201).json({
            success: true,
            data: purposeEnergy,
            message: "Энергия предназначения успешно создана",
        });
    } catch (error) {
        console.log("Ошибка в PurposeEnergyController.create:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при создании энергии предназначения",
            error: error.message,
        });
    }
};

export const getAll = async (_req, res) => {
    try {
        const items = await PurposeEnergy.find().sort({ startDate: 1 });

        res.json({
            success: true,
            data: items,
            count: items.length,
        });
    } catch (error) {
        console.log("Ошибка в PurposeEnergyController.getAll:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при получении энергии предназначения",
            error: error.message,
        });
    }
};

export const getById = async (req, res) => {
    try {
        const { id } = req.params;

        const item = await PurposeEnergy.findById(id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Энергия предназначения не найдена",
            });
        }

        res.json({
            success: true,
            data: item,
        });
    } catch (error) {
        console.log("Ошибка в PurposeEnergyController.getById:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при получении энергии предназначения",
            error: error.message,
        });
    }
};

export const update = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const updateData = { ...req.body };

        if (updateData.startDate && updateData.startDate.includes('-') && updateData.startDate.length > 5) {
            updateData.startDate = dateToMMDD(updateData.startDate);
        }
        if (updateData.endDate && updateData.endDate.includes('-') && updateData.endDate.length > 5) {
            updateData.endDate = dateToMMDD(updateData.endDate);
        }

        const item = await PurposeEnergy.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Энергия предназначения не найдена",
            });
        }

        await addAdminAction(user._id, `Обновил(а) энергию предназначения: "${item.title}"`);

        res.json({
            success: true,
            data: item,
            message: "Энергия предназначения успешно обновлена",
        });
    } catch (error) {
        console.log("Ошибка в PurposeEnergyController.update:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при обновлении энергии предназначения",
            error: error.message,
        });
    }
};

export const remove = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;

        const item = await PurposeEnergy.findByIdAndDelete(id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Энергия предназначения не найдена",
            });
        }

        await addAdminAction(user._id, `Удалил(а) энергию предназначения: "${item.title}"`);

        res.json({
            success: true,
            message: "Энергия предназначения успешно удалена",
        });
    } catch (error) {
        console.log("Ошибка в PurposeEnergyController.remove:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при удалении энергии предназначения",
            error: error.message,
        });
    }
};

