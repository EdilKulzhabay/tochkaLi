import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/Admin/AdminLayout';
import api from '../../api';
import { toast } from 'react-toastify';
import { Send, Users, MessageSquare, Search, X, Image as ImageIcon, Save, BookOpen, Edit, Trash2 } from 'lucide-react';
import { RichTextEditor } from '../../components/Admin/RichTextEditor';
import { ImageUpload } from '../../components/Admin/ImageUpload';

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
    isBlocked?: boolean;
}

interface SavedBroadcast {
    _id: string;
    title: string;
    imgUrl?: string;
    content: string;
    buttonText?: string;
    createdAt: string;
    updatedAt: string;
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
    const [selectedUsersData, setSelectedUsersData] = useState<Map<string, User>>(new Map());
    const [lastStats, setLastStats] = useState<BroadcastStats | null>(null);
    const [imageUrl, setImageUrl] = useState('');
    const [parseMode, setParseMode] = useState<'HTML' | 'Markdown'>('HTML');
    const [buttonText, setButtonText] = useState('');
    const [buttonUrl, setButtonUrl] = useState('');
    const [savedBroadcasts, setSavedBroadcasts] = useState<SavedBroadcast[]>([]);
    const [selectedBroadcastId, setSelectedBroadcastId] = useState<string | null>(null);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showManageModal, setShowManageModal] = useState(false);
    const [saveTitle, setSaveTitle] = useState('');
    const [editingBroadcast, setEditingBroadcast] = useState<SavedBroadcast | null>(null);

    const fetchUserCount = async () => {
        try {
            const response = await api.post('/api/broadcast/users', {
                    status: status,
                    search: ""
            });
            setUserCount(response.data.count);
        } catch (error: any) {
            toast.error('Ошибка загрузки пользователей');
        }
    };

    useEffect(() => {
        fetchUserCount();
        fetchSavedBroadcasts();
        // При изменении статуса очищаем поиск и найденных пользователей
        setSearch('');
        setFoundUsers([]);
        setSelectedUsers(new Set());
        setSelectedUsersData(new Map());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    const fetchSavedBroadcasts = async () => {
        try {
            const response = await api.get('/api/broadcast');
            if (response.data.success) {
                setSavedBroadcasts(response.data.data || []);
            }
        } catch (error: any) {
            console.error('Ошибка загрузки сохраненных рассылок:', error);
        }
    };

    const handleSearch = async () => {
        if (!search.trim()) {
            toast.warning('Введите текст для поиска');
            return;
        }

        setSearchLoading(true);
        try {
            const response = await api.post('/api/broadcast/users', {
                status: status,
                search: search 
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
        // Не очищаем выбранных пользователей при очистке поиска
    };

    const toggleUserSelection = (user: User) => {
        const newSelected = new Set(selectedUsers);
        const newSelectedData = new Map(selectedUsersData);
        
        if (newSelected.has(user._id)) {
            newSelected.delete(user._id);
            newSelectedData.delete(user._id);
        } else {
            newSelected.add(user._id);
            newSelectedData.set(user._id, user);
        }
        
        setSelectedUsers(newSelected);
        setSelectedUsersData(newSelectedData);
    };

    const removeSelectedUser = (userId: string) => {
        const newSelected = new Set(selectedUsers);
        const newSelectedData = new Map(selectedUsersData);
        
        newSelected.delete(userId);
        newSelectedData.delete(userId);
        
        setSelectedUsers(newSelected);
        setSelectedUsersData(newSelectedData);
    };

    const toggleAllUsers = () => {
        if (selectedUsers.size === foundUsers.length) {
            setSelectedUsers(new Set());
            setSelectedUsersData(new Map());
        } else {
            const allIds = new Set(foundUsers.map(u => u._id));
            const allData = new Map(foundUsers.map(u => [u._id, u]));
            setSelectedUsers(allIds);
            setSelectedUsersData(allData);
        }
    };

    const handleLoadBroadcast = (broadcast: SavedBroadcast) => {
        setMessage(broadcast.content);
        setImageUrl(broadcast.imgUrl || '');
        setButtonText(broadcast.buttonText || '');
        setSelectedBroadcastId(broadcast._id);
        setShowManageModal(false);
        toast.success(`Рассылка "${broadcast.title}" загружена`);
    };

    const handleSaveBroadcast = async () => {
        if (!saveTitle.trim()) {
            toast.warning('Введите название рассылки');
            return;
        }
        if (!message.trim()) {
            toast.warning('Введите сообщение для сохранения');
            return;
        }

        try {
            const response = await api.post('/api/broadcast', {
                title: saveTitle,
                imgUrl: imageUrl || '',
                content: message,
                buttonText: buttonText || '',
            });

            if (response.data.success) {
                toast.success('Рассылка успешно сохранена');
                setShowSaveModal(false);
                setSaveTitle('');
                fetchSavedBroadcasts();
            } else {
                toast.error(response.data.message || 'Ошибка сохранения рассылки');
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Ошибка сохранения рассылки';
            toast.error(errorMessage);
        }
    };

    const handleUpdateBroadcast = async () => {
        if (!editingBroadcast) return;
        if (!saveTitle.trim()) {
            toast.warning('Введите название рассылки');
            return;
        }

        try {
            const response = await api.put(`/api/broadcast/${editingBroadcast._id}`, {
                title: saveTitle,
                imgUrl: imageUrl || '',
                content: message,
                buttonText: buttonText || '',
            });

            if (response.data.success) {
                toast.success('Рассылка успешно обновлена');
                setShowSaveModal(false);
                setEditingBroadcast(null);
                setSaveTitle('');
                fetchSavedBroadcasts();
            } else {
                toast.error(response.data.message || 'Ошибка обновления рассылки');
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Ошибка обновления рассылки';
            toast.error(errorMessage);
        }
    };

    const handleDeleteBroadcast = async (id: string) => {
        if (!confirm('Вы уверены, что хотите удалить эту рассылку?')) return;

        try {
            const response = await api.delete(`/api/broadcast/${id}`);
            if (response.data.success) {
                toast.success('Рассылка успешно удалена');
                fetchSavedBroadcasts();
                if (selectedBroadcastId === id) {
                    setSelectedBroadcastId(null);
                }
            } else {
                toast.error(response.data.message || 'Ошибка удаления рассылки');
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Ошибка удаления рассылки';
            toast.error(errorMessage);
        }
    };

    const handleEditBroadcast = (broadcast: SavedBroadcast) => {
        setEditingBroadcast(broadcast);
        setSaveTitle(broadcast.title);
        setMessage(broadcast.content);
        setImageUrl(broadcast.imgUrl || '');
        setButtonText(broadcast.buttonText || '');
        setSelectedBroadcastId(broadcast._id);
        setShowManageModal(false);
        setShowSaveModal(true);
    };

    const handleSendBroadcast = async () => {
        const finalMessage = message.trim();
        if (!finalMessage && !selectedBroadcastId) {
            toast.warning('Введите сообщение или выберите сохраненную рассылку');
            return;
        }

        // Если есть выбранные пользователи из поиска
        if (selectedUsers.size > 0) {
            const confirmText = `Вы уверены, что хотите отправить сообщение ${selectedUsers.size} выбранным пользователям?`;
            if (!confirm(confirmText)) return;

            setLoading(true);
            try {
                const response = await api.post('/api/broadcast/send', { 
                    message: finalMessage || undefined,
                    broadcastId: selectedBroadcastId || undefined,
                    userIds: Array.from(selectedUsers),
                    imageUrl: imageUrl || undefined,
                    parseMode: parseMode,
                    buttonText: buttonText || undefined,
                    buttonUrl: buttonUrl || undefined,
                });
                
                if (response.data.success) {
                    setLastStats({
                        sent: response.data.sent || 0,
                        failed: response.data.failed || 0,
                        total: response.data.total || 0
                    });

                    if (response.data.failed > 0) {
                        toast.warning(`Рассылка завершена! Отправлено: ${response.data.sent}, Ошибок: ${response.data.failed}`);
                    } else {
                        toast.success(`Рассылка завершена! Отправлено: ${response.data.sent} сообщений`);
                    }
                    
                    // Очищаем только выбранных пользователей, но не очищаем поиск и найденных пользователей
                    // чтобы можно было отправить еще одно сообщение тем же пользователям
                    setSelectedUsers(new Set());
                    setSelectedUsersData(new Map());
                    // Очищаем форму сообщения
                    setMessage('');
                    setImageUrl('');
                    setButtonText('');
                    setButtonUrl('');
                } else {
                    toast.error(response.data.message || 'Ошибка отправки рассылки');
                }
            } catch (error: any) {
                console.error('Ошибка отправки рассылки:', error);
                const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Ошибка отправки рассылки';
                toast.error(errorMessage);
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
                message: finalMessage || undefined,
                broadcastId: selectedBroadcastId || undefined,
                status: status === 'all' ? undefined : status,
                imageUrl: imageUrl || undefined,
                parseMode: parseMode,
                buttonText: buttonText || undefined,
                buttonUrl: buttonUrl || undefined,
            });
            
            if (response.data.success) {
                setLastStats({
                    sent: response.data.sent || 0,
                    failed: response.data.failed || 0,
                    total: response.data.total || 0
                });

                if (response.data.failed > 0) {
                    toast.warning(`Рассылка завершена! Отправлено: ${response.data.sent}, Ошибок: ${response.data.failed}`);
                } else {
                    toast.success(`Рассылка завершена! Отправлено: ${response.data.sent} сообщений`);
                }
                // Очищаем форму после успешной отправки
                setMessage('');
                setImageUrl('');
                setButtonText('');
                setButtonUrl('');
            } else {
                toast.error(response.data.message || 'Ошибка отправки рассылки');
            }
        } catch (error: any) {
            console.error('Ошибка отправки рассылки:', error);
            const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Ошибка отправки рассылки';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getStatusLabel = (statusValue: string, isBlocked?: boolean) => {
        if (isBlocked) return 'Заблокирован';
        switch (statusValue) {
            case 'guest': return 'Гость';
            case 'registered': return 'Зарегистрирован';
            case 'active': return 'Активен';
            case 'client': return 'Клиент';
            default: return 'Все';
        }
    };

    const getStatusColor = (statusValue: string, isBlocked?: boolean) => {
        if (isBlocked) return 'bg-red-100 text-red-700';
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

                {/* Управление сохраненными рассылками */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Сохраненные рассылки</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowManageModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <BookOpen size={18} />
                                Управление
                            </button>
                            <button
                                onClick={() => {
                                    if (!message.trim()) {
                                        toast.warning('Сначала заполните форму рассылки');
                                        return;
                                    }
                                    setEditingBroadcast(null);
                                    setSaveTitle('');
                                    setShowSaveModal(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Save size={18} />
                                Сохранить текущую
                            </button>
                        </div>
                    </div>
                    {savedBroadcasts.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {savedBroadcasts.map((broadcast) => (
                                <div
                                    key={broadcast._id}
                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                        selectedBroadcastId === broadcast._id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    onClick={() => handleLoadBroadcast(broadcast)}
                                >
                                    <div className="font-semibold text-gray-900 mb-1">{broadcast.title}</div>
                                    <div className="text-sm text-gray-600 line-clamp-2" dangerouslySetInnerHTML={{ __html: broadcast.content.substring(0, 100) }} />
                                    {broadcast.imgUrl && (
                                        <div className="mt-2 text-xs text-gray-500">📷 Есть изображение</div>
                                    )}
                                    {broadcast.buttonText && (
                                        <div className="mt-1 text-xs text-gray-500">🔘 Кнопка: {broadcast.buttonText}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    {savedBroadcasts.length === 0 && (
                        <p className="text-gray-500 text-center py-4">Нет сохраненных рассылок</p>
                    )}
                </div>

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

                    {/* Выбранные пользователи */}
                    

                    {/* Список найденных пользователей */}
                    {foundUsers.length > 0 && (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={foundUsers.length > 0 && selectedUsers.size === foundUsers.length}
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
                                        onClick={() => toggleUserSelection(user)}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.has(user._id)}
                                            onChange={() => toggleUserSelection(user)}
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
                                        <div className={`text-xs px-2 py-1 rounded ${getStatusColor(user.status, user.isBlocked)}`}>
                                            {getStatusLabel(user.status, user.isBlocked)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

{selectedUsers.size > 0 && (
                        <div className="border border-blue-200 rounded-lg overflow-hidden bg-blue-50">
                            <div className="bg-blue-100 px-4 py-3 border-b border-blue-200 flex items-center justify-between">
                                <span className="font-medium text-blue-900">
                                    Выбрано пользователей: {selectedUsers.size}
                                </span>
                                <button
                                    onClick={() => {
                                        setSelectedUsers(new Set());
                                        setSelectedUsersData(new Map());
                                    }}
                                    className="text-sm text-blue-700 hover:text-blue-900 underline"
                                >
                                    Очистить все
                                </button>
                            </div>
                            <div className="max-h-48 overflow-y-auto p-2">
                                <div className="flex flex-wrap gap-2">
                                    {Array.from(selectedUsersData.values()).map((user) => (
                                        <div
                                            key={user._id}
                                            className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-blue-200 shadow-sm"
                                        >
                                            <span className="text-sm font-medium text-gray-900">
                                                {user.fullName || 'Без имени'}
                                            </span>
                                            {user.telegramUserName && (
                                                <span className="text-xs text-gray-500">@{user.telegramUserName}</span>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeSelectedUser(user._id);
                                                }}
                                                className="text-red-600 hover:text-red-800 transition-colors"
                                                title="Удалить из выбранных"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Изображение */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2">
                            <ImageIcon size={18} />
                            Изображение
                            <span className="text-xs text-gray-500 font-normal">(необязательно)</span>
                        </label>
                        {/* <p className="text-xs text-gray-500 mb-2">
                            Если изображение не загружено, будет отправлено только текстовое сообщение
                        </p> */}
                        <ImageUpload
                            value={imageUrl}
                            onChange={(url) => setImageUrl(url)}
                            label="Изображение для рассылки"
                        />
                        {imageUrl && (
                            <button
                                onClick={() => setImageUrl('')}
                                className="mt-2 text-sm text-red-600 hover:text-red-800"
                            >
                                Удалить изображение
                            </button>
                        )}
                    </div>

                    {/* Режим парсинга */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2">
                            <MessageSquare size={18} />
                            Режим форматирования
                        </label>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setParseMode('HTML')}
                                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                                    parseMode === 'HTML'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                HTML
                            </button>
                            <button
                                onClick={() => setParseMode('Markdown')}
                                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                                    parseMode === 'Markdown'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                Markdown
                            </button>
                        </div>
                    </div>

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

                    {/* Inline кнопка */}
                    <div className="border-t pt-4">
                        <label className="flex items-center gap-2 text-sm font-medium mb-2">
                            Inline кнопка (опционально)
                        </label>
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Текст кнопки</label>
                            <input
                                type="text"
                                value={buttonText}
                                onChange={(e) => setButtonText(e.target.value)}
                                placeholder="Например: Открыть приложение"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            URL кнопки будет автоматически сформирован как <code className="bg-gray-100 px-1 rounded">https://kulzhabay.kz/</code> с параметрами <code className="bg-gray-100 px-1 rounded">telegramId</code> и <code className="bg-gray-100 px-1 rounded">profilePhotoUrl</code> (если указан) для каждого пользователя.
                        </p>
                    </div>

                    {/* Кнопки действий */}
                    <div className="flex gap-3 pt-4 border-t">
                        <button
                            onClick={handleSendBroadcast}
                            disabled={loading || (!message.trim() && !selectedBroadcastId) || (selectedUsers.size === 0 && userCount === 0)}
                            className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-1"
                        >
                            <Send size={20} />
                            {loading ? 'Отправка...' : selectedUsers.size > 0 
                                ? `Отправить выбранным (${selectedUsers.size})`
                                : `Отправить рассылку (${userCount})`
                            }
                        </button>
                    </div>
                    {selectedBroadcastId && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-blue-900">
                                    Используется сохраненная рассылка: <strong>{savedBroadcasts.find(b => b._id === selectedBroadcastId)?.title}</strong>
                                </span>
                                <button
                                    onClick={() => {
                                        setSelectedBroadcastId(null);
                                        setMessage('');
                                        setImageUrl('');
                                        setButtonText('');
                                    }}
                                    className="text-sm text-blue-700 hover:text-blue-900 underline"
                                >
                                    Очистить
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Модальное окно сохранения рассылки */}
                {showSaveModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                {editingBroadcast ? 'Редактировать рассылку' : 'Сохранить рассылку'}
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Название рассылки *
                                    </label>
                                    <input
                                        type="text"
                                        value={saveTitle}
                                        onChange={(e) => setSaveTitle(e.target.value)}
                                        placeholder="Введите название для сохранения"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={editingBroadcast ? handleUpdateBroadcast : handleSaveBroadcast}
                                        disabled={!saveTitle.trim()}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {editingBroadcast ? 'Обновить' : 'Сохранить'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowSaveModal(false);
                                            setEditingBroadcast(null);
                                            setSaveTitle('');
                                        }}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Отмена
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Модальное окно управления рассылками */}
                {showManageModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-gray-900">Управление сохраненными рассылками</h2>
                                <button
                                    onClick={() => setShowManageModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            {savedBroadcasts.length > 0 ? (
                                <div className="space-y-3">
                                    {savedBroadcasts.map((broadcast) => (
                                        <div
                                            key={broadcast._id}
                                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900 mb-2">{broadcast.title}</h3>
                                                    <div className="text-sm text-gray-600 mb-2 line-clamp-2" dangerouslySetInnerHTML={{ __html: broadcast.content.substring(0, 150) }} />
                                                    <div className="flex gap-4 text-xs text-gray-500">
                                                        {broadcast.imgUrl && <span>📷 Есть изображение</span>}
                                                        {broadcast.buttonText && <span>🔘 Кнопка: {broadcast.buttonText}</span>}
                                                        <span>Создано: {new Date(broadcast.createdAt).toLocaleDateString('ru-RU')}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 ml-4">
                                                    <button
                                                        onClick={() => handleLoadBroadcast(broadcast)}
                                                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                                    >
                                                        Загрузить
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditBroadcast(broadcast)}
                                                        className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteBroadcast(broadcast._id)}
                                                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">Нет сохраненных рассылок</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

