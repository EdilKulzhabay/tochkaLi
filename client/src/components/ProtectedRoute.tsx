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

    if (requiredRole) {
        const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        
        if (!user?.role || !allowedRoles.includes(user.role as Role)) {
            // Если требуется определенная роль и у пользователя её нет - редирект
            // return <Navigate to="/" replace />;
        }
    }

    return <>{children}</>;
};

