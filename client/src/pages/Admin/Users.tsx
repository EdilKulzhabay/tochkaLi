import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/Admin/AdminLayout';
import { AdminTable } from '../../components/Admin/AdminTable';
import { Plus } from 'lucide-react';
import api from '../../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export const UsersAdmin = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);

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
        { key: 'telegramUserName', label: 'Имя' },
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
            render: (value: string) => (
                <span className={`px-2 py-1 rounded text-xs ${
                    value === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                    {value === 'active' ? 'Активен' : value === 'guest' ? 'Гость' : 'Зарегистрирован'}
                </span>
            )
        },
        { 
            key: 'subscriptionEndDate', 
            label: 'Подписка до',
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
                        <p className="text-gray-600 mt-1">Всего пользователей: {users.length}</p>
                    </div>
                    <button
                        onClick={() => handleOpenForm()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} />
                        Создать пользователя
                    </button>
                </div>

                <AdminTable
                    columns={columns}
                    data={users}
                    onEdit={handleOpenForm}
                    onDelete={handleDelete}
                />
            </div>
        </AdminLayout>
    );
};

