import User from "../Models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.mail.ru",
    port: 465, // Или 587 для TLS
    secure: true,
    auth: {
        user: "info@tibetskaya.kz",
        pass: process.env.MailSMTP,
    },
});

const generateCode = () => {
    const characters = "0123456789";
    let randomPart = "";
    for (let i = 0; i < 6; i++) {
        randomPart += characters.charAt(
            Math.floor(Math.random() * characters.length)
        );
    }
    return randomPart;
};

const codes = {};
const lastSentTime = {}; // Отслеживание времени последней отправки
const sendingInProgress = new Set(); // Отслеживание отправок в процессе

export const sendMail = async (req, res) => {
    const { mail } = req.body;

    // Валидация email
    if (!mail || !mail.includes('@')) {
        return res.status(400).json({
            success: false,
            message: "Некорректный email адрес"
        });
    }

    const normalizedMail = mail.toLowerCase();

    // Проверка на повторную отправку (защита от спама)
    const now = Date.now();
    const lastSent = lastSentTime[normalizedMail];
    const COOLDOWN_PERIOD = 60000; // 1 минута

    if (lastSent && (now - lastSent) < COOLDOWN_PERIOD) {
        const remainingTime = Math.ceil((COOLDOWN_PERIOD - (now - lastSent)) / 1000);
        return res.status(429).json({
            success: false,
            message: `Повторная отправка возможна через ${remainingTime} секунд`
        });
    }

    // Проверка на отправку в процессе
    if (sendingInProgress.has(normalizedMail)) {
        return res.status(429).json({
            success: false,
            message: "Отправка уже в процессе, пожалуйста подождите"
        });
    }

    // Добавляем в процесс отправки
    sendingInProgress.add(normalizedMail);

    try {
        const confirmCode = generateCode();

        codes[normalizedMail] = confirmCode;
        lastSentTime[normalizedMail] = now;

        const mailOptions = {
            from: "info@tibetskaya.kz",
            to: normalizedMail,
            subject: "Подтверждение электронной почты",
            text: `Ваш код подтверждения: ${confirmCode}`,
        };

        transporter.sendMail(mailOptions, function (error, info) {
            // Убираем из процесса отправки
            sendingInProgress.delete(normalizedMail);
            
            if (error) {
                console.log("Ошибка отправки email:", error);
                // Удаляем сохраненный код при ошибке
                delete codes[normalizedMail];
                delete lastSentTime[normalizedMail];
                
                res.status(500).json({
                    success: false,
                    message: "Ошибка при отправке письма"
                });
            } else {
                console.log("Email sent successfully:", info.response);
                res.status(200).json({
                    success: true,
                    message: "Письмо успешно отправлено"
                });
            }
        });

    } catch (error) {
        // Убираем из процесса отправки при ошибке
        sendingInProgress.delete(normalizedMail);
        console.log("Ошибка в sendMail:", error);
        res.status(500).json({
            success: false,
            message: "Внутренняя ошибка сервера"
        });
    }
};

export const sendMailRecovery = async (req, res) => {
    const { mail } = req.body;

    // Валидация email
    if (!mail || !mail.includes('@')) {
        return res.status(400).json({
            success: false,
            message: "Некорректный email адрес"
        });
    }

    const normalizedMail = mail.toLowerCase();

    // Проверка на повторную отправку (защита от спама)
    const now = Date.now();
    const lastSent = lastSentTime[normalizedMail];
    const COOLDOWN_PERIOD = 60000; // 1 минута

    if (lastSent && (now - lastSent) < COOLDOWN_PERIOD) {
        const remainingTime = Math.ceil((COOLDOWN_PERIOD - (now - lastSent)) / 1000);
        return res.status(429).json({
            success: false,
            message: `Повторная отправка возможна через ${remainingTime} секунд`
        });
    }

    // Проверка на отправку в процессе
    if (sendingInProgress.has(normalizedMail)) {
        return res.status(429).json({
            success: false,
            message: "Отправка уже в процессе, пожалуйста подождите"
        });
    }

    // Добавляем в процесс отправки
    sendingInProgress.add(normalizedMail);

    try {
        // Генерация кода подтверждения
        const confirmCode = generateCode();

        // Сохранение кода подтверждения
        codes[normalizedMail] = confirmCode;
        lastSentTime[normalizedMail] = now;

        const mailOptions = {
            from: "info@tibetskaya.kz",
            to: normalizedMail,
            subject: "Восстановление пароля",
            text: `Ваш код для восстановления пароля: ${confirmCode}`,
        };

        // Отправка письма
        transporter.sendMail(mailOptions, function (error, info) {
            // Убираем из процесса отправки
            sendingInProgress.delete(normalizedMail);
            
            if (error) {
                console.log("Ошибка отправки email восстановления:", error);
                // Удаляем сохраненный код при ошибке
                delete codes[normalizedMail];
                delete lastSentTime[normalizedMail];
                
                res.status(500).json({
                    success: false,
                    message: "Ошибка при отправке письма"
                });
            } else {
                console.log("Recovery email sent successfully:", info.response);
                res.status(200).json({
                    success: true,
                    message: "Письмо успешно отправлено"
                });
            }
        });

    } catch (error) {
        // Убираем из процесса отправки при ошибке
        sendingInProgress.delete(normalizedMail);
        console.log("Ошибка в sendMailRecovery:", error);
        res.status(500).json({
            success: false,
            message: "Внутренняя ошибка сервера"
        });
    }
};

