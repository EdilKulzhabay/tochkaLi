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
import { ModalNotificationsAdmin } from "./pages/Admin/ModalNotifications";
import { AdminsAdmin } from "./pages/Admin/Admins";
import { AdminForm } from "./pages/Admin/AdminForm";
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
import { BlockedUser } from "./pages/User/BlockedUser";
import { BlockedBrowser } from "./pages/User/BlockedBrowser";
import { EaseLaunch } from "./pages/User/EaseLaunch";
import { TelegramGuard } from "./components/TelegramGuard";

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
        element: <RootLayout><TelegramGuard><Welcome /></TelegramGuard></RootLayout>,
    },
    {
        path: "/main",
        element: <RootLayout><TelegramGuard><ProtectedRoute><Main /></ProtectedRoute></TelegramGuard></RootLayout>,
    },
    {
        path: "/client-performance",
        element: <RootLayout><TelegramGuard><ProtectedRoute><ClientPerfomance /></ProtectedRoute></TelegramGuard></RootLayout>,
    },
    {
        path: "/client/register",
        element: <RootLayout><TelegramGuard><ProtectedRoute><ClientRegister /></ProtectedRoute></TelegramGuard></RootLayout>,
    },
    {
        path: "/client/login",
        element: <RootLayout><TelegramGuard><ProtectedRoute><ClientLogin /></ProtectedRoute></TelegramGuard></RootLayout>,
    },
    {
        path: "/about",
        element: <RootLayout><TelegramGuard><ProtectedRoute><About /></ProtectedRoute></TelegramGuard></RootLayout>,
    },
    {
        path: "/client/faq",
        element: <RootLayout><TelegramGuard><ProtectedRoute><ClientFAQ /></ProtectedRoute></TelegramGuard></RootLayout>,
    },
    {
        path: "/client/horoscope",
        element: <RootLayout><TelegramGuard><ProtectedRoute><ClientHoroscope /></ProtectedRoute></TelegramGuard></RootLayout>,
    },
    {
        path: "/client/horoscopes",
        element: <RootLayout><TelegramGuard><ProtectedRoute><ClientHoroscopesList /></ProtectedRoute></TelegramGuard></RootLayout>,
    },
    {
        path: "/client/horoscope/:id",
        element: <RootLayout><TelegramGuard><ProtectedRoute><ClientHoroscopeDetail /></ProtectedRoute></TelegramGuard></RootLayout>,
    },
    {
        path: "/client/transit",
        element: <RootLayout><TelegramGuard><ProtectedRoute><ClientTransit /></ProtectedRoute></TelegramGuard></RootLayout>,
    },
    {
        path: "/client/transits",
        element: <RootLayout><TelegramGuard><ProtectedRoute><ClientTransitsList /></ProtectedRoute></TelegramGuard></RootLayout>,
    },
    {
        path: "/client/transit/:id",
        element: <RootLayout><TelegramGuard><ProtectedRoute><ClientTransitDetail /></ProtectedRoute></TelegramGuard></RootLayout>,
    },
    {
        path: "/client/schumann",
        element: <RootLayout><TelegramGuard><ProtectedRoute><ClientSchumann /></ProtectedRoute></TelegramGuard></RootLayout>,
    },
    {
        path: "/client/contactus",
        element: <RootLayout><TelegramGuard><ProtectedRoute><ClientContactUs /></ProtectedRoute></TelegramGuard></RootLayout>,
    },
    {
        path: "/client/meditations",
        element: <RootLayout><TelegramGuard><ProtectedRoute><ClientMeditationsList /></ProtectedRoute></TelegramGuard></RootLayout>,
    },
    {
        path: "/client/meditation/:id",
        element: <RootLayout><TelegramGuard><ProtectedRoute><ClientMeditation /></ProtectedRoute></TelegramGuard></RootLayout>,
    },
    {
        path: "/client/practices",
        element: <RootLayout><TelegramGuard><ProtectedRoute><ClientPracticesList /></ProtectedRoute></TelegramGuard></RootLayout>,
    },
    {
        path: "/client/practice/:id",
        element: <RootLayout><TelegramGuard><ProtectedRoute><ClientPractice /></ProtectedRoute></TelegramGuard></RootLayout>,
    },
    {
        path: "/client/video-lessons",
        element: <RootLayout><TelegramGuard><ProtectedRoute><ClientVideoLessonsList /></ProtectedRoute></TelegramGuard></RootLayout>,
    },
    {
        path: "/client/video-lesson/:id",
        element: <RootLayout><TelegramGuard><ProtectedRoute><ClientVideoLesson /></ProtectedRoute></TelegramGuard></RootLayout>,
    },
    {
        path: "/client/schedule",
        element: <RootLayout><TelegramGuard><ProtectedRoute><ClientSchedule /></ProtectedRoute></TelegramGuard></RootLayout>,
    },
    {
        path: "/client/diary",
        element: <RootLayout><TelegramGuard><ProtectedRoute><ClientDiary /></ProtectedRoute></TelegramGuard></RootLayout>,
    },
    {
        path: "/client/profile",
        element: <RootLayout><TelegramGuard><ProtectedRoute><ClientProfile /></ProtectedRoute></TelegramGuard></RootLayout>,
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
        path: "/client/ease-launch",
        element: <RootLayout><TelegramGuard><ProtectedRoute><EaseLaunch /></ProtectedRoute></TelegramGuard></RootLayout>,
    },
    {
        path: "/client/blocked-user",
        element: <RootLayout><TelegramGuard><ProtectedRoute><BlockedUser /></ProtectedRoute></TelegramGuard></RootLayout>,
    },
    {
        path: "/client/blocked-browser",
        element: <RootLayout><BlockedBrowser /></RootLayout>,
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
        path: "/admin/modal-notifications",
        element: <RootLayout><ProtectedRoute requiredRole={["admin", "client_manager", "manager"]}><ModalNotificationsAdmin /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/admins",
        element: <RootLayout><ProtectedRoute requiredRole={["admin"]}><AdminsAdmin /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/admins/create",
        element: <RootLayout><ProtectedRoute requiredRole={["admin"]}><AdminForm /></ProtectedRoute></RootLayout>,
    },
    {
        path: "/admin/admins/edit/:id",
        element: <RootLayout><ProtectedRoute requiredRole={["admin"]}><AdminForm /></ProtectedRoute></RootLayout>,
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