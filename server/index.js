import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import mongoose from "mongoose";
import "dotenv/config";
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import cron from 'node-cron';
import rateLimit from 'express-rate-limit';

import { 
    UserController,
    FAQController,
    HoroscopeController,
    MeditationController,
    PracticeController,
    VideoLessonController,
    ScheduleController,
    TransitController,
    DynamicContentController,
    WelcomeController,
    AboutClubController,
    SchumannController,
    BroadcastController,
    RobokassaController,
    UploadController,
    DiaryController,
    VideoProgressController,
    SubscriptionController,
    ModalNotificationController
} from "./Controllers/index.js";
import { authMiddleware } from "./Middlewares/authMiddleware.js";
import User from "./Models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

mongoose
    .connect(process.env.MONGOURL)
    .then(() => {
        console.log("Mongodb OK");
    })
    .catch((err) => {
        console.log("Mongodb Error", err);
    });

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());
app.use(cookieParser());
app.use(cors({ 
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'X-Requested-With',
        'X-Telegram-WebApp',
        'X-Telegram-Platform',
        'X-Telegram-Init-Data'
    ],
    exposedHeaders: ['Content-Disposition'],
    credentials: true
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting для создания пользователей (5 запросов в минуту)
const createUserRateLimit = rateLimit({
    windowMs: 60 * 1000, // 1 минута
    max: 5, // максимум 5 запросов
    message: {
        success: false,
        message: 'Слишком много попыток создания пользователя. Пожалуйста, попробуйте через минуту.'
    },
    standardHeaders: true, // Возвращает информацию о лимите в заголовках `RateLimit-*`
    legacyHeaders: false, // Отключает заголовки `X-RateLimit-*`
    // Используем IP адрес или userId для идентификации
    keyGenerator: (req) => {
        // Если пользователь авторизован, используем его ID
        if (req.userId) {
            return `user:${req.userId}`;
        }
        // Иначе используем IP адрес
        return req.ip || req.connection.remoteAddress || 'unknown';
    }
});

// Rate limiting для создания контента (5 запросов в минуту)
const createContentRateLimit = rateLimit({
    windowMs: 60 * 1000, // 1 минута
    max: 5, // максимум 5 запросов
    message: {
        success: false,
        message: 'Слишком много попыток создания контента. Пожалуйста, попробуйте через минуту.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Используем IP адрес или userId для идентификации
    keyGenerator: (req) => {
        // Если пользователь авторизован, используем его ID
        if (req.userId) {
            return `user:${req.userId}`;
        }
        // Иначе используем IP адрес
        return req.ip || req.connection.remoteAddress || 'unknown';
    }
});

// Middleware для защиты Swagger UI паролем
const swaggerPassword = process.env.SWAGGER_PASSWORD || 'admin123';
const swaggerAuthSessions = new Set(); // Простое хранилище сессий в памяти

// Middleware для проверки доступа к Swagger
const swaggerAuthMiddleware = (req, res, next) => {
    const sessionId = req.cookies?.swagger_session;
    
    // Если есть валидная сессия, разрешаем доступ
    if (sessionId && swaggerAuthSessions.has(sessionId)) {
        return next();
    }
    
    // Получаем относительный путь от /api/docs
    // req.path будет содержать путь относительно /api/docs, например '/login' или '/'
    const relativePath = req.path || '/';
    const fullPath = req.originalUrl || req.path;
    
    // Разрешаем доступ к статическим файлам Swagger UI (CSS, JS, изображения)
    // Эти файлы необходимы для работы Swagger UI
    if (fullPath.match(/\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/i) || 
        fullPath.includes('/swagger-ui') || 
        fullPath.includes('/swagger-ui-bundle') ||
        fullPath.includes('/swagger-ui-standalone')) {
        return next();
    }
    
    // Если это запрос на страницу входа или корневой путь, показываем форму
    // Также проверяем полный путь для совместимости
    if (relativePath === '/login' || relativePath === '/' || fullPath === '/api/docs/login' || fullPath === '/api/docs' || fullPath.endsWith('/api/docs') || fullPath.includes('/api/api/docs')) {
        // Определяем базовый путь для формы (с учетом проксирования)
        const basePath = fullPath.includes('/api/api/docs') ? '/api/api/docs' : '/api/docs';
        
        return res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Swagger UI - Вход</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        margin: 0;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    }
                    .login-container {
                        background: white;
                        padding: 40px;
                        border-radius: 12px;
                        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                        width: 100%;
                        max-width: 400px;
                    }
                    h1 {
                        margin: 0 0 30px 0;
                        color: #333;
                        text-align: center;
                        font-size: 28px;
                    }
                    .form-group {
                        margin-bottom: 20px;
                    }
                    label {
                        display: block;
                        margin-bottom: 8px;
                        color: #555;
                        font-weight: 500;
                    }
                    input[type="password"] {
                        width: 100%;
                        padding: 12px;
                        border: 2px solid #e0e0e0;
                        border-radius: 8px;
                        font-size: 16px;
                        box-sizing: border-box;
                        transition: border-color 0.3s;
                    }
                    input[type="password"]:focus {
                        outline: none;
                        border-color: #667eea;
                    }
                    button {
                        width: 100%;
                        padding: 12px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: transform 0.2s, box-shadow 0.2s;
                    }
                    button:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
                    }
                    button:active {
                        transform: translateY(0);
                    }
                    .error {
                        color: #e74c3c;
                        margin-top: 10px;
                        text-align: center;
                        font-size: 14px;
                    }
                </style>
            </head>
            <body>
                <div class="login-container">
                    <h1>🔐 Swagger UI</h1>
                    <form method="POST" action="${basePath}/login">
                        <div class="form-group">
                            <label for="password">Пароль:</label>
                            <input type="password" id="password" name="password" required autofocus>
                        </div>
                        ${req.query.error ? '<div class="error">Неверный пароль</div>' : ''}
                        <button type="submit">Войти</button>
                    </form>
                </div>
            </body>
            </html>
        `);
    }
    
    // Для всех остальных запросов редиректим на страницу входа
    // Определяем базовый путь с учетом проксирования
    const basePath = fullPath.includes('/api/api/docs') ? '/api/api/docs' : '/api/docs';
    res.redirect(`api.${basePath}/login`);
};

// Функция обработки входа в Swagger
const handleSwaggerLogin = (req, res) => {
    const { password } = req.body;
    
    // Определяем базовый путь для редиректа (с учетом проксирования)
    const basePath = req.originalUrl.includes('/api/api/docs') ? '/api/api/docs' : '/api/docs';
    
    if (password === swaggerPassword) {
        // Создаем сессию
        const sessionId = crypto.randomBytes(32).toString('hex');
        swaggerAuthSessions.add(sessionId);
        
        // Устанавливаем cookie с сессией
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('swagger_session', sessionId, {
            httpOnly: true,
            secure: isProduction,
            maxAge: 24 * 60 * 60 * 1000, // 24 часа
            sameSite: isProduction ? 'none' : 'lax'
        });
        
        res.redirect(basePath);
    } else {
        res.redirect(`${basePath}/login?error=1`);
    }
};

// Маршруты для входа в Swagger (обрабатываем оба варианта пути)
app.post('/api/docs/login', express.urlencoded({ extended: true }), handleSwaggerLogin);
app.post('/api/api/docs/login', express.urlencoded({ extended: true }), handleSwaggerLogin);

// Маршрут для выхода из Swagger
app.get('/api/docs/logout', (req, res) => {
    const sessionId = req.cookies?.swagger_session;
    if (sessionId) {
        swaggerAuthSessions.delete(sessionId);
    }
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('swagger_session', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax'
    });
    res.redirect('/api/docs/login');
});

// Защищенный маршрут Swagger UI
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));

// Swagger UI: используем swaggerUi.serve для статических файлов и swaggerUi.setup для основного маршрута
// swaggerUi.serve возвращает массив middleware для статических файлов
// swaggerUi.setup возвращает middleware для основного UI
app.use('/api/docs', swaggerAuthMiddleware, swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "TochkaLi API Documentation"
}));

// Публичные маршруты
app.post("/api/user/create", createUserRateLimit, UserController.createUser);
app.post("/api/user/register", createUserRateLimit, UserController.register);
app.post("/api/user/login", UserController.login);
app.post("/api/user/send-mail", UserController.sendMail);
app.post("/api/user/code-confirm", UserController.codeConfirm);
app.post("/api/user/send-mail-recovery", UserController.sendMailRecovery);
app.patch("/api/users/:telegramId", UserController.updateUserByTelegramId);
app.post("/api/send-code", UserController.sendMail);
app.post("/api/user/profile", UserController.getProfile);
app.get("/api/user/telegram/:telegramId", UserController.getUserByTelegramId);

app.get("/api/user/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password -currentToken -refreshToken");
        if (!user) {
            return res.status(404).json({ success: false, message: "Пользователь не найден" });
        }
        res.json({ success: true, user });
    } catch (error) {
        console.log("Ошибка получения данных пользователя:", error);
        res.status(500).json({ success: false, message: "Ошибка получения данных пользователя" });
    }
});

app.get("/api/user/check-session", authMiddleware, (req, res) => {
    res.json({ success: true, valid: true });
});

// Управление пользователями (для client_manager, manager, admin)
app.post("/api/user/create-by-admin", createUserRateLimit, UserController.createUserByAdmin);
app.get("/api/user/all", UserController.getAllUsers);
app.get("/api/user/export/excel", UserController.exportUsersToExcel);
app.get("/api/user/:id", UserController.getUserById);
app.put("/api/user/:id", UserController.updateUser);
app.put("/api/user/:id/activate-subscription", UserController.activateSubscription);
app.put("/api/user/:id/deactivate-subscription", UserController.deactivateSubscription);
app.put("/api/user/:id/block", UserController.blockUser);
app.put("/api/user/:id/unblock", UserController.unblockUser);
app.delete("/api/user/:id", UserController.deleteUser);

// Управление администраторами (только для admin)
app.get("/api/admin/all", authMiddleware, UserController.getAllAdmins);
app.get("/api/admin/:id", authMiddleware, UserController.getAdminById);
app.post("/api/admin/create", authMiddleware, createUserRateLimit, UserController.createAdmin);
app.put("/api/admin/:id", authMiddleware, UserController.updateAdmin);
app.put("/api/admin/:id/block", authMiddleware, UserController.blockAdmin);
app.put("/api/admin/:id/unblock", authMiddleware, UserController.unblockAdmin);

// Управление профилем (для авторизованных пользователей)
app.put("/api/user/profile/update", UserController.updateProfile);
app.post("/api/user/purchase-content", UserController.purchaseContent);

// ==================== FAQ маршруты ====================
app.post("/api/faq", createContentRateLimit, FAQController.create);
app.get("/api/faq", FAQController.getAll);
app.get("/api/faq/:id", FAQController.getById);
app.put("/api/faq/:id", FAQController.update);
app.delete("/api/faq/:id", FAQController.remove);

// ==================== Horoscope маршруты ====================
app.post("/api/horoscope", createContentRateLimit, HoroscopeController.create);
app.get("/api/horoscope", HoroscopeController.getAll);
app.get("/api/horoscope/current", HoroscopeController.getCurrent);
app.post("/api/horoscope/correct-dates", HoroscopeController.correctHoroscopeDates);
app.get("/api/horoscope/fill-energy-corridor", HoroscopeController.fillEnergyCorridor);
app.get("/api/horoscope/:id", HoroscopeController.getById);
app.put("/api/horoscope/:id", HoroscopeController.update);
app.delete("/api/horoscope/:id", HoroscopeController.remove);

// ==================== Meditation маршруты ====================
app.post("/api/meditation", createContentRateLimit, MeditationController.create);
app.get("/api/meditation", MeditationController.getAll);
app.get("/api/meditation/:id", MeditationController.getById);
app.put("/api/meditation/:id", MeditationController.update);
app.delete("/api/meditation/:id", MeditationController.remove);

// ==================== Practice маршруты ====================
app.post("/api/practice", createContentRateLimit, PracticeController.create);
app.get("/api/practice", PracticeController.getAll);
app.get("/api/practice/:id", PracticeController.getById);
app.put("/api/practice/:id", PracticeController.update);
app.delete("/api/practice/:id", PracticeController.remove);

// ==================== VideoLesson маршруты ====================
app.post("/api/video-lesson", createContentRateLimit, VideoLessonController.create);
app.get("/api/video-lesson", VideoLessonController.getAll);
app.get("/api/video-lesson/:id", VideoLessonController.getById);
app.put("/api/video-lesson/:id", VideoLessonController.update);
app.delete("/api/video-lesson/:id", VideoLessonController.remove);

// ==================== Schedule маршруты ====================
app.post("/api/schedule", createContentRateLimit, ScheduleController.create);
app.get("/api/schedule", ScheduleController.getAll);
app.get("/api/schedule/:id", ScheduleController.getById);
app.put("/api/schedule/:id", ScheduleController.update);
app.delete("/api/schedule/:id", ScheduleController.remove);

// ==================== Transit маршруты ====================
app.post("/api/transit", createContentRateLimit, TransitController.create);
app.get("/api/transit", TransitController.getAll);
app.get("/api/transit/current", TransitController.getCurrent);
app.get("/api/transit/:id", TransitController.getById);
app.put("/api/transit/:id", TransitController.update);
app.delete("/api/transit/:id", TransitController.remove);

// ==================== DynamicContent маршруты ====================
app.post("/api/dynamic-content", createContentRateLimit, DynamicContentController.create);
app.get("/api/dynamic-content", DynamicContentController.getAll);
app.get("/api/dynamic-content/horoscope-corridor", DynamicContentController.getHoroscopeCorridorContent);
app.get("/api/dynamic-content/blocked-browser", DynamicContentController.getBlockedBrowserContent);
app.get("/api/dynamic-content/name/:name", DynamicContentController.getByName);
app.get("/api/dynamic-content/:id", DynamicContentController.getById);
app.put("/api/dynamic-content/:id", DynamicContentController.update);
app.delete("/api/dynamic-content/:id", DynamicContentController.remove);
// ==================== Welcome маршруты ====================
app.post("/api/welcome", createContentRateLimit, WelcomeController.create);
app.get("/api/welcome", WelcomeController.getAll);
app.get("/api/welcome/:id", WelcomeController.getById);
app.put("/api/welcome/:id", WelcomeController.update);
app.delete("/api/welcome/:id", WelcomeController.remove);

// ==================== AboutClub маршруты ====================
app.post("/api/about-club", createContentRateLimit, AboutClubController.create);
app.get("/api/about-club", AboutClubController.getAll);
app.get("/api/about-club/:id", AboutClubController.getById);
app.put("/api/about-club/:id", AboutClubController.update);
app.delete("/api/about-club/:id", AboutClubController.remove);

// ==================== Schumann маршруты ====================
app.post("/api/schumann", createContentRateLimit, SchumannController.create);
app.get("/api/schumann", SchumannController.getAll);
app.get("/api/schumann/:id", SchumannController.getById);
app.put("/api/schumann/:id", SchumannController.update);
app.delete("/api/schumann/:id", SchumannController.remove);

// ==================== Broadcast маршруты ====================
app.post("/api/broadcast/users", BroadcastController.getFilteredUsers);
app.post("/api/broadcast/send", BroadcastController.sendBroadcast);
app.post("/api/broadcast/test", BroadcastController.sendTestMessage);
// Маршруты для сохраненных рассылок
app.post("/api/broadcast", createContentRateLimit, BroadcastController.createBroadcast);
app.get("/api/broadcast", BroadcastController.getAllBroadcasts);
app.get("/api/broadcast/:id", BroadcastController.getBroadcastById);
app.put("/api/broadcast/:id", BroadcastController.updateBroadcast);
app.delete("/api/broadcast/:id", BroadcastController.deleteBroadcast);

// ==================== Modal Notification маршруты ====================
app.post("/api/modal-notification/users", ModalNotificationController.getFilteredUsers);
app.post("/api/modal-notification/create", createContentRateLimit, ModalNotificationController.createModalNotification);
app.post("/api/modal-notification/my", ModalNotificationController.getUserModalNotifications);
app.post("/api/modal-notification/remove", ModalNotificationController.removeModalNotification);

// ==================== Robokassa ====================
app.post("/api/robres", RobokassaController.handleResult);
app.post("/api/user/payment", UserController.payment);

app.all("/robokassa_callback/success", (req, res) => {
    const params = req.method === 'POST' ? req.body : req.query;
    const queryString = new URLSearchParams(params).toString();
    res.redirect(`${process.env.CLIENT_URL}/robokassa_callback/success${queryString ? '?' + queryString : ''}`);
});

app.all("/robokassa_callback/fail", (req, res) => {
    const params = req.method === 'POST' ? req.body : req.query;
    const queryString = new URLSearchParams(params).toString();
    res.redirect(`${process.env.CLIENT_URL}/robokassa_callback/fail${queryString ? '?' + queryString : ''}`);
});

// ==================== Upload маршруты ====================
app.post("/api/upload/image", UploadController.upload.single('image'), UploadController.uploadImage);
app.post("/api/upload/delete", UploadController.deleteImage);

// ==================== Diary маршруты ====================
app.post("/api/diary", createContentRateLimit, DiaryController.create);
app.get("/api/diary", DiaryController.getAll);
app.post("/api/diary/my", DiaryController.getMyDiaries);
app.get("/api/diary/:id", DiaryController.getById);
app.put("/api/diary/:id", DiaryController.update);
app.delete("/api/diary/:id", DiaryController.remove);

// ==================== VideoProgress ====================
app.post("/api/video-progress", VideoProgressController.saveProgress);
app.post("/api/video-progress/award-bonus", VideoProgressController.awardBonusOnPlay);
app.get("/api/video-progress/:userId/:contentType/:contentId", VideoProgressController.getProgress);
app.get("/api/video-progress/user/:userId/:contentType", VideoProgressController.getUserProgresses);
app.post("/api/video-progress/batch/:userId/:contentType", VideoProgressController.getProgressesForContents);

// ==================== Subscription ====================
// Ручной запуск проверки истекших подписок (для тестирования и администрирования)
app.post("/api/subscription/check-expired", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
            return res.status(403).json({
                success: false,
                message: "Доступ запрещен. Требуется роль admin или manager"
            });
        }
        
        const result = await SubscriptionController.checkExpiredSubscriptions();
        res.json(result);
    } catch (error) {
        console.error("Ошибка при ручной проверке подписок:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка при проверке подписок",
            error: error.message
        });
    }
});


// Настройка cron задачи для проверки истекших подписок
// Запускается каждый день в 12:00 (по времени сервера)
cron.schedule('0 12 * * *', async () => {
    console.log(`[${new Date().toISOString()}] Запуск автоматической проверки истекших подписок...`);
    const result = await SubscriptionController.checkExpiredSubscriptions();
    if (result.success) {
        console.log(`[${new Date().toISOString()}] Проверка завершена успешно. Обновлено пользователей: ${result.updatedCount}`);
    } else {
        console.error(`[${new Date().toISOString()}] Ошибка при проверке подписок:`, result.error);
    }
}, {
    timezone: "Asia/Almaty" // Устанавливаем часовой пояс (можно изменить на нужный)
});

console.log('Cron задача для проверки подписок настроена: каждый день в 12:00');

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});