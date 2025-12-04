import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

type Role = "user" | "admin" | "content_manager" | "client_manager" | "manager";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: Role | Role[];
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-xl">Загрузка...</div>
            </div>
        );
    }

    // Проверка для админских страниц
    if (requiredRole) {
        const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        
        // Если пользователь не авторизован - редирект на /login
        if (!user) {
            return <Navigate to="/login" replace />;
        }
        
        // Если у пользователя нет нужной роли - редирект на главную
        if (!user.role || !allowedRoles.includes(user.role as Role)) {
            return <Navigate to="/" replace />;
        }
    }

    return <>{children}</>;
};

