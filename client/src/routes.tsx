import { createBrowserRouter } from "react-router-dom";
import { Login } from "./pages/Login";
import { Main } from "./pages/User/Main";
import { Main as AdminMain } from "./pages/Admin/Main";
import { Register } from "./pages/Register";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { FAQAdmin } from "./pages/Admin/FAQ";
import { HoroscopeAdmin } from "./pages/Admin/Horoscope";
import { MeditationAdmin } from "./pages/Admin/Meditation";
import { PracticeAdmin } from "./pages/Admin/Practice";
import { VideoLessonAdmin } from "./pages/Admin/VideoLesson";
import { ScheduleAdmin } from "./pages/Admin/Schedule";
import { TransitAdmin } from "./pages/Admin/Transit";
import { UsersAdmin } from "./pages/Admin/Users";
import { ProfileAdmin } from "./pages/Admin/Profile";
import { BroadcastAdmin } from "./pages/Admin/Broadcast";
import { RobokassaSuccess } from "./pages/Robokassa/Success";
import { RobokassaFail } from "./pages/Robokassa/Fail";

// Компонент-обертка для всех маршрутов
const RootLayout = ({ children }: { children: React.ReactNode }) => {
    return <AuthProvider>{children}</AuthProvider>;
};

export const routes = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout><ProtectedRoute><Main /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/login/:telegramId?/:saleBotId?/:telegramUserName?",
        element: <RootLayout><Login /></RootLayout>,
    },
    {
        path: "/register/:telegramId?/:saleBotId?/:telegramUserName?",
        element: <RootLayout><Register /></RootLayout>,
    },
    {
        path: "/admin",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><AdminMain /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/faq",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><FAQAdmin /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/horoscope",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><HoroscopeAdmin /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/meditation",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><MeditationAdmin /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/practice",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><PracticeAdmin /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/video-lesson",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><VideoLessonAdmin /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/schedule",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><ScheduleAdmin /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/transit",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><TransitAdmin /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/users",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><UsersAdmin /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/profile",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><ProfileAdmin /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/broadcast",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><BroadcastAdmin /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/robokassa_callback/success",
        element: <RootLayout><RobokassaSuccess /></RootLayout>,
    },
    {
        path: "/robokassa_callback/fail",
        element: <RootLayout><RobokassaFail /></RootLayout>,
    },
])