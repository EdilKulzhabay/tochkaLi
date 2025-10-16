import FAQ from "../Models/FAQ.js";

// Создать новый FAQ
export const create = async (req, res) => {
    try {
        const { question, answer } = req.body;

        if (!question || !answer) {
            return res.status(400).json({
                success: false,
                message: "Вопрос и ответ обязательны",
            });
        }

        const faq = new FAQ({
            question,
            answer,
        });

        await faq.save();

        res.status(201).json({
            success: true,
            data: faq,
            message: "FAQ успешно создан",
        });
    } catch (error) {
        console.log("Ошибка в FAQController.create:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при создании FAQ",
            error: error.message,
        });
    }
};

// Получить все FAQ
export const getAll = async (req, res) => {
    try {
        const faqs = await FAQ.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            data: faqs,
            count: faqs.length,
        });
    } catch (error) {
        console.log("Ошибка в FAQController.getAll:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при получении FAQ",
            error: error.message,
        });
    }
};

// Получить FAQ по ID
export const getById = async (req, res) => {
    try {
        const { id } = req.params;

        const faq = await FAQ.findById(id);

        if (!faq) {
            return res.status(404).json({
                success: false,
                message: "FAQ не найден",
            });
        }

        res.json({
            success: true,
            data: faq,
        });
    } catch (error) {
        console.log("Ошибка в FAQController.getById:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при получении FAQ",
            error: error.message,
        });
    }
};

// Обновить FAQ
export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const faq = await FAQ.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!faq) {
            return res.status(404).json({
                success: false,
                message: "FAQ не найден",
            });
        }

        res.json({
            success: true,
            data: faq,
            message: "FAQ успешно обновлен",
        });
    } catch (error) {
        console.log("Ошибка в FAQController.update:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при обновлении FAQ",
            error: error.message,
        });
    }
};

// Удалить FAQ
export const remove = async (req, res) => {
    try {
        const { id } = req.params;

        const faq = await FAQ.findByIdAndDelete(id);

        if (!faq) {
            return res.status(404).json({
                success: false,
                message: "FAQ не найден",
            });
        }

        res.json({
            success: true,
            message: "FAQ успешно удален",
        });
    } catch (error) {
        console.log("Ошибка в FAQController.remove:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при удалении FAQ",
            error: error.message,
        });
    }
};

