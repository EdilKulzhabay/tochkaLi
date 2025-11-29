import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

interface User {
    _id: string;
    fullName: string;
    telegramUserName: string;
    phone: string;
    mail: string;
    role: string;
    status: string;
    hasPaid?: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (fullName: string, email: string, phone: string, telegramId?: string) => Promise<void>;
    logout: () => void;
    checkSession: () => Promise<boolean>;
    updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Проверка валидности токена при загрузке
    useEffect(() => {
        checkAuth();
    }, []);

    // Периодическая проверка валидности токена (каждые 5 минут)
    useEffect(() => {
        const interval = setInterval(() => {
            checkSession();
        }, 5 * 60 * 1000); // 5 минут

        return () => clearInterval(interval);
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem("token");
        
        // Сначала пытаемся загрузить user из localStorage
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                const userFromStorage = JSON.parse(userStr);
                // Проверяем, что user не null и не пустой объект
                if (userFromStorage && userFromStorage !== null && Object.keys(userFromStorage).length > 0) {
                    setUser(userFromStorage);
                }
            } catch (e) {
                console.error("Ошибка парсинга user из localStorage:", e);
            }
        }
        
        // Если нет токена, не удаляем user из localStorage (может быть пользователь из Telegram)
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await api.get("/api/user/me");
            if (response.data.success) {
                setUser(response.data.user);
                // Сохраняем актуальные данные в localStorage
                localStorage.setItem("user", JSON.stringify(response.data.user));
            } else {
                // Если запрос успешен, но success = false, удаляем только токены
                setUser(null);
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                // НЕ удаляем user, так как он может быть нужен для Telegram пользователей
                // localStorage.removeItem("user");
            }
        } catch (error: any) {
            console.log("Ошибка проверки авторизации:", error);
            // Очищаем данные только если это действительно ошибка авторизации
            if (error.response?.status === 403 || error.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                // НЕ удаляем user, так как он может быть нужен для Telegram пользователей
                // localStorage.removeItem("user");
                setUser(null);
            }
            // Если это другая ошибка (сеть, таймаут), оставляем данные из localStorage
        } finally {
            setLoading(false);
        }
    };

    const checkSession = async (): Promise<boolean> => {
        const token = localStorage.getItem("token");
        
        if (!token) {
            return false;
        }

        try {
            const response = await api.get("/api/user/check-session");
            return response.data.success;
        } catch (error: any) {
            // Если сессия истекла, очищаем данные, но не делаем редирект здесь
            // Редирект будет обработан в компонентах через ProtectedRoute
            if (error.response?.data?.sessionExpired) {
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                // Не удаляем user для Telegram пользователей (если есть telegramId, но нет токена)
                const telegramId = localStorage.getItem("telegramId");
                if (!telegramId) {
                    localStorage.removeItem("user");
                    setUser(null);
                }
            }
            return false;
        }
    };

    const login = async (email: string, password: string) => {
        const response = await api.post("/api/user/login", { email, password });
        
        if (response.data.success) {
            localStorage.setItem("token", response.data.accessToken);
            localStorage.setItem("refreshToken", response.data.refreshToken);
            setUser(response.data.userData);
            localStorage.setItem("user", JSON.stringify(response.data.userData));
            
            // Проверяем сохраненный путь для редиректа
            const redirectPath = localStorage.getItem("redirectAfterLogin");
            if (redirectPath) {
                localStorage.removeItem("redirectAfterLogin");
                navigate(redirectPath);
            } else {
                // Редирект в зависимости от роли
                if (response.data.userData.role === "admin") {
                    navigate("/admin");
                } else {
                    navigate("/main");
                }
            }
        } else {
            throw new Error(response.data.message || "Ошибка авторизации");
        }
    };

    const register = async (fullName: string, email: string, phone: string, telegramId?: string) => {
        const response = await api.post("/api/user/register", { 
            fullName, 
            mail: email, 
            phone, 
            ...(telegramId && { telegramId })
        });
        
        if (response.data.success) {
            localStorage.setItem("token", response.data.accessToken);
            localStorage.setItem("refreshToken", response.data.refreshToken);
            setUser(response.data.userData);
            localStorage.setItem("user", JSON.stringify(response.data.userData));
            
            // Проверяем сохраненный путь для редиректа
            const redirectPath = localStorage.getItem("redirectAfterLogin");
            if (redirectPath) {
                localStorage.removeItem("redirectAfterLogin");
                navigate(redirectPath);
            } else {
                // Редирект в зависимости от роли
                if (response.data.userData.role === "admin") {
                    navigate("/admin");
                } else {
                    navigate("/main");
                }
            }
        } else {
            throw new Error(response.data.message || "Ошибка регистрации");
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/login");
    };

    // Метод для обновления пользователя в контексте
    const updateUser = (userData: User) => {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, checkSession, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth должен использоваться внутри AuthProvider");
    }
    return context;
};

