import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/Admin/AdminLayout';
import api from '../../api';
import { toast } from 'react-toastify';
import { Send, Users, MessageSquare, Search, X } from 'lucide-react';
import { RichTextEditor } from '../../components/Admin/RichTextEditor';

interface BroadcastStats {
    sent: number;
    failed: number;
    total: number;
}

interface User {
    _id: string;
    fullName: string;
    userName?: string;
    telegramUserName?: string;
    phone?: string;
    status: string;
}

export const BroadcastAdmin = () => {
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [userCount, setUserCount] = useState(0);
    const [foundUsers, setFoundUsers] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [lastStats, setLastStats] = useState<BroadcastStats | null>(null);

    const fetchUserCount = async () => {
        try {
            const response = await api.get('/api/broadcast/users', {
                params: { 
                    status: status
                }
            });
            setUserCount(response.data.count);
        } catch (error: any) {
            toast.error('Ошибка загрузки пользователей');
        }
    };

    useEffect(() => {
        fetchUserCount();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    const handleSearch = async () => {
        if (!search.trim()) {
            toast.warning('Введите текст для поиска');
            return;
        }

        setSearchLoading(true);
        try {
            const response = await api.get('/api/broadcast/users', {
                params: { 
                    status: status,
                    search: search 
                }
            });
            setFoundUsers(response.data.data || []);
            if (response.data.data.length === 0) {
                toast.info('Пользователи не найдены');
            } else {
                toast.success(`Найдено пользователей: ${response.data.data.length}`);
            }
        } catch (error: any) {
            toast.error('Ошибка поиска пользователей');
        } finally {
            setSearchLoading(false);
        }
    };

    const handleClearSearch = () => {
        setSearch('');
        setFoundUsers([]);
        setSelectedUsers(new Set());
    };

    const toggleUserSelection = (userId: string) => {
        const newSelected = new Set(selectedUsers);
        if (newSelected.has(userId)) {
            newSelected.delete(userId);
        } else {
            newSelected.add(userId);
        }
        setSelectedUsers(newSelected);
    };

    const toggleAllUsers = () => {
        if (selectedUsers.size === foundUsers.length) {
            setSelectedUsers(new Set());
        } else {
            setSelectedUsers(new Set(foundUsers.map(u => u._id)));
        }
    };

    const handleSendBroadcast = async () => {
        if (!message.trim()) {
            toast.warning('Введите сообщение');
            return;
        }

        // Если есть выбранные пользователи из поиска
        if (selectedUsers.size > 0) {
            const confirmText = `Вы уверены, что хотите отправить сообщение ${selectedUsers.size} выбранным пользователям?`;
            if (!confirm(confirmText)) return;

            setLoading(true);
            try {
                const response = await api.post('/api/broadcast/send', { 
                    message,
                    userIds: Array.from(selectedUsers)
                });
                
                setLastStats({
                    sent: response.data.sent,
                    failed: response.data.failed,
                    total: response.data.total
                });

                toast.success('Рассылка завершена!');
                setFoundUsers([]);
                setSelectedUsers(new Set());
                setSearch('');
            } catch (error: any) {
                toast.error(error.response?.data?.message || 'Ошибка отправки рассылки');
            } finally {
                setLoading(false);
            }
            return;
        }

        // Иначе отправляем всем по фильтру статуса
        if (userCount === 0) {
            toast.warning('Нет пользователей для рассылки');
            return;
        }

        let confirmText = `Вы уверены, что хотите отправить сообщение ${userCount} пользователям?`;
        
        if (status !== 'all') {
            confirmText = `Вы уверены, что хотите отправить сообщение ${userCount} пользователям со статусом "${getStatusLabel(status)}"?`;
        }

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

            toast.success('Рассылка завершена!');
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
            case 'client': return 'Клиент';
            default: return 'Все';
        }
    };

    const getStatusColor = (statusValue: string) => {
        switch (statusValue) {
            case 'guest': return 'bg-gray-100 text-gray-700';
            case 'registered': return 'bg-blue-100 text-blue-700';
            case 'active': return 'bg-green-100 text-green-700';
            case 'client': return 'bg-purple-100 text-purple-700';
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
                            {['all', 'guest', 'registered', 'client'].map((statusOption) => (
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
                    </div>

                    {/* Поиск по пользователям */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2">
                            <Search size={18} />
                            Поиск конкретных пользователей
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="Поиск по имени, username, телефону..."
                                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            </div>
                            <button
                                onClick={handleSearch}
                                disabled={searchLoading || !search.trim()}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                <Search size={18} />
                                {searchLoading ? 'Поиск...' : 'Найти'}
                            </button>
                            {(search || foundUsers.length > 0) && (
                                <button
                                    onClick={handleClearSearch}
                                    className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                        {foundUsers.length === 0 && !search && (
                            <p className="text-sm text-gray-500 mt-2">
                                Количество получателей по фильтру: <span className="font-semibold text-blue-600">{userCount}</span>
                            </p>
                        )}
                    </div>

                    {/* Список найденных пользователей */}
                    {foundUsers.length > 0 && (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.size === foundUsers.length}
                                        onChange={toggleAllUsers}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="font-medium text-gray-700">
                                        Найдено пользователей: {foundUsers.length}
                                    </span>
                                </div>
                                <span className="text-sm text-gray-600">
                                    Выбрано: <span className="font-semibold text-blue-600">{selectedUsers.size}</span>
                                </span>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {foundUsers.map((user) => (
                                    <div
                                        key={user._id}
                                        className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 flex items-center gap-3 cursor-pointer"
                                        onClick={() => toggleUserSelection(user._id)}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.has(user._id)}
                                            onChange={() => toggleUserSelection(user._id)}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">{user.fullName || 'Без имени'}</div>
                                            <div className="text-sm text-gray-500 flex gap-3">
                                                {user.telegramUserName && <span>@{user.telegramUserName}</span>}
                                                {user.userName && <span>{user.userName}</span>}
                                                {user.phone && <span>{user.phone}</span>}
                                            </div>
                                        </div>
                                        <div className={`text-xs px-2 py-1 rounded ${getStatusColor(user.status)}`}>
                                            {getStatusLabel(user.status)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Текст сообщения */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2">
                            <MessageSquare size={18} />
                            Сообщение для рассылки
                        </label>
                        <RichTextEditor
                            value={message}
                            onChange={(value) => setMessage(value)}
                            placeholder="Введите текст сообщения. "
                            height="350px"
                        />
                    </div>

                    {/* Кнопки действий */}
                    <div className="flex gap-3 pt-4 border-t">
                        <button
                            onClick={handleSendBroadcast}
                            disabled={loading || !message.trim() || (selectedUsers.size === 0 && userCount === 0)}
                            className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-1"
                        >
                            <Send size={20} />
                            {loading ? 'Отправка...' : selectedUsers.size > 0 
                                ? `Отправить выбранным (${selectedUsers.size})`
                                : `Отправить рассылку (${userCount})`
                            }
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

