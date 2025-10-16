import jwt from "jsonwebtoken";
import User from "../Models/User.js";

export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Токен не предоставлен",
            });
        }

        // Проверяем валидность токена
        const decoded = jwt.verify(token, process.env.SecretKey);

        // Проверяем, что этот токен является актуальным для пользователя
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(403).json({
                success: false,
                message: "Пользователь не найден",
            });
        }

        // Проверяем, что токен совпадает с текущим токеном пользователя
        // Это обеспечивает одну сессию - если пользователь залогинился с другого устройства,
        // старый токен станет невалидным
        if (user.currentToken !== token) {
            return res.status(403).json({
                success: false,
                message: "Сессия завершена. Войдите снова",
                sessionExpired: true,
            });
        }

        if (user.status !== "active") {
            return res.status(403).json({
                success: false,
                message: "Аккаунт заблокирован",
            });
        }

        req.userId = decoded.userId;
        req.user = user;
        next();
    } catch (error) {
        console.log("Auth middleware error:", error);
        
        if (error.name === "TokenExpiredError") {
            return res.status(403).json({
                success: false,
                message: "Токен истек",
                sessionExpired: true,
            });
        }

        return res.status(403).json({
            success: false,
            message: "Нет доступа",
            sessionExpired: true,
        });
    }
};

