import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

interface User {
    _id: string;
    fullName: string;
    phone: string;
    mail: string;
    role: string;
    status: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string, telegramId: string, saleBotId: string, telegramUserName: string) => Promise<void>;
    register: (fullName: string, email: string, phone: string, password: string, telegramId: string, saleBotId: string, telegramUserName: string) => Promise<void>;
    logout: () => void;
    checkSession: () => Promise<boolean>;
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
        
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await api.get("/api/user/me");
            if (response.data.success) {
                setUser(response.data.user);
            }
        } catch (error) {
            console.log("Ошибка проверки авторизации:", error);
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            setUser(null);
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
            if (error.response?.data?.sessionExpired) {
                logout();
                navigate("/login");
            }
            return false;
        }
    };

    const login = async (email: string, password: string, telegramId: string, saleBotId: string, telegramUserName: string) => {
        const response = await api.post("/api/user/login", { email, password, telegramId, saleBotId, telegramUserName });
        
        if (response.data.success) {
            localStorage.setItem("token", response.data.accessToken);
            localStorage.setItem("refreshToken", response.data.refreshToken);
            setUser(response.data.userData);
            
            // Редирект в зависимости от роли
            if (response.data.userData.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/");
            }
        } else {
            throw new Error(response.data.message || "Ошибка авторизации");
        }
    };

    const register = async (fullName: string, email: string, phone: string, password: string, telegramId: string, saleBotId: string, telegramUserName: string) => {
        const response = await api.post("/api/user/register", { 
            fullName, 
            mail: email, 
            phone, 
            password,
            telegramId,
            saleBotId,
            telegramUserName
        });
        
        if (response.data.success) {
            localStorage.setItem("token", response.data.accessToken);
            localStorage.setItem("refreshToken", response.data.refreshToken);
            setUser(response.data.userData);
            
            // Редирект в зависимости от роли
            if (response.data.userData.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/");
            }
        } else {
            throw new Error(response.data.message || "Ошибка регистрации");
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        setUser(null);
        navigate("/login");
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, checkSession }}>
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

