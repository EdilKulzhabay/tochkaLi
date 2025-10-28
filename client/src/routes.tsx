import { createBrowserRouter } from "react-router-dom";
import { Login } from "./pages/Login";
import { Main } from "./pages/User/Main";
import { Main as AdminMain } from "./pages/Admin/Main";
import { Register } from "./pages/Register";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { FAQAdmin } from "./pages/Admin/FAQ";
import { FAQForm } from "./pages/Admin/FAQForm";
import { HoroscopeAdmin } from "./pages/Admin/Horoscope";
import { HoroscopeForm } from "./pages/Admin/HoroscopeForm";
import { MeditationAdmin } from "./pages/Admin/Meditation";
import { MeditationForm } from "./pages/Admin/MeditationForm";
import { PracticeAdmin } from "./pages/Admin/Practice";
import { PracticeForm } from "./pages/Admin/PracticeForm";
import { VideoLessonAdmin } from "./pages/Admin/VideoLesson";
import { VideoLessonForm } from "./pages/Admin/VideoLessonForm";
import { ScheduleAdmin } from "./pages/Admin/Schedule";
import { ScheduleForm } from "./pages/Admin/ScheduleForm";
import { TransitAdmin } from "./pages/Admin/Transit";
import { TransitForm } from "./pages/Admin/TransitForm";
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
        path: "/:telegramId?/:saleBotId?/:telegramUserName?/:phone?",
        element: <RootLayout><ProtectedRoute><Main /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/login",
        element: <RootLayout><Login /></RootLayout>,
    },
    {
        path: "/register",
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
        path: "/admin/faq/create",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><FAQForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/faq/edit/:id",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><FAQForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/horoscope",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><HoroscopeAdmin /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/horoscope/create",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><HoroscopeForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/horoscope/edit/:id",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><HoroscopeForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/meditation",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><MeditationAdmin /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/meditation/create",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><MeditationForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/meditation/edit/:id",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><MeditationForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/practice",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><PracticeAdmin /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/practice/create",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><PracticeForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/practice/edit/:id",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><PracticeForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/video-lesson",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><VideoLessonAdmin /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/video-lesson/create",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><VideoLessonForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/video-lesson/edit/:id",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><VideoLessonForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/schedule",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><ScheduleAdmin /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/schedule/create",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><ScheduleForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/schedule/edit/:id",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><ScheduleForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/transit",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><TransitAdmin /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/transit/create",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><TransitForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/transit/edit/:id",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><TransitForm /></ProtectedRoute></RootLayout>,
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