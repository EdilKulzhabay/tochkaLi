import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { AdminTable } from '../../components/AdminTable';
import { Plus } from 'lucide-react';
import api from '../../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export const TransitAdmin = () => {
    const navigate = useNavigate();
    const [transits, setTransits] = useState([]);

    useEffect(() => {
        fetchTransits();
    }, []);

    const fetchTransits = async () => {
        try {
            const response = await api.get('/api/transit');
            setTransits(response.data.data);
        } catch (error: any) {
            toast.error('Ошибка загрузки транзитов');
        }
    };

    const handleOpenForm = (item?: any) => {
        if (item) {
            navigate(`/admin/transit/edit/${item._id}`);
        } else {
            navigate('/admin/transit/create');
        }
    };

    const handleDelete = async (item: any) => {
        if (!confirm('Вы уверены, что хотите удалить этот транзит?')) return;

        try {
            await api.delete(`/api/transit/${item._id}`);
            toast.success('Транзит удален');
            fetchTransits();
        } catch (error: any) {
            toast.error('Ошибка удаления');
        }
    };

    const columns = [
        { key: 'title', label: 'Название' },
        { key: 'subtitle', label: 'Подзаголовок' },
        { key: 'dates', label: 'Даты' },
        { key: 'accessType', label: 'Доступ' },
        { 
            key: 'isActive', 
            label: 'Статус',
            render: (value: boolean) => value ? 'Активен' : 'Неактивен'
        },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Транзиты</h1>
                    <button
                        onClick={() => handleOpenForm()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} />
                        Добавить транзит
                    </button>
                </div>

                <AdminTable
                    columns={columns}
                    data={transits}
                    onEdit={handleOpenForm}
                    onDelete={handleDelete}
                />
            </div>
        </AdminLayout>
    );
};
