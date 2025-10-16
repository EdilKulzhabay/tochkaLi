import { AdminLayout } from '../../components/AdminLayout';
import { 
    HelpCircle, 
    Star, 
    Sunset, 
    Dumbbell, 
    Video, 
    Calendar, 
    Sparkles,
    Users,
    User
} from 'lucide-react';
import { Link } from 'react-router-dom';

const mainCards = [
    { title: 'Пользователи', icon: Users, path: '/admin/users', color: 'bg-cyan-500', description: 'Управление пользователями' },
    { title: 'Профиль', icon: User, path: '/admin/profile', color: 'bg-slate-500', description: 'Настройки профиля' },
];

const contentCards = [
    { title: 'FAQ', icon: HelpCircle, path: '/admin/faq', color: 'bg-blue-500', description: 'Вопросы и ответы' },
    { title: 'Гороскопы', icon: Star, path: '/admin/horoscope', color: 'bg-purple-500', description: 'Астрологические прогнозы' },
    { title: 'Медитации', icon: Sunset, path: '/admin/meditation', color: 'bg-orange-500', description: 'Практики медитации' },
    { title: 'Практики', icon: Dumbbell, path: '/admin/practice', color: 'bg-green-500', description: 'Духовные практики' },
    { title: 'Видео уроки', icon: Video, path: '/admin/video-lesson', color: 'bg-red-500', description: 'Обучающие видео' },
    { title: 'Расписание', icon: Calendar, path: '/admin/schedule', color: 'bg-indigo-500', description: 'События и вебинары' },
    { title: 'Транзиты', icon: Sparkles, path: '/admin/transit', color: 'bg-pink-500', description: 'Планетарные транзиты' },
];

export const Main = () => {
    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Добро пожаловать в админ-панель</h1>
                    <p className="text-gray-600 mt-2">Выберите раздел для управления контентом</p>
                </div>

                {/* Основные разделы */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Основные разделы</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {mainCards.map((card) => {
                            const Icon = card.icon;
                            return (
                                <Link
                                    key={card.path}
                                    to={card.path}
                                    className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all hover:-translate-y-1"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`${card.color} p-3 rounded-lg text-white`}>
                                            <Icon size={32} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">{card.title}</h2>
                                            <p className="text-gray-500 text-sm mt-1">{card.description}</p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Управление контентом */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Управление контентом</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {contentCards.map((card) => {
                            const Icon = card.icon;
                            return (
                                <Link
                                    key={card.path}
                                    to={card.path}
                                    className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all hover:-translate-y-1"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`${card.color} p-3 rounded-lg text-white`}>
                                            <Icon size={32} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">{card.title}</h2>
                                            <p className="text-gray-500 text-sm mt-1">{card.description}</p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};