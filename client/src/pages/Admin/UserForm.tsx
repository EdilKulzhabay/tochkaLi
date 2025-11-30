import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/Admin/AdminLayout';
import { MyInput } from '../../components/Admin/MyInput';
import { MyButton } from '../../components/Admin/MyButton';
import { ArrowLeft } from 'lucide-react';
import api from '../../api';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';

interface FormData {
    fullName: string;
    mail: string;
    phone: string;
    bonus: number;
    telegramId?: string;
    telegramUserName?: string;
}

export const UserForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [subscriptionEndDate, setSubscriptionEndDate] = useState('');
    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        mail: '',
        phone: '',
        bonus: 0,
    });

    useEffect(() => {
        if (id) {
            fetchUser();
        }
    }, [id]);

    const fetchUser = async () => {
        try {
            const response = await api.get(`/api/user/${id}`);
            const data = response.data.data;
            setFormData({
                fullName: data.fullName || '',
                mail: data.mail || '',
                phone: data.phone || '',
                bonus: data.bonus || 0,
                telegramId: data.telegramId || '',
                telegramUserName: data.telegramUserName || '',
            });
            // Преобразуем subscriptionEndDate из Date в формат DD-MM-YYYY
            if (data.subscriptionEndDate) {
                const date = new Date(data.subscriptionEndDate);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                setSubscriptionEndDate(`${day}-${month}-${year}`);
            } else {
                setSubscriptionEndDate('');
            }
        } catch (error: any) {
            toast.error('Ошибка загрузки пользователя');
            navigate('/admin/users');
        }
    };

    // Функция для преобразования DD-MM-YYYY в Date
    const parseDate = (dateString: string): Date | null => {
        if (!dateString || dateString.trim() === '') return null;
        const parts = dateString.split('-');
        if (parts.length !== 3) return null;
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // месяцы в JS начинаются с 0
        const year = parseInt(parts[2], 10);
        if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
        return new Date(year, month, day);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (id) {
                await api.put(`/api/user/${id}`, formData);
                toast.success('Пользователь обновлен');
            } else {
                await api.post('/api/user/create-by-admin', formData);
                toast.success('Пользователь создан');
            }
            navigate('/admin/users');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Ошибка сохранения');
        } finally {
            setLoading(false);
        }
    };

    const handleActivateSubscription = async () => {
        if (!subscriptionEndDate || subscriptionEndDate.trim() === '') {
            toast.error('Укажите дату окончания подписки');
            return;
        }

        const date = parseDate(subscriptionEndDate);
        if (!date) {
            toast.error('Неверный формат даты. Используйте формат DD-MM-YYYY');
            return;
        }

        setLoading(true);
        try {
            await api.put(`/api/user/${id}/activate-subscription`, {
                subscriptionEndDate: date.toISOString()
            });
            toast.success('Подписка активирована');
            fetchUser();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Ошибка активации подписки');
        } finally {
            setLoading(false);
        }
    };

    const handleDeactivateSubscription = async () => {
        if (!confirm('Вы уверены, что хотите отменить подписку у этого пользователя?')) {
            return;
        }

        setLoading(true);
        try {
            await api.put(`/api/user/${id}/deactivate-subscription`);
            toast.success('Подписка отменена');
            setSubscriptionEndDate('');
            fetchUser();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Ошибка отмены подписки');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Заголовок с кнопкой назад */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/users')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {id ? 'Редактировать пользователя' : 'Создать пользователя'}
                    </h1>
                </div>

                {/* Форма */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Основная информация */}
                    <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                        <h2 className="text-xl font-semibold text-gray-900">Основная информация</h2>
                        
                        <MyInput
                            label="Полное имя"
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            placeholder="Введите имя"
                            required
                        />

                        <MyInput
                            label="Email"
                            type="email"
                            value={formData.mail}
                            onChange={(e) => setFormData({ ...formData, mail: e.target.value })}
                            placeholder="Введите email"
                            required
                        />

                        <MyInput
                            label="Телефон"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+7 (___) ___-__-__"
                        />

                        <MyInput
                            label="Количество бонусов (Звезды)"
                            type="number"
                            value={formData.bonus.toString()}
                            onChange={(e) => {
                                const value = parseInt(e.target.value) || 0;
                                setFormData({ ...formData, bonus: value });
                            }}
                            placeholder="0"
                            min="0"
                        />

                        {id && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Telegram ID</label>
                                    <input
                                        type="text"
                                        value={formData.telegramId || ''}
                                        readOnly
                                        className="w-full p-2 border rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Telegram Username</label>
                                    <input
                                        type="text"
                                        value={formData.telegramUserName || ''}
                                        readOnly
                                        className="w-full p-2 border rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Управление подпиской */}
                    {id && (
                        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                            <h2 className="text-xl font-semibold text-gray-900">Управление подпиской</h2>
                            
                            <div>
                                <MyInput
                                    label="Дата окончания подписки (DD-MM-YYYY)"
                                    type="text"
                                    value={subscriptionEndDate}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        let formatted = value;
                                        if (value.length > 2) {
                                            formatted = value.slice(0, 2) + '-' + value.slice(2);
                                        }
                                        if (value.length > 4) {
                                            formatted = value.slice(0, 2) + '-' + value.slice(2, 4) + '-' + value.slice(4, 8);
                                        }
                                        // Ограничиваем длину до 10 символов (DD-MM-YYYY)
                                        if (formatted.length <= 10) {
                                            setSubscriptionEndDate(formatted);
                                        }
                                    }}
                                    placeholder="ДД-ММ-ГГГГ"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Текущая дата окончания: {subscriptionEndDate || 'Не установлена'}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <MyButton
                                    text="Активировать подписку"
                                    onClick={handleActivateSubscription}
                                    disabled={loading || !subscriptionEndDate || subscriptionEndDate.trim() === ''}
                                    className="w-auto px-3 py-1.5 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={handleDeactivateSubscription}
                                    disabled={loading}
                                    className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Отменить подписку
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Кнопки действий */}
                    <div className="flex gap-2 justify-end bg-white rounded-lg shadow-sm p-6">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/users')}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Отмена
                        </button>
                        <MyButton
                            text={loading ? (id ? 'Сохранение...' : 'Создание...') : (id ? 'Сохранить' : 'Создать')}
                            onClick={() => {}}
                            disabled={loading}
                            className="w-auto px-3 py-1.5 text-sm"
                        />
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

