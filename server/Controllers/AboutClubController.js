import AboutClub from "../Models/AboutClub.js";

// Создать новый контент о клубе
export const create = async (req, res) => {
    try {
        const { title, image, content, list } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: "Заголовок и контент обязательны",
            });
        }

        const aboutClub = new AboutClub({
            title,
            image,
            content,
            list: list || [],
        });

        await aboutClub.save();

        res.status(201).json({
            success: true,
            data: aboutClub,
            message: "Контент о клубе успешно создан",
        });
    } catch (error) {
        console.log("Ошибка в AboutClubController.create:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при создании контента о клубе",
            error: error.message,
        });
    }
};

// Получить все контенты о клубе
export const getAll = async (req, res) => {
    try {
        const aboutClubs = await AboutClub.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            data: aboutClubs,
            count: aboutClubs.length,
        });
    } catch (error) {
        console.log("Ошибка в AboutClubController.getAll:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при получении контентов о клубе",
            error: error.message,
        });
    }
};

// Получить контент о клубе по ID
export const getById = async (req, res) => {
    try {
        const { id } = req.params;

        const aboutClub = await AboutClub.findById(id);

        if (!aboutClub) {
            return res.status(404).json({
                success: false,
                message: "Контент о клубе не найден",
            });
        }

        res.json({
            success: true,
            data: aboutClub,
        });
    } catch (error) {
        console.log("Ошибка в AboutClubController.getById:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при получении контента о клубе",
            error: error.message,
        });
    }
};

// Обновить контент о клубе
export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const aboutClub = await AboutClub.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!aboutClub) {
            return res.status(404).json({
                success: false,
                message: "Контент о клубе не найден",
            });
        }

        res.json({
            success: true,
            data: aboutClub,
            message: "Контент о клубе успешно обновлен",
        });
    } catch (error) {
        console.log("Ошибка в AboutClubController.update:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при обновлении контента о клубе",
            error: error.message,
        });
    }
};

// Удалить контент о клубе
export const remove = async (req, res) => {
    try {
        const { id } = req.params;

        const aboutClub = await AboutClub.findByIdAndDelete(id);

        if (!aboutClub) {
            return res.status(404).json({
                success: false,
                message: "Контент о клубе не найден",
            });
        }

        res.json({
            success: true,
            message: "Контент о клубе успешно удален",
        });
    } catch (error) {
        console.log("Ошибка в AboutClubController.remove:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при удалении контента о клубе",
            error: error.message,
        });
    }
};
