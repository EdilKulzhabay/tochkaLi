import crypto from 'crypto';
import User from '../Models/User.js';

export const handleResult = async (req, res) => {
    try {
        console.log("handleResult req.body:", req.body);
        res.status(200).json({
            success: true,
            message: "Результат оплаты обработан успешно",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Не удалось обработать результат оплаты",
        });
    }
}

export const handleSuccess = async (req, res) => {
    try {
        console.log("handleSuccess req.body:", req.body);
        res.status(200).json({
            success: true,
            message: "Страница успешной оплаты",
        });
    } catch (error) {
        console.log(error);
    }
}

export const handleFail = async (req, res) => {
    try {
        console.log("handleFail req.body:", req.body);
        res.status(200).json({
            success: true,
            message: "Страница неудачной оплаты",
        });
    } catch (error) {
        console.log(error);
    }
}