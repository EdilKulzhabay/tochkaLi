import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/Admin/AdminLayout';
import { AdminTable } from '../../components/Admin/AdminTable';
import { Modal } from '../../components/Modal';
import { MyInput } from '../../components/Admin/MyInput';
import { MyButton } from '../../components/Admin/MyButton';
import api from '../../api';
import { toast } from 'react-toastify';

export const UsersAdmin = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    
    const [formData, setFormData] = useState({
        fullName: '',
        mail: '',
        phone: '',
        role: 'user',
        status: 'active',
    });

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

    const handleOpenModal = (item?: any) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                fullName: item.fullName || '',
                mail: item.mail || '',
                phone: item.phone || '',
                role: item.role || 'user',
                status: item.status || 'active',
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({
            fullName: '',
            mail: '',
            phone: '',
            role: 'user',
            status: 'active',
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.put(`/api/user/${editingItem._id}`, formData);
            toast.success('Пользователь обновлен');
            fetchUsers();
            handleCloseModal();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Ошибка сохранения');
        } finally {
            setLoading(false);
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
            render: (value: string) => (
                <span className={`px-2 py-1 rounded text-xs ${
                    value === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                }`}>
                    {value === 'admin' ? 'Админ' : 'Пользователь'}
                </span>
            )
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
                </div>

                <AdminTable
                    columns={columns}
                    data={users}
                    onEdit={handleOpenModal}
                    onDelete={handleDelete}
                />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title="Редактировать пользователя"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <MyInput
                        label="Полное имя"
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Введите имя"
                    />

                    <MyInput
                        label="Email"
                        type="email"
                        value={formData.mail}
                        onChange={(e) => setFormData({ ...formData, mail: e.target.value })}
                        placeholder="Введите email"
                    />

                    <MyInput
                        label="Телефон"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+7 (___) ___-__-__"
                    />

                    <div>
                        <label className="block text-sm font-medium mb-2">Роль</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="user">Пользователь</option>
                            <option value="admin">Администратор</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Статус</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="active">Активен</option>
                            <option value="guest">Гость</option>
                            <option value="registered">Зарегистрирован</option>
                        </select>
                    </div>

                    <div className="flex gap-3 justify-end pt-4">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Отмена
                        </button>
                        <MyButton
                            text={loading ? 'Сохранение...' : 'Сохранить'}
                            onClick={() => {}}
                            disabled={loading}
                        />
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
};

