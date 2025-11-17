import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/Admin/AdminLayout';
import { AdminTable } from '../../components/Admin/AdminTable';
import { Plus } from 'lucide-react';
import api from '../../api';
import { toast } from 'react-toastify';

export const SchumannAdmin = () => {
    const navigate = useNavigate();
    const [schumanns, setSchumanns] = useState([]);

    useEffect(() => {
        fetchSchumanns();
    }, []);

    const fetchSchumanns = async () => {
        try {
            const response = await api.get('/api/schumann');
            setSchumanns(response.data.data);
        } catch (error: any) {
            toast.error('Ошибка загрузки записей о частоте Шумана');
        }
    };

    const handleCreate = () => {
        navigate('/admin/schumann/create');
    };

    const handleEdit = (item: any) => {
        navigate(`/admin/schumann/edit/${item._id}`);
    };

    const handleDelete = async (item: any) => {
        if (!confirm('Вы уверены, что хотите удалить эту запись о частоте Шумана?')) return;

        try {
            await api.delete(`/api/schumann/${item._id}`);
            toast.success('Запись о частоте Шумана удалена');
            fetchSchumanns();
        } catch (error: any) {
            toast.error('Ошибка удаления');
        }
    };

    const columns = [
        { 
            key: 'date', 
            label: 'Дата',
            render: (value: string) => new Date(value).toLocaleDateString('ru-RU')
        },
        { 
            key: 'image', 
            label: 'Изображение',
            render: (value: string) => (
                value ? (
                    <img 
                        src={`${import.meta.env.VITE_API_URL}${value}`} 
                        alt="Частота Шумана" 
                        className="w-20 h-20 object-cover rounded"
                    />
                ) : (
                    <span className="text-gray-400">Нет изображения</span>
                )
            )
        },
        { 
            key: 'createdAt', 
            label: 'Создано',
            render: (value: string) => new Date(value).toLocaleDateString('ru-RU')
        },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Частота Шумана</h1>
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} />
                        Добавить запись
                    </button>
                </div>

                <AdminTable
                    columns={columns}
                    data={schumanns}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>
        </AdminLayout>
    );
};
