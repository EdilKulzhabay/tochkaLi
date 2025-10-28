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
    BroadcastController,
    RobokassaController,
    UploadController
} from "./Controllers/index.js";
import { authMiddleware } from "./Middlewares/authMiddleware.js";
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

// Управление пользователями (только для админа)
app.get("/api/user/all", authMiddleware, UserController.getAllUsers);
app.get("/api/user/:id", authMiddleware, UserController.getUserById);
app.put("/api/user/:id", authMiddleware, UserController.updateUser);
app.delete("/api/user/:id", authMiddleware, UserController.deleteUser);

// Управление профилем (для авторизованных пользователей)
app.put("/api/user/profile/update", authMiddleware, UserController.updateProfile);
app.put("/api/user/profile/change-password", authMiddleware, UserController.changePassword);

// ==================== FAQ маршруты ====================
app.post("/api/faq", authMiddleware, FAQController.create);
app.get("/api/faq", FAQController.getAll);
app.get("/api/faq/:id", FAQController.getById);
app.put("/api/faq/:id", authMiddleware, FAQController.update);
app.delete("/api/faq/:id", authMiddleware, FAQController.remove);

// ==================== Horoscope маршруты ====================
app.post("/api/horoscope", authMiddleware, HoroscopeController.create);
app.get("/api/horoscope", HoroscopeController.getAll);
app.get("/api/horoscope/:id", HoroscopeController.getById);
app.put("/api/horoscope/:id", authMiddleware, HoroscopeController.update);
app.delete("/api/horoscope/:id", authMiddleware, HoroscopeController.remove);

// ==================== Meditation маршруты ====================
app.post("/api/meditation", authMiddleware, MeditationController.create);
app.get("/api/meditation", MeditationController.getAll);
app.get("/api/meditation/:id", MeditationController.getById);
app.put("/api/meditation/:id", authMiddleware, MeditationController.update);
app.delete("/api/meditation/:id", authMiddleware, MeditationController.remove);

// ==================== Practice маршруты ====================
app.post("/api/practice", authMiddleware, PracticeController.create);
app.get("/api/practice", PracticeController.getAll);
app.get("/api/practice/:id", PracticeController.getById);
app.put("/api/practice/:id", authMiddleware, PracticeController.update);
app.delete("/api/practice/:id", authMiddleware, PracticeController.remove);

// ==================== VideoLesson маршруты ====================
app.post("/api/video-lesson", authMiddleware, VideoLessonController.create);
app.get("/api/video-lesson", VideoLessonController.getAll);
app.get("/api/video-lesson/:id", VideoLessonController.getById);
app.put("/api/video-lesson/:id", authMiddleware, VideoLessonController.update);
app.delete("/api/video-lesson/:id", authMiddleware, VideoLessonController.remove);

// ==================== Schedule маршруты ====================
app.post("/api/schedule", authMiddleware, ScheduleController.create);
app.get("/api/schedule", ScheduleController.getAll);
app.get("/api/schedule/:id", ScheduleController.getById);
app.put("/api/schedule/:id", authMiddleware, ScheduleController.update);
app.delete("/api/schedule/:id", authMiddleware, ScheduleController.remove);

// ==================== Transit маршруты ====================
app.post("/api/transit", authMiddleware, TransitController.create);
app.get("/api/transit", TransitController.getAll);
app.get("/api/transit/:id", TransitController.getById);
app.put("/api/transit/:id", authMiddleware, TransitController.update);
app.delete("/api/transit/:id", authMiddleware, TransitController.remove);

// ==================== Broadcast маршруты ====================
app.get("/api/broadcast/users", authMiddleware, BroadcastController.getFilteredUsers);
app.post("/api/broadcast/send", authMiddleware, BroadcastController.sendBroadcast);
app.post("/api/broadcast/test", authMiddleware, BroadcastController.sendTestMessage);

// ==================== Robokassa маршруты ====================
// ResultURL - обработка результата оплаты (вызывается Robokassa)
app.post("/api/robres", RobokassaController.handleResult);

// ==================== Upload маршруты ====================
app.post("/api/upload/image", authMiddleware, UploadController.upload.single('image'), UploadController.uploadImage);
app.post("/api/upload/delete", authMiddleware, UploadController.deleteImage);


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});