import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/Admin/AdminLayout';
import { AdminTable } from '../../components/Admin/AdminTable';
import { Plus } from 'lucide-react';
import api from '../../api';
import { toast } from 'react-toastify';

export const VideoLessonAdmin = () => {
    const navigate = useNavigate();
    const [videoLessons, setVideoLessons] = useState([]);

    useEffect(() => {
        fetchVideoLessons();
    }, []);

    const fetchVideoLessons = async () => {
        try {
            const response = await api.get('/api/video-lesson');
            setVideoLessons(response.data.data);
        } catch (error: any) {
            toast.error('Ошибка загрузки видео уроков');
        }
    };

    const handleCreate = () => {
        navigate('/admin/video-lesson/create');
    };

    const handleEdit = (item: any) => {
        navigate(`/admin/video-lesson/edit/${item._id}`);
    };

    const handleDelete = async (item: any) => {
        if (!confirm('Вы уверены, что хотите удалить этот видео урок?')) return;

        try {
            await api.delete(`/api/video-lesson/${item._id}`);
            toast.success('Видео урок удален');
            fetchVideoLessons();
        } catch (error: any) {
            toast.error('Ошибка удаления');
        }
    };

    const columns = [
        { key: 'title', label: 'Название' },
        { key: 'order', label: 'Порядок' },
        { 
            key: 'duration', 
            label: 'Длительность',
            render: (value: number) => value ? `${value} мин` : '-'
        },
        { key: 'accessType', label: 'Доступ' },
        { 
            key: 'allowRepeatBonus', 
            label: 'Повторные бонусы',
            render: (value: boolean) => value ? '✅ Да' : '❌ Нет'
        },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Видео уроки</h1>
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} />
                        Добавить видео урок
                    </button>
                </div>

                <AdminTable
                    columns={columns}
                    data={videoLessons}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>
        </AdminLayout>
    );
};

