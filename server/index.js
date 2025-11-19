import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import "dotenv/config";

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
    DiaryController
} from "./Controllers/index.js";
import { authMiddleware } from "./Middlewares/authMiddleware.js";
import { requireContentManager, requireClientManager, requireAdmin } from "./Middlewares/roleMiddleware.js";
import User from "./Models/User.js";
import path from 'path';
import { fileURLToPath } from 'url';

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
app.use(express.text());
app.use(
    cors({
        origin: "*",
    })
);

// Статическая раздача файлов из папки uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Публичные маршруты
app.post("/api/user/create", UserController.createUser);
app.post("/api/user/register", UserController.register);
app.post("/api/user/login", UserController.login);
app.post("/api/user/send-mail", UserController.sendMail);
app.post("/api/user/code-confirm", UserController.codeConfirm);
app.post("/api/user/send-mail-recovery", UserController.sendMailRecovery);
app.patch("/api/users/:telegramId", UserController.updateUserByTelegramId);
app.post("/api/send-code", UserController.sendMail);
app.post("/api/user/profile", UserController.getProfile);
app.get("/api/user/telegram/:telegramId", UserController.getUserByTelegramId);

// Защищенные маршруты (требуют авторизации)
app.get("/api/user/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password -currentToken -refreshToken");
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Ошибка получения данных пользователя" });
    }
});

// Эндпоинт для проверки валидности токена
app.get("/api/user/check-session", authMiddleware, (req, res) => {
    res.json({ success: true, valid: true });
});

// Управление пользователями (для client_manager, manager, admin)
app.post("/api/user/create-by-admin", authMiddleware, requireClientManager, UserController.createUserByAdmin);
app.get("/api/user/all", authMiddleware, requireClientManager, UserController.getAllUsers);
app.get("/api/user/:id", authMiddleware, requireClientManager, UserController.getUserById);
app.put("/api/user/:id", authMiddleware, requireClientManager, UserController.updateUser);
app.delete("/api/user/:id", authMiddleware, requireClientManager, UserController.deleteUser);

// Управление профилем (для авторизованных пользователей)
app.put("/api/user/profile/update", authMiddleware, UserController.updateProfile);
app.put("/api/user/profile/change-password", authMiddleware, UserController.changePassword);

// ==================== FAQ маршруты ====================
app.post("/api/faq", authMiddleware, requireContentManager, FAQController.create);
app.get("/api/faq", FAQController.getAll);
app.get("/api/faq/:id", FAQController.getById);
app.put("/api/faq/:id", authMiddleware, requireContentManager, FAQController.update);
app.delete("/api/faq/:id", authMiddleware, requireContentManager, FAQController.remove);

// ==================== Horoscope маршруты ====================
app.post("/api/horoscope", authMiddleware, requireContentManager, HoroscopeController.create);
app.get("/api/horoscope", HoroscopeController.getAll);
app.get("/api/horoscope/current", HoroscopeController.getCurrent);
app.get("/api/horoscope/:id", HoroscopeController.getById);
app.put("/api/horoscope/:id", authMiddleware, requireContentManager, HoroscopeController.update);
app.delete("/api/horoscope/:id", authMiddleware, requireContentManager, HoroscopeController.remove);

// ==================== Meditation маршруты ====================
app.post("/api/meditation", authMiddleware, requireContentManager, MeditationController.create);
app.get("/api/meditation", MeditationController.getAll);
app.get("/api/meditation/:id", MeditationController.getById);
app.put("/api/meditation/:id", authMiddleware, requireContentManager, MeditationController.update);
app.delete("/api/meditation/:id", authMiddleware, requireContentManager, MeditationController.remove);

// ==================== Practice маршруты ====================
app.post("/api/practice", authMiddleware, requireContentManager, PracticeController.create);
app.get("/api/practice", PracticeController.getAll);
app.get("/api/practice/:id", PracticeController.getById);
app.put("/api/practice/:id", authMiddleware, requireContentManager, PracticeController.update);
app.delete("/api/practice/:id", authMiddleware, requireContentManager, PracticeController.remove);