export const codeConfirm = async (req, res) => {
    try {
        const { mail, code } = req.body;
        console.log("codeConfirm req.body: ", req.body);
        
        const normalizedMail = mail?.toLowerCase();
        
        if (!normalizedMail || !code) {
            return res.status(400).json({
                success: false,
                message: "Необходимо указать email и код"
            });
        }
        
        if (codes[normalizedMail] === code) {
            console.log("codeConfirm code is correct");
            delete codes[normalizedMail]; // Удаляем код после успешного подтверждения
            delete lastSentTime[normalizedMail]; // Удаляем время последней отправки
            res.status(200).json({
                success: true,
                message: "Код успешно подтвержден"
            });
        } else {
            console.log("codeConfirm code is incorrect");
            res.status(400).json({
                success: false,
                message: "Неверный код"
            });
        }
    } catch (error) {
        console.log("Ошибка в codeConfirm:", error);
        res.status(500).json({
            message: "Что-то пошло не так",
        });
    }
};

export const createUser = async (req, res) => {
    try {
        const { telegramId, telegramUserName, saleBotId } = req.body;
        const candidate = await User.findOne({ telegramId });

        console.log("createUser req.body: ", req.body);

        if (candidate) {
            return res.status(200).json({
                success: false,
                message: "Пользователь существует, пропускаем создание пользователя",
            });
        }

        const doc = new User({
            telegramId,
            telegramUserName,
            saleBotId,
        });

        const user = await doc.save();
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.log("Ошибка в createUser:", error);
        res.status(500).json({
            message: "Что-то пошло не так",
        });
    }
};

