import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    telegramId: {
        type: String,
    },
    telegramUserName: {
        type: String,
        default: '',
    },
    mail: {
        type: String,
    },
    password: {
        type: String,
    },
    fullName: {
        type: String,
    },
    userName: {
        type: String,
    },
    phone: {
        type: String,
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'content_manager', 'client_manager', 'manager'],
        default: 'user'
    },
    products: [
        {
            productId: {
                type: String,
                required: true,
            },
            type: {
                type: String,
                enum: ['subscription', 'one-time', 'free'],
                required: true,
            },
            paymentDate: {
                type: Date,
                default: null,
            },
            paymentAmount: {
                type: Number,
                default: 0,
            },
            invoiceId: {
                type: String,
                default: null,
            },
            paymentStatus: {
                type: String,
                enum: ['pending', 'paid', 'failed'],
                default: 'pending',
            },
        },
    ],
    bonus: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['guest', 'registered', 'active', 'client'],
        default: 'guest',
    },
    currentToken: {
        type: String,
        default: null,
    },
    refreshToken: {
        type: String,
        default: null,
    },
    // Поля для отслеживания оплаты через Robokassa
    hasPaid: {
        type: Boolean,
        default: false,
    },
    paymentDate: {
        type: Date,
        default: null,
    },
    paymentAmount: {
        type: Number,
        default: 0,
    },
    invoiceId: {
        type: String,
        default: null,
    },
    emailConfirmed: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true
});

export default mongoose.model("User", UserSchema);