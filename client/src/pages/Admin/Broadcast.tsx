import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import api from '../../api';
import { toast } from 'react-toastify';
import { Send, TestTube, Users, MessageSquare } from 'lucide-react';

interface BroadcastStats {
    sent: number;
    failed: number;
    total: number;
}

export const BroadcastAdmin = () => {
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('all');
    const [loading, setLoading] = useState(false);
    const [userCount, setUserCount] = useState(0);
    const [lastStats, setLastStats] = useState<BroadcastStats | null>(null);

    useEffect(() => {
        fetchUserCount();
    }, [status]);

    const fetchUserCount = async () => {
        try {
            const response = await api.get('/api/broadcast/users', {
                params: { status: status }
            });
            setUserCount(response.data.count);
        } catch (error: any) {
            toast.error('Ошибка загрузки пользователей');
        }
    };

    const handleSendTest = async () => {
        if (!message.trim()) {
            toast.warning('Введите сообщение');
            return;
        }

        setLoading(true);
        try {
            await api.post('/api/broadcast/test', { message });
            toast.success('Тестовое сообщение отправлено вам в Telegram');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Ошибка отправки тестового сообщения');
        } finally {
            setLoading(false);
        }
    };

    const handleSendBroadcast = async () => {
        if (!message.trim()) {
            toast.warning('Введите сообщение');
            return;
        }

        if (userCount === 0) {
            toast.warning('Нет пользователей для рассылки');
            return;
        }

        const confirmText = status === 'all' 
            ? `Вы уверены, что хотите отправить сообщение всем ${userCount} пользователям?`
            : `Вы уверены, что хотите отправить сообщение ${userCount} пользователям со статусом "${getStatusLabel(status)}"?`;

        if (!confirm(confirmText)) return;

        setLoading(true);
        try {
            const response = await api.post('/api/broadcast/send', { 
                message,
                status: status === 'all' ? undefined : status
            });
            
            setLastStats({
                sent: response.data.sent,
                failed: response.data.failed,
                total: response.data.total
            });

            // if (response.data.sent > 0) {
            //     toast.success(`Рассылка завершена! Отправлено: ${response.data.sent}, Не удалось: ${response.data.failed}`);
            // } else {
            //     toast.warning('Не удалось отправить сообщения');
            // }

            // // Очищаем сообщение после успешной отправки
            // if (response.data.failed === 0) {
            //     setMessage('');
            // }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Ошибка отправки рассылки');
        } finally {
            setLoading(false);
        }
    };

    const getStatusLabel = (statusValue: string) => {
        switch (statusValue) {
            case 'guest': return 'Гость';
            case 'registered': return 'Зарегистрирован';
            case 'active': return 'Активен';
            default: return 'Все';
        }
    };

    const getStatusColor = (statusValue: string) => {
        switch (statusValue) {
            case 'guest': return 'bg-gray-100 text-gray-700';
            case 'registered': return 'bg-blue-100 text-blue-700';
            case 'active': return 'bg-green-100 text-green-700';
            default: return 'bg-purple-100 text-purple-700';
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Рассылка</h1>
                    <p className="text-gray-600 mt-1">Отправка сообщений пользователям через Telegram бота</p>
                </div>

                {/* Статистика последней рассылки */}
                {lastStats && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2">Результаты последней рассылки</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white p-3 rounded shadow-sm">
                                <div className="text-2xl font-bold text-green-600">{lastStats.sent}</div>
                                <div className="text-sm text-gray-600">Отправлено</div>
                            </div>
                            <div className="bg-white p-3 rounded shadow-sm">
                                <div className="text-2xl font-bold text-red-600">{lastStats.failed}</div>
                                <div className="text-sm text-gray-600">Ошибок</div>
                            </div>
                            <div className="bg-white p-3 rounded shadow-sm">
                                <div className="text-2xl font-bold text-blue-600">{lastStats.total}</div>
                                <div className="text-sm text-gray-600">Всего</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Форма рассылки */}
                <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                    {/* Фильтр по статусу */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2">
                            <Users size={18} />
                            Фильтр по статусу пользователей
                        </label>
                        <div className="grid grid-cols-4 gap-3">
                            {['all', 'guest', 'active'].map((statusOption) => (
                                <button
                                    key={statusOption}
                                    onClick={() => setStatus(statusOption)}
                                    className={`p-3 rounded-lg border-2 transition-all ${
                                        status === statusOption
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="text-center">
                                        <div className={`text-xs px-2 py-1 rounded inline-block ${getStatusColor(statusOption)}`}>
                                            {getStatusLabel(statusOption)}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            Количество получателей: <span className="font-semibold text-blue-600">{userCount}</span>
                        </p>
                    </div>

                    {/* Текст сообщения */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2">
                            <MessageSquare size={18} />
                            Сообщение для рассылки
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Введите текст сообщения. Поддерживается HTML форматирование (<b>, <i>, <u>, <a>)"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px] resize-y"
                            disabled={loading}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Поддерживается HTML: <code className="bg-gray-100 px-1">&lt;b&gt;</code> жирный, 
                            <code className="bg-gray-100 px-1 ml-1">&lt;i&gt;</code> курсив,
                            <code className="bg-gray-100 px-1 ml-1">&lt;u&gt;</code> подчеркнутый,
                            <code className="bg-gray-100 px-1 ml-1">&lt;a href=""&gt;</code> ссылка
                        </p>
                    </div>

                    {/* Кнопки действий */}
                    <div className="flex gap-3 pt-4 border-t">
                        {/* <button
                            onClick={handleSendTest}
                            disabled={loading || !message.trim()}
                            className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <TestTube size={20} />
                            Отправить тест себе
                        </button> */}
                        
                        <button
                            onClick={handleSendBroadcast}
                            disabled={loading || !message.trim() || userCount === 0}
                            className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-1"
                        >
                            <Send size={20} />
                            {loading ? 'Отправка...' : `Отправить рассылку (${userCount})`}
                        </button>
                    </div>
                </div>

                {/* Инструкция */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Важно</h3>
                    <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                        {/* <li>Убедитесь, что в переменных окружения сервера указан <code className="bg-yellow-100 px-1">TELEGRAM_BOT_TOKEN</code></li> */}
                        <li>Рассылка отправляется только пользователям, у которых есть привязанный Telegram аккаунт</li>
                        {/* <li>Перед массовой рассылкой рекомендуется отправить тестовое сообщение себе</li> */}
                        {/* <li>Скорость отправки ограничена (20 сообщений в секунду) для соблюдения лимитов Telegram API</li> */}
                    </ul>
                </div>
            </div>
        </AdminLayout>
    );
};

