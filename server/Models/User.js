import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    telegramId: {
        type: String,
    },
    saleBotId: {
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
        enum: ['user', 'admin'],
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
        },
    ],
    bonus: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['guest', 'registered', 'active'],
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
}, {
    timestamps: true
});

export default mongoose.model("User", UserSchema);