import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { AdminTable } from '../../components/AdminTable';
import { Plus } from 'lucide-react';
import api from '../../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export const HoroscopeAdmin = () => {
    const navigate = useNavigate();
    const [horoscopes, setHoroscopes] = useState([]);

    useEffect(() => {
        fetchHoroscopes();
    }, []);

    const fetchHoroscopes = async () => {
        try {
            const response = await api.get('/api/horoscope');
            setHoroscopes(response.data.data);
        } catch (error: any) {
            toast.error('Ошибка загрузки гороскопов');
        }
    };

    const handleOpenForm = (item?: any) => {
        if (item) {
            navigate(`/admin/horoscope/edit/${item._id}`);
        } else {
            navigate('/admin/horoscope/create');
        }
    };

    const handleDelete = async (item: any) => {
        if (!confirm('Вы уверены, что хотите удалить этот гороскоп?')) return;

        try {
            await api.delete(`/api/horoscope/${item._id}`);
            toast.success('Гороскоп удален');
            fetchHoroscopes();
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
                    <h1 className="text-3xl font-bold text-gray-900">Гороскопы</h1>
                    <button
                        onClick={() => handleOpenForm()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} />
                        Добавить гороскоп
                    </button>
                </div>

                <AdminTable
                    columns={columns}
                    data={horoscopes}
                    onEdit={handleOpenForm}
                    onDelete={handleDelete}
                />
            </div>
        </AdminLayout>
    );
};