export const register = async (req, res) => {
    try {
        const { fullName, mail, phone, password, telegramId } = req.body;
        
        if (!fullName || !mail || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: "Все поля обязательны для заполнения",
            });
        }

        const candidate = await User.findOne({ mail: mail?.toLowerCase() });

        if (candidate) {
            return res.status(409).json({
                success: false,
                message: "Пользователь с такой почтой уже существует",
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const telegramUser = await User.findOne({ telegramId });

        let user;

        if (telegramUser) {
            await User.findByIdAndUpdate(telegramUser._id, {
                fullName,
                mail: mail?.toLowerCase(),
                phone,
                status: 'active',
                password: hash,
            });
            
            user = await User.findById(telegramUser._id);
        } else {
            const doc = new User({
                password: hash,
                fullName,
                mail: mail?.toLowerCase(),
                phone,
                status: 'active',
            });
            user = await doc.save();
        }

        const accessToken = jwt.sign(
            { userId: user._id },
            process.env.SecretKey,
            {
                expiresIn: "30d",
            }
        );

        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.SecretKeyRefresh,
            {
                expiresIn: "30d",
            }
        );

        // Сохраняем текущий токен (одна сессия)
        await User.findByIdAndUpdate(user._id, {
            currentToken: accessToken,
            refreshToken: refreshToken,
        });

        const userData = {
            _id: user._id,
            fullName: user.fullName,
            phone: user.phone,
            mail: user.mail,
            role: user.role,
            status: user.status,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }

        res.json({ success: true, accessToken, refreshToken, userData });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Что-то пошло не так",
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log("login req.body: ", req.body);

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email и пароль обязательны",
            });
        }

        const candidate = await User.findOne({ mail: email?.toLowerCase() });

        if (!candidate) {
            console.log("login candidate is not found");
            return res.status(404).json({
                success: false,
                message: "Неверный логин или пароль",
            });
        }

        const isValidPass = await bcrypt.compare(
            password,
            candidate.password
        );

        if (!isValidPass) {
            console.log("login isValidPass is false");
            return res.status(404).json({
                success: false,
                message: "Неверный логин или пароль",
            });
        }

        if (candidate.status !== "active") {
            console.log("login candidate.status is not active");
            return res.status(403).json({
                success: false,
                message: "Ваш аккаунт заблокирован, свяжитесь с администратором",
            });
        }

        const userData = {
            _id: candidate._id,
            fullName: candidate.fullName,
            phone: candidate.phone,
            mail: candidate.mail,
            role: candidate.role,
            status: candidate.status,
            createdAt: candidate.createdAt,
            updatedAt: candidate.updatedAt,
        };

        // Создаем новый токен (это инвалидирует предыдущую сессию)
        const accessToken = jwt.sign(
            { userId: candidate._id },
            process.env.SecretKey,
            {
                expiresIn: "30d",
            }
        );

        const refreshToken = jwt.sign(
            { userId: candidate._id },
            process.env.SecretKeyRefresh,
            {
                expiresIn: "30d",
            }
        );

        // Обновляем токен в БД - старая сессия станет невалидной
        await User.findByIdAndUpdate(candidate._id, {
            currentToken: accessToken,
            refreshToken: refreshToken,
        });

        console.log("login successful, new session created");

        res.json({ success: true, accessToken, refreshToken, userData });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Не удалось авторизоваться",
        });
    }
};

// Получить всех пользователей (только для админа)
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password -currentToken -refreshToken")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: users,
            count: users.length,
        });
    } catch (error) {
        console.log("Ошибка в getAllUsers:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка получения пользователей",
        });
    }
};

// Получить пользователя по ID (только для админа)
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select("-password -currentToken -refreshToken");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Пользователь не найден",
            });
        }

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.log("Ошибка в getUserById:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка получения пользователя",
        });
    }
};

// Обновить пользователя (только для админа)
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Не позволяем обновлять пароль через этот метод
        delete updateData.password;
        delete updateData.currentToken;
        delete updateData.refreshToken;

        const user = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).select("-password -currentToken -refreshToken");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Пользователь не найден",
            });
        }

        res.json({
            success: true,
            data: user,
            message: "Пользователь обновлен",
        });
    } catch (error) {
        console.log("Ошибка в updateUser:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка обновления пользователя",
        });
    }
};

// Удалить пользователя (только для админа)
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Пользователь не найден",
            });
        }

        res.json({
            success: true,
            message: "Пользователь удален",
        });
    } catch (error) {
        console.log("Ошибка в deleteUser:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка удаления пользователя",
        });
    }
};

// Обновить профиль текущего пользователя
export const updateProfile = async (req, res) => {
    try {
        const { fullName, phone } = req.body;
        const userId = req.userId;

        const user = await User.findByIdAndUpdate(
            userId,
            { fullName, phone },
            { new: true, runValidators: true }
        ).select("-password -currentToken -refreshToken");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Пользователь не найден",
            });
        }

        res.json({
            success: true,
            data: user,
            message: "Профиль обновлен",
        });
    } catch (error) {
        console.log("Ошибка в updateProfile:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка обновления профиля",
        });
    }
};

// Изменить пароль
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.userId;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Необходимо указать текущий и новый пароль",
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Пользователь не найден",
            });
        }

        const isValidPass = await bcrypt.compare(currentPassword, user.password);

        if (!isValidPass) {
            return res.status(400).json({
                success: false,
                message: "Неверный текущий пароль",
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Новый пароль должен содержать минимум 6 символов",
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);

        await User.findByIdAndUpdate(userId, { password: hash });

        res.json({
            success: true,
            message: "Пароль успешно изменен",
        });
    } catch (error) {
        console.log("Ошибка в changePassword:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка изменения пароля",
        });
    }
};
