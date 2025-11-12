import { createBrowserRouter } from "react-router-dom";
import { Login } from "./pages/Login";
import { Welcome } from "./pages/User/Welcome";
import { Main } from "./pages/User/Main";
import { Main as AdminMain } from "./pages/Admin/Main";
import { Register } from "./pages/Register";
import { ProtectedRoute } from "./components/ProtectedRoute.tsx";
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
import { DynamicContentAdmin } from "./pages/Admin/DynamicContent";
import { DynamicContentForm } from "./pages/Admin/DynamicContentForm";
import { WelcomeAdmin } from "./pages/Admin/Welcome";
import { WelcomeForm } from "./pages/Admin/WelcomeForm";
import { AboutClubAdmin } from "./pages/Admin/AboutClub";
import { AboutClubForm } from "./pages/Admin/AboutClubForm";
import { SchumannAdmin } from "./pages/Admin/Schumann";
import { SchumannForm } from "./pages/Admin/SchumannForm";
import { UsersAdmin } from "./pages/Admin/Users";
import { ProfileAdmin } from "./pages/Admin/Profile";
import { BroadcastAdmin } from "./pages/Admin/Broadcast";
import { RobokassaSuccess } from "./pages/Robokassa/Success";
import { RobokassaFail } from "./pages/Robokassa/Fail";
import { About } from "./pages/User/About";
import { ClientFAQ } from "./pages/User/ClientFAQ";
import { ClientHoroscope } from "./pages/User/ClientHoroscope";
import { ClientTransit } from "./pages/User/ClientTransit";
import { ClientSchumann } from "./pages/User/ClientSchumann";
import { ClientContactUs } from "./pages/User/ClientContactUs";
import { ClientMeditationsList } from "./pages/User/ClientMeditationsList";
import { ClientMeditation } from "./pages/User/ClientMeditation";
import { ClientPracticesList } from "./pages/User/ClientPracticesList";
import { ClientPractice } from "./pages/User/ClientPractice";
import { ClientVideoLessonsList } from "./pages/User/ClientVideoLessonsList";
import { ClientVideoLesson } from "./pages/User/ClientVideoLesson";
import { ClientSchedule } from "./pages/User/ClientSchedule";

// Компонент-обертка для всех маршрутов
const RootLayout = ({ children }: { children: React.ReactNode }) => {
    return <AuthProvider>{children}</AuthProvider>;
};

export const routes = createBrowserRouter([
    {
        path: "/:telegramId?/:saleBotId?/:telegramUserName?/:phone?",
        element: <RootLayout><ProtectedRoute><Welcome /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/main",
        element: <RootLayout><ProtectedRoute><Main /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/about",
        element: <RootLayout><ProtectedRoute><About /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/client/faq",
        element: <RootLayout><ProtectedRoute><ClientFAQ /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/client/horoscope",
        element: <RootLayout><ProtectedRoute><ClientHoroscope /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/client/transit",
        element: <RootLayout><ProtectedRoute><ClientTransit /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/client/schumann",
        element: <RootLayout><ProtectedRoute><ClientSchumann /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/client/contactus",
        element: <RootLayout><ProtectedRoute><ClientContactUs /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/client/meditations",
        element: <RootLayout><ProtectedRoute><ClientMeditationsList /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/client/meditation/:id",
        element: <RootLayout><ProtectedRoute><ClientMeditation /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/client/practices",
        element: <RootLayout><ProtectedRoute><ClientPracticesList /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/client/practice/:id",
        element: <RootLayout><ProtectedRoute><ClientPractice /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/client/video-lessons",
        element: <RootLayout><ProtectedRoute><ClientVideoLessonsList /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/client/video-lesson/:id",
        element: <RootLayout><ProtectedRoute><ClientVideoLesson /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/client/schedule",
        element: <RootLayout><ProtectedRoute><ClientSchedule /></ProtectedRoute></RootLayout>,
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
        path: "/admin/dynamic-content",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><DynamicContentAdmin /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/dynamic-content/create",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><DynamicContentForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/dynamic-content/edit/:id",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><DynamicContentForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/welcome",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><WelcomeAdmin /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/welcome/create",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><WelcomeForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/welcome/edit/:id",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><WelcomeForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/about-club",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><AboutClubAdmin /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/about-club/create",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><AboutClubForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/about-club/edit/:id",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><AboutClubForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/schumann",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><SchumannAdmin /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/schumann/create",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><SchumannForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/schumann/edit/:id",
        element: <RootLayout><ProtectedRoute requiredRole="admin"><SchumannForm /></ProtectedRoute></RootLayout>,
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