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
        password: '',
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
                password: '',
                role: item.role || 'user',
                status: item.status || 'active',
            });
        } else {
            // Создание нового пользователя
            setEditingItem(null);
            setFormData({
                fullName: '',
                mail: '',
                phone: '',
                password: '',
                role: 'user',
                status: 'active',
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
            password: '',
            role: 'user',
            status: 'active',
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingItem) {
                // Обновление существующего пользователя
                const updateData: any = {
                    fullName: formData.fullName,
                    mail: formData.mail,
                    phone: formData.phone,
                    role: formData.role,
                    status: formData.status,
                };
                // Если пароль указан, добавляем его
                if (formData.password && formData.password.trim() !== '') {
                    updateData.password = formData.password;
                }
                await api.put(`/api/user/${editingItem._id}`, updateData);
                toast.success('Пользователь обновлен');
            } else {
                // Создание нового пользователя
                const response = await api.post('/api/user/create-by-admin', formData);
                if (response.data.generatedPassword) {
                    toast.success(`Пользователь создан. Пароль: ${response.data.generatedPassword}`, {
                        autoClose: 10000,
                    });
                } else {
                    toast.success('Пользователь создан');
                }
            }
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
                    <div className='max-w-max'>
                        <MyButton
                            text="Создать пользователя"
                            onClick={() => handleOpenModal()}
                        />
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
                title={editingItem ? "Редактировать пользователя" : "Создать пользователя"}
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

                    {!editingItem && (
                        <MyInput
                            label="Пароль"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Оставьте пустым для автоматической генерации"
                        />
                    )}

                    {editingItem && (
                        <MyInput
                            label="Новый пароль (оставьте пустым, чтобы не менять)"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Введите новый пароль"
                        />
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-2">Роль</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="user">Пользователь</option>
                            <option value="admin">Администратор</option>
                            <option value="content_manager">Контент-менеджер</option>
                            <option value="client_manager">Менеджер по клиентам</option>
                            <option value="manager">Менеджер</option>
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
                            text={loading ? (editingItem ? 'Сохранение...' : 'Создание...') : (editingItem ? 'Сохранить' : 'Создать')}
                            onClick={() => {}}
                            disabled={loading}
                        />
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
};

