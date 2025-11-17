import Practice from "../Models/Practice.js";

// Создать новую практику
export const create = async (req, res) => {
    try {
        const { title, shortDescription, fullDescription, imageUrl, videoUrl, accessType } = req.body;

        // if (!title || !subtitle || !category || !shortDescription || !fullDescription || !imageUrl || !videoUrl) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Все обязательные поля должны быть заполнены",
        //     });
        // }

        const practice = new Practice({
            title,
            shortDescription,
            fullDescription,
            imageUrl,
            videoUrl,
            accessType: accessType || 'free',
        });

        await practice.save();

        res.status(201).json({
            success: true,
            data: practice,
            message: "Практика успешно создана",
        });
    } catch (error) {
        console.log("Ошибка в PracticeController.create:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при создании практики",
            error: error.message,
        });
    }
};

// Получить все практики
export const getAll = async (req, res) => {
    try {
        const { accessType } = req.query;
        
        const filter = {};
        if (accessType) filter.accessType = accessType;

        const practices = await Practice.find(filter).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: practices,
            count: practices.length,
        });
    } catch (error) {
        console.log("Ошибка в PracticeController.getAll:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при получении практик",
            error: error.message,
        });
    }
};

// Получить практику по ID
export const getById = async (req, res) => {
    try {
        const { id } = req.params;

        const practice = await Practice.findById(id);

        if (!practice) {
            return res.status(404).json({
                success: false,
                message: "Практика не найдена",
            });
        }

        res.json({
            success: true,
            data: practice,
        });
    } catch (error) {
        console.log("Ошибка в PracticeController.getById:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при получении практики",
            error: error.message,
        });
    }
};

// Обновить практику
export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const practice = await Practice.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!practice) {
            return res.status(404).json({
                success: false,
                message: "Практика не найдена",
            });
        }

        res.json({
            success: true,
            data: practice,
            message: "Практика успешно обновлена",
        });
    } catch (error) {
        console.log("Ошибка в PracticeController.update:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при обновлении практики",
            error: error.message,
        });
    }
};

// Удалить практику
export const remove = async (req, res) => {
    try {
        const { id } = req.params;

        const practice = await Practice.findByIdAndDelete(id);

        if (!practice) {
            return res.status(404).json({
                success: false,
                message: "Практика не найдена",
            });
        }

        res.json({
            success: true,
            message: "Практика успешно удалена",
        });
    } catch (error) {
        console.log("Ошибка в PracticeController.remove:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при удалении практики",
            error: error.message,
        });
    }
};

