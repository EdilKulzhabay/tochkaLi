import { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from '../../components/Admin/AdminLayout';
import { AdminTable } from '../../components/Admin/AdminTable';
import { Plus, Search, ArrowUpDown } from 'lucide-react';
import api from '../../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

interface User {
    _id: string;
    fullName?: string;
    telegramUserName?: string;
    phone?: string;
    mail?: string;
    role: string;
    status: string;
    isBlocked?: boolean;
    bonus?: number;
    subscriptionEndDate?: string;
    createdAt: string;
}

export const UsersAdmin = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [sortField, setSortField] = useState<string>('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/api/user/all');
            setUsers(response.data.data);
        } catch (error: any) {
            toast.error('Ошибка загрузки пользователей');
        }
    };

    // Фильтрация и поиск
    const filteredAndSortedUsers = useMemo(() => {
        let result = [...users];

        // Поиск по fullName, telegramUserName, phone, mail
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            result = result.filter(user => 
                (user.fullName?.toLowerCase().includes(query)) ||
                (user.telegramUserName?.toLowerCase().includes(query)) ||
                (user.phone?.toLowerCase().includes(query)) ||
                (user.mail?.toLowerCase().includes(query))
            );
        }

        // Фильтр по статусу
        if (statusFilter !== 'all') {
            if (statusFilter === 'blocked') {
                result = result.filter(user => user.isBlocked === true);
            } else {
                result = result.filter(user => !user.isBlocked && user.status === statusFilter);
            }
        }

        // Фильтр по роли
        if (roleFilter !== 'all') {
            result = result.filter(user => user.role === roleFilter);
        }

        // Сортировка
        if (sortField) {
            result.sort((a, b) => {
                let aValue = (a as any)[sortField];
                let bValue = (b as any)[sortField];

                // Обработка дат
                if (sortField === 'subscriptionEndDate') {
                    if (!aValue) aValue = new Date(0);
                    if (!bValue) bValue = new Date(0);
                    aValue = new Date(aValue).getTime();
                    bValue = new Date(bValue).getTime();
                }

                // Обработка чисел
                if (sortField === 'bonus') {
                    aValue = aValue || 0;
                    bValue = bValue || 0;
                }

                // Сравнение
                if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [users, searchQuery, statusFilter, roleFilter, sortField, sortDirection]);

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleOpenForm = (item?: any) => {
        if (item) {
            navigate(`/admin/users/edit/${item._id}`);
        } else {
            navigate('/admin/users/create');
        }
    };

    const handleDelete = async (item: any) => {
        if (!confirm(`Вы уверены, что хотите удалить пользователя ${item.fullName}?`)) return;

        try {
            await api.delete(`/api/user/${item._id}`);
            toast.success('Пользователь удален');
            fetchUsers();
        } catch (error: any) {
            toast.error('Ошибка удаления');
        }
    };

    const columns = [
        { key: 'fullName', label: 'Полное имя' },
        { key: 'telegramUserName', label: 'TG Имя' },
        { key: 'mail', label: 'Email' },
        { key: 'phone', label: 'Телефон' },
        { 
            key: 'role', 
            label: 'Роль',
            render: (value: string) => {
                const roleLabels: { [key: string]: string } = {
                    'user': 'Пользователь',
                    'admin': 'Администратор',
                    'content_manager': 'Контент-менеджер',
                    'client_manager': 'Менеджер по клиентам',
                    'manager': 'Менеджер'
                };
                const roleColors: { [key: string]: string } = {
                    'user': 'bg-gray-100 text-gray-700',
                    'admin': 'bg-purple-100 text-purple-700',
                    'content_manager': 'bg-blue-100 text-blue-700',
                    'client_manager': 'bg-green-100 text-green-700',
                    'manager': 'bg-yellow-100 text-yellow-700'
                };
                return (
                    <span className={`px-2 py-1 rounded text-xs ${roleColors[value] || 'bg-gray-100 text-gray-700'}`}>
                        {roleLabels[value] || value}
                    </span>
                );
            }
        },
        { 
            key: 'status', 
            label: 'Статус',
            render: (value: string, row: any) => {
                // Если пользователь заблокирован, показываем статус "Заблокирован"
                if (row.isBlocked) {
                    return (
                        <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-700">
                            Заблокирован
                        </span>
                    );
                }
                // Иначе показываем обычный статус
                return (
                    <span className={`px-2 py-1 rounded text-xs ${
                        value === 'guest' ? 'bg-gray-100 text-gray-700' : value === 'registered' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                        {value === 'guest' ? 'Гость' : value === 'registered' ? 'Зарегистрирован' : 'Клиент'}
                    </span>
                );
            }
        },
        { 
            key: 'bonus', 
            label: 'Звезды',
            sortable: true
        },
        { 
            key: 'subscriptionEndDate', 
            label: 'Подписка до',
            sortable: true,
            render: (value: string) => {
                if (!value) return 'Нет подписки';
                const date = new Date(value);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}-${month}-${year}`;
            }
        },
        { 
            key: 'createdAt', 
            label: 'Дата регистрации',
            render: (value: string) => new Date(value).toLocaleDateString('ru-RU')
        },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Пользователи</h1>
                        <p className="text-gray-600 mt-1">
                            Всего пользователей: {users.length} 
                            {filteredAndSortedUsers.length !== users.length && ` (отфильтровано: ${filteredAndSortedUsers.length})`}
                        </p>
                    </div>
                    <button
                        onClick={() => handleOpenForm()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} />
                        Создать пользователя
                    </button>
                </div>

                {/* Фильтры и поиск */}
                <div className="bg-white p-4 rounded-lg shadow space-y-4">
                    {/* Поиск */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Поиск по имени, TG имени, телефону, email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Фильтры */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Фильтр по статусу */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Статус
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">Все статусы</option>
                                <option value="guest">Гость</option>
                                <option value="registered">Зарегистрирован</option>
                                <option value="client">Клиент</option>
                                <option value="blocked">Заблокирован</option>
                            </select>
                        </div>

                        {/* Фильтр по роли */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Роль
                            </label>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">Все роли</option>
                                <option value="user">Пользователь</option>
                                <option value="admin">Администратор</option>
                                <option value="content_manager">Контент-менеджер</option>
                                <option value="client_manager">Менеджер по клиентам</option>
                            </select>
                        </div>
                    </div>

                    {/* Сортировка */}
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-700">Сортировка:</span>
                        <button
                            onClick={() => handleSort('bonus')}
                            className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-colors ${
                                sortField === 'bonus' 
                                    ? 'bg-blue-100 text-blue-700' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <ArrowUpDown size={16} />
                            Звезды
                            {sortField === 'bonus' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                        </button>
                        <button
                            onClick={() => handleSort('subscriptionEndDate')}
                            className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-colors ${
                                sortField === 'subscriptionEndDate' 
                                    ? 'bg-blue-100 text-blue-700' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <ArrowUpDown size={16} />
                            Подписка до
                            {sortField === 'subscriptionEndDate' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                        </button>
                        {(sortField === 'bonus' || sortField === 'subscriptionEndDate') && (
                            <button
                                onClick={() => {
                                    setSortField('');
                                    setSortDirection('asc');
                                }}
                                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                            >
                                Сбросить
                            </button>
                        )}
                    </div>
                </div>

                <AdminTable
                    columns={columns}
                    data={filteredAndSortedUsers}
                    onEdit={handleOpenForm}
                    onDelete={handleDelete}
                />
            </div>
        </AdminLayout>
    );
};