// ==================== VideoLesson маршруты ====================
app.post("/api/video-lesson", authMiddleware, requireContentManager, VideoLessonController.create);
app.get("/api/video-lesson", VideoLessonController.getAll);
app.get("/api/video-lesson/:id", VideoLessonController.getById);
app.put("/api/video-lesson/:id", authMiddleware, requireContentManager, VideoLessonController.update);
app.delete("/api/video-lesson/:id", authMiddleware, requireContentManager, VideoLessonController.remove);

// ==================== Schedule маршруты ====================
app.post("/api/schedule", requireContentManager, ScheduleController.create);
app.get("/api/schedule", ScheduleController.getAll);
app.get("/api/schedule/:id", ScheduleController.getById);
app.put("/api/schedule/:id", requireContentManager, ScheduleController.update);
app.delete("/api/schedule/:id", requireContentManager, ScheduleController.remove);

// ==================== Transit маршруты ====================
app.post("/api/transit", authMiddleware, requireContentManager, TransitController.create);
app.get("/api/transit", TransitController.getAll);
app.get("/api/transit/current", TransitController.getCurrent);
app.get("/api/transit/:id", TransitController.getById);
app.put("/api/transit/:id", authMiddleware, requireContentManager, TransitController.update);
app.delete("/api/transit/:id", authMiddleware, requireContentManager, TransitController.remove);

// ==================== DynamicContent маршруты ====================
app.post("/api/dynamic-content", authMiddleware, requireContentManager, DynamicContentController.create);
app.get("/api/dynamic-content", DynamicContentController.getAll);
app.get("/api/dynamic-content/:id", DynamicContentController.getById);
app.put("/api/dynamic-content/:id", authMiddleware, requireContentManager, DynamicContentController.update);
app.delete("/api/dynamic-content/:id", authMiddleware, requireContentManager, DynamicContentController.remove);
app.get("/api/dynamic-content/name/:name", DynamicContentController.getByName);
// ==================== Welcome маршруты ====================
app.post("/api/welcome", authMiddleware, requireContentManager, WelcomeController.create);
app.get("/api/welcome", WelcomeController.getAll);
app.get("/api/welcome/:id", WelcomeController.getById);
app.put("/api/welcome/:id", authMiddleware, requireContentManager, WelcomeController.update);
app.delete("/api/welcome/:id", authMiddleware, requireContentManager, WelcomeController.remove);

// ==================== AboutClub маршруты ====================
app.post("/api/about-club", authMiddleware, requireContentManager, AboutClubController.create);
app.get("/api/about-club", AboutClubController.getAll);
app.get("/api/about-club/:id", AboutClubController.getById);
app.put("/api/about-club/:id", authMiddleware, requireContentManager, AboutClubController.update);
app.delete("/api/about-club/:id", authMiddleware, requireContentManager, AboutClubController.remove);

// ==================== Schumann маршруты ====================
app.post("/api/schumann", authMiddleware, requireContentManager, SchumannController.create);
app.get("/api/schumann", SchumannController.getAll);
app.get("/api/schumann/:id", SchumannController.getById);
app.put("/api/schumann/:id", authMiddleware, requireContentManager, SchumannController.update);
app.delete("/api/schumann/:id", authMiddleware, requireContentManager, SchumannController.remove);

// ==================== Broadcast маршруты ====================
app.get("/api/broadcast/users", authMiddleware, requireClientManager, BroadcastController.getFilteredUsers);
app.post("/api/broadcast/send", authMiddleware, requireClientManager, BroadcastController.sendBroadcast);
app.post("/api/broadcast/test", authMiddleware, requireClientManager, BroadcastController.sendTestMessage);

// ==================== Robokassa маршруты ====================
// ResultURL - обработка результата оплаты (вызывается Robokassa)
app.post("/api/robres", RobokassaController.handleResult);

// ==================== Upload маршруты ====================
app.post("/api/upload/image", authMiddleware, requireContentManager, UploadController.upload.single('image'), UploadController.uploadImage);
app.post("/api/upload/delete", authMiddleware, requireContentManager, UploadController.deleteImage);

// ==================== Diary маршруты ====================
app.post("/api/diary", DiaryController.create);
app.get("/api/diary", DiaryController.getAll);
app.post("/api/diary/my", DiaryController.getMyDiaries);
app.get("/api/diary/:id", DiaryController.getById);
app.put("/api/diary/:id", DiaryController.update);
app.delete("/api/diary/:id", DiaryController.remove);


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});