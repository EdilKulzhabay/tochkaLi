import jwt from "jsonwebtoken";
import User from "../Models/User.js";
import AdminActionLog from "../Models/AdminActionLog.js";

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

        // Админы и менеджеры могут иметь доступ даже если заблокированы
        // Для обычных пользователей проверяем блокировку
        if (user.isBlocked && !['admin', 'manager', 'content_manager', 'client_manager'].includes(user.role)) {
            return res.status(403).json({
                success: false,
                message: "Аккаунт заблокирован",
            });
        }

        req.userId = decoded.userId;
        req.user = user;

        res.on('finish', () => {
            const adminRoles = ['admin', 'manager', 'content_manager', 'client_manager'];
            if (!adminRoles.includes(user.role)) return;

            const method = req.method.toUpperCase();
            if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) return;

            const action = `${method} ${req.originalUrl} → ${res.statusCode}`;
            AdminActionLog.create({
                admin: user._id,
                action,
            }).catch((error) => {
                console.log("Ошибка логирования действий админа:", error);
            });
        });

        console.log("authMiddleware: user установлен, role =", user.role, "status =", user.status);
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

