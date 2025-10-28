import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: "user" | "admin";
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
    const { user, loading } = useAuth();

    console.log("ProtectedRoute user: ", user);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-xl">Загрузка...</div>
            </div>
        );
    }

    // if (!user) {
    //     return <Navigate to="/login" replace />;
    // }

    // if (user && user?.role && user.role === "admin") {
    //     return <Navigate to="/admin" replace />;
    // }

    // if (user && user?.role && user.role === "user") {
    //     return <Navigate to="/" replace />;
    // }

    if (requiredRole && user?.role && user.role !== requiredRole) {
        // Если требуется определенная роль и у пользователя её нет - редирект
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

