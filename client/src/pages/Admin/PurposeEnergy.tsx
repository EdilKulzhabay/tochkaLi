import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/Admin/AdminLayout';
import { AdminTable } from '../../components/Admin/AdminTable';
import { Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api';

export const PurposeEnergyAdmin = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await api.get('/api/purpose-energy');
            setItems(response.data.data || []);
        } catch (error: any) {
            toast.error('Ошибка загрузки энергии предназначения');
        }
    };

    const handleOpenForm = (item?: any) => {
        if (item) {
            navigate(`/admin/purpose-energy/edit/${item._id}`);
        } else {
            navigate('/admin/purpose-energy/create');
        }
    };

    const handleDelete = async (item: any) => {
        if (!confirm('Вы уверены, что хотите удалить эту запись?')) return;

        try {
            await api.delete(`/api/purpose-energy/${item._id}`);
            toast.success('Запись удалена');
            fetchItems();
        } catch (error: any) {
            toast.error('Ошибка удаления');
        }
    };

    const columns = [
        { key: 'title', label: 'Заголовок' },
        { 
            key: 'shortDescription', 
            label: 'Описание',
            render: (value: string) => value || '—'
        },
        { 
            key: 'content', 
            label: 'Элементов',
            render: (value: any[]) => value ? `${value.length}` : '0'
        },
        { key: 'accessType', label: 'Доступ' },
        { key: 'location', label: 'Позиция' },
        { 
            key: 'order', 
            label: 'Порядок',
            render: (value: number) => value ?? 0
        },
        { 
            key: 'allowRepeatBonus', 
            label: 'Повторный бонус',
            render: (value: boolean) => (value ? 'Да' : 'Нет')
        },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Энергия предназначения</h1>
                    <button
                        onClick={() => handleOpenForm()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} />
                        Добавить урок
                    </button>
                </div>

                <AdminTable
                    columns={columns}
                    data={items}
                    onEdit={handleOpenForm}
                    onDelete={handleDelete}
                />
            </div>
        </AdminLayout>
    );
};

