import Schumann from "../Models/Schumann.js";
import { addAdminAction } from "../utils/addAdminAction.js";

// Создать новую запись о частоте Шумана
export const create = async (req, res) => {
    try {
        const user = req.user;
        const { date, image } = req.body;

        if (!date || !image) {
            return res.status(400).json({
                success: false,
                message: "Дата и изображение обязательны",
            });
        }

        const schumann = new Schumann({
            date,
            image,
        });

        await schumann.save();

        await addAdminAction(user._id, `Создал(а) запись о частоте Шумана: "${schumann.date}"`);

        res.status(201).json({
            success: true,
            data: schumann,
            message: "Запись о частоте Шумана успешно создана",
        });
    } catch (error) {
        console.log("Ошибка в SchumannController.create:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при создании записи о частоте Шумана",
            error: error.message,
        });
    }
};

// Получить все записи о частоте Шумана
export const getAll = async (req, res) => {
    try {
        const schumanns = await Schumann.find().sort({ date: -1 });

        res.json({
            success: true,
            data: schumanns,
            count: schumanns.length,
        });
    } catch (error) {
        console.log("Ошибка в SchumannController.getAll:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при получении записей о частоте Шумана",
            error: error.message,
        });
    }
};

// Получить запись о частоте Шумана по ID
export const getById = async (req, res) => {
    try {
        const { id } = req.params;

        const schumann = await Schumann.findById(id);

        if (!schumann) {
            return res.status(404).json({
                success: false,
                message: "Запись о частоте Шумана не найдена",
            });
        }

        res.json({
            success: true,
            data: schumann,
        });
    } catch (error) {
        console.log("Ошибка в SchumannController.getById:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при получении записи о частоте Шумана",
            error: error.message,
        });
    }
};

// Обновить запись о частоте Шумана
export const update = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const updateData = req.body;

        const schumann = await Schumann.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!schumann) {
            return res.status(404).json({
                success: false,
                message: "Запись о частоте Шумана не найдена",
            });
        }

        await addAdminAction(user._id, `Обновил(а) запись о частоте Шумана: "${schumann.date}"`);

        res.json({
            success: true,
            data: schumann,
            message: "Запись о частоте Шумана успешно обновлена",
        });
    } catch (error) {
        console.log("Ошибка в SchumannController.update:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при обновлении записи о частоте Шумана",
            error: error.message,
        });
    }
};

// Удалить запись о частоте Шумана
export const remove = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;

        const schumann = await Schumann.findByIdAndDelete(id);

        if (!schumann) {
            return res.status(404).json({
                success: false,
                message: "Запись о частоте Шумана не найдена",
            });
        }

        await addAdminAction(user._id, `Удалил(а) запись о частоте Шумана: "${schumann.date}"`);

        res.json({
            success: true,
            message: "Запись о частоте Шумана успешно удалена",
        });
    } catch (error) {
        console.log("Ошибка в SchumannController.remove:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при удалении записи о частоте Шумана",
            error: error.message,
        });
    }
};
