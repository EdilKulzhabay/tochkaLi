import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MyInput } from "../components/MyInput";
import { toast } from "react-toastify";
import { MyButton } from "../components/MyButton";
import { useAuth } from "../contexts/AuthContext";

export const Login = () => {
    const { telegramId = "", saleBotId = "", telegramUserName = "" } = useParams();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            toast.error("Заполните все поля");
            return;
        }

        try {
            setLoading(true);
            await login(email, password, telegramId, saleBotId, telegramUserName);
            toast.success("Вход выполнен успешно!");
        } catch (error: any) {
            toast.error(error.response?.data?.message || error.message || "Ошибка входа");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <div className="flex flex-col items-center bg-white p-10 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold">Авторизация</h1>
                <MyInput 
                    label="Email" 
                    type="text" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="Введите ваш email"
                />
                <MyInput 
                    label="Password" 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Введите ваш пароль"
                />
                <Link 
                    to={telegramId && saleBotId && telegramUserName 
                        ? `/register/${telegramId}/${saleBotId}/${telegramUserName}` 
                        : "/register"
                    } 
                    className="text-blue-500 hover:underline my-4"
                >
                    Нет аккаунта? Зарегистрируйтесь
                </Link>
                <MyButton 
                    text={loading ? "Вход..." : "Войти"} 
                    onClick={handleLogin} 
                    className="mt-4"
                    disabled={loading}
                />
            </div>
        </div>
    )
}