import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import "dotenv/config";
import path from 'path';
import { fileURLToPath } from 'url';
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
import { 
    setupSwagger
} from "./utils/swagger.js";

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

// ==================== Swagger UI маршруты ====================
// Настройка Swagger UI
setupSwagger(app);

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