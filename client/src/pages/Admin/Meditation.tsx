import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/Admin/AdminLayout';
import { AdminTable } from '../../components/Admin/AdminTable';
import { Plus } from 'lucide-react';
import api from '../../api';
import { toast } from 'react-toastify';

export const MeditationAdmin = () => {
    const navigate = useNavigate();
    const [meditations, setMeditations] = useState([]);

    useEffect(() => {
        fetchMeditations();
    }, []);

    const fetchMeditations = async () => {
        try {
            const response = await api.get('/api/meditation');
            setMeditations(response.data.data);
        } catch (error: any) {
            toast.error('Ошибка загрузки медитаций');
        }
    };

    const handleCreate = () => {
        navigate('/admin/meditation/create');
    };

    const handleEdit = (item: any) => {
        navigate(`/admin/meditation/edit/${item._id}`);
    };

    const handleDelete = async (item: any) => {
        if (!confirm('Вы уверены, что хотите удалить эту медитацию?')) return;

        try {
            await api.delete(`/api/meditation/${item._id}`);
            toast.success('Медитация удалена');
            fetchMeditations();
        } catch (error: any) {
            toast.error('Ошибка удаления');
        }
    };

    const columns = [
        { key: 'title', label: 'Название' },
        { key: 'category', label: 'Категория' },
        { key: 'accessType', label: 'Доступ' },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Медитации</h1>
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} />
                        Добавить медитацию
                    </button>
                </div>

                <AdminTable
                    columns={columns}
                    data={meditations}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>
        </AdminLayout>
    );
};
