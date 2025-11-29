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
import { UserForm } from "./pages/Admin/UserForm";
import { ProfileAdmin } from "./pages/Admin/Profile";
import { BroadcastAdmin } from "./pages/Admin/Broadcast";
import { RobokassaSuccess } from "./pages/Robokassa/Success";
import { RobokassaFail } from "./pages/Robokassa/Fail";
import { ClientPerfomance } from "./pages/User/ClientPerfomance";
import { ClientRegister } from "./pages/User/ClientRegister";
import { ClientLogin } from "./pages/User/ClientLogin";
import { About } from "./pages/User/About";
import { ClientFAQ } from "./pages/User/ClientFAQ";
import { ClientHoroscope } from "./pages/User/ClientHoroscope";
import { ClientHoroscopesList } from "./pages/User/ClientHoroscopesList";
import { ClientHoroscopeDetail } from "./pages/User/ClientHoroscopeDetail";
import { ClientTransit } from "./pages/User/ClientTransit";
import { ClientTransitsList } from "./pages/User/ClientTransitsList";
import { ClientTransitDetail } from "./pages/User/ClientTransitDetail";
import { ClientSchumann } from "./pages/User/ClientSchumann";
import { ClientContactUs } from "./pages/User/ClientContactUs";
import { ClientMeditationsList } from "./pages/User/ClientMeditationsList";
import { ClientMeditation } from "./pages/User/ClientMeditation";
import { ClientPracticesList } from "./pages/User/ClientPracticesList";
import { ClientPractice } from "./pages/User/ClientPractice";
import { ClientVideoLessonsList } from "./pages/User/ClientVideoLessonsList";
import { ClientVideoLesson } from "./pages/User/ClientVideoLesson";
import { ClientSchedule } from "./pages/User/ClientSchedule";
import { ClientDiary } from "./pages/User/ClientDiary";
import { ClientProfile } from "./pages/User/ClientProfile";
import { TelegramWebAppHandler } from "./components/TelegramWebAppHandler";

// Компонент-обертка для всех маршрутов
const RootLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <AuthProvider>
            <TelegramWebAppHandler />
            {children}
        </AuthProvider>
    );
};

export const routes = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout><Welcome /></RootLayout>,
    },
    {
        path: "/main",
        element: <RootLayout><ProtectedRoute><Main /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/client-performance",
        element: <RootLayout><ProtectedRoute><ClientPerfomance /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/client/register",
        element: <RootLayout><ProtectedRoute><ClientRegister /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/client/login",
        element: <RootLayout><ProtectedRoute><ClientLogin /></ProtectedRoute></RootLayout>,
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
        path: "/client/horoscopes",
        element: <RootLayout><ProtectedRoute><ClientHoroscopesList /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/client/horoscope/:id",
        element: <RootLayout><ProtectedRoute><ClientHoroscopeDetail /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/client/transit",
        element: <RootLayout><ProtectedRoute><ClientTransit /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/client/transits",
        element: <RootLayout><ProtectedRoute><ClientTransitsList /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/client/transit/:id",
        element: <RootLayout><ProtectedRoute><ClientTransitDetail /></ProtectedRoute></RootLayout>,
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
        path: "/client/diary",
        element: <RootLayout><ProtectedRoute><ClientDiary /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/client/profile",
        element: <RootLayout><ProtectedRoute><ClientProfile /></ProtectedRoute></RootLayout>,
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
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "content_manager", "client_manager", "manager"]}><AdminMain /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/faq",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "content_manager", "manager"]}><FAQAdmin /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/faq/create",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "content_manager", "manager"]}><FAQForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/faq/edit/:id",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "content_manager", "manager"]}><FAQForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/horoscope",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "content_manager", "manager"]}><HoroscopeAdmin /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/horoscope/create",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "content_manager", "manager"]}><HoroscopeForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/horoscope/edit/:id",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "content_manager", "manager"]}><HoroscopeForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/meditation",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "content_manager", "manager"]}><MeditationAdmin /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/meditation/create",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "content_manager", "manager"]}><MeditationForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/meditation/edit/:id",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "content_manager", "manager"]}><MeditationForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/practice",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "content_manager", "manager"]}><PracticeAdmin /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/practice/create",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "content_manager", "manager"]}><PracticeForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/practice/edit/:id",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "content_manager", "manager"]}><PracticeForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/video-lesson",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "content_manager", "manager"]}><VideoLessonAdmin /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/video-lesson/create",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "content_manager", "manager"]}><VideoLessonForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/video-lesson/edit/:id",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "content_manager", "manager"]}><VideoLessonForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/schedule",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "content_manager", "manager"]}><ScheduleAdmin /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/schedule/create",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "content_manager", "manager"]}><ScheduleForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/schedule/edit/:id",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "content_manager", "manager"]}><ScheduleForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/transit",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "content_manager", "manager"]}><TransitAdmin /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/transit/create",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "content_manager", "manager"]}><TransitForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/transit/edit/:id",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "content_manager", "manager"]}><TransitForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/dynamic-content",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "content_manager", "manager"]}><DynamicContentAdmin /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/dynamic-content/create",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "content_manager", "manager"]}><DynamicContentForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/dynamic-content/edit/:id",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "content_manager", "manager"]}><DynamicContentForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/welcome",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "content_manager", "manager"]}><WelcomeAdmin /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/welcome/create",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "content_manager", "manager"]}><WelcomeForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/welcome/edit/:id",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "content_manager", "manager"]}><WelcomeForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/about-club",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "content_manager", "manager"]}><AboutClubAdmin /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/about-club/create",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "content_manager", "manager"]}><AboutClubForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/about-club/edit/:id",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "content_manager", "manager"]}><AboutClubForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/schumann",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "content_manager", "manager"]}><SchumannAdmin /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/schumann/create",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "content_manager", "manager"]}><SchumannForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/schumann/edit/:id",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "content_manager", "manager"]}><SchumannForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/users",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "client_manager", "manager"]}><UsersAdmin /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/users/create",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "client_manager", "manager"]}><UserForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/users/edit/:id",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "client_manager", "manager"]}><UserForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/profile",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "content_manager", "client_manager", "manager"]}><ProfileAdmin /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/broadcast",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "client_manager", "manager"]}><BroadcastAdmin /></ProtectedRoute></RootLayout>,
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