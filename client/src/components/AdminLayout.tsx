import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
    HelpCircle, 
    Star, 
    Sunset, 
    Dumbbell, 
    Video, 
    Calendar, 
    Sparkles,
    LogOut,
    User,
    Home,
    Users,
    Send
} from 'lucide-react';

interface AdminLayoutProps {
    children: ReactNode;
}

const menuItems = [
    { path: '/admin', label: 'Главная', icon: Home },
    { path: '/admin/users', label: 'Пользователи', icon: Users },
    { path: '/admin/broadcast', label: 'Рассылка', icon: Send },
    { path: '/admin/profile', label: 'Профиль', icon: User },
    { path: '', label: '', icon: null, divider: true }, // Разделитель
    { path: '/admin/faq', label: 'FAQ', icon: HelpCircle },
    { path: '/admin/horoscope', label: 'Гороскопы', icon: Star },
    { path: '/admin/meditation', label: 'Медитации', icon: Sunset },
    { path: '/admin/practice', label: 'Практики', icon: Dumbbell },
    { path: '/admin/video-lesson', label: 'Видео уроки', icon: Video },
    { path: '/admin/schedule', label: 'Расписание', icon: Calendar },
    { path: '/admin/transit', label: 'Транзиты', icon: Sparkles },
];

export const AdminLayout = ({ children }: AdminLayoutProps) => {
    const location = useLocation();
    const { user, logout } = useAuth();

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-lg">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold text-blue-600">Админ панель</h1>
                    <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
                        <User size={16} />
                        <span>{user?.fullName}</span>
                    </div>
                </div>
                
                <nav className="p-4">
                    <ul className="space-y-2">
                        {menuItems.map((item, index) => {
                            // Разделитель
                            if (item.divider) {
                                return <li key={`divider-${index}`} className="my-4 border-t border-gray-200"></li>;
                            }

                            const Icon = item.icon;
                            const isActive = location.pathname === item.path || 
                                (item.path !== '/admin' && location.pathname.startsWith(item.path));
                            
                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                            isActive
                                                ? 'bg-blue-50 text-blue-600 font-medium'
                                                : 'text-gray-700 hover:bg-gray-100 hover:cursor-pointer'
                                        }`}
                                    >
                                        {Icon && <Icon size={20} />}
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="w-64 p-4 border-t">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-gray-700 hover:bg-gray-100 hover:cursor-pointer rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        <span>Выйти</span>
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

