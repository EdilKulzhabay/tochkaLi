import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/Admin/AdminLayout';
import { MyInput } from '../../components/Admin/MyInput';
import { MyButton } from '../../components/Admin/MyButton';
import { ImageUpload } from '../../components/Admin/ImageUpload';
import { ArrowLeft } from 'lucide-react';
import api from '../../api';
import { toast } from 'react-toastify';

export const SchumannForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    
    const [formData, setFormData] = useState({
        date: '',
        image: '',
    });

    useEffect(() => {
        if (id) {
            setIsEdit(true);
            fetchSchumann();
        } else {
            // Устанавливаем текущую дату по умолчанию
            setFormData(prev => ({
                ...prev,
                date: new Date().toISOString().slice(0, 10),
            }));
        }
    }, [id]);

    const fetchSchumann = async () => {
        try {
            const response = await api.get(`/api/schumann/${id}`);
            const schumann = response.data.data;
            setFormData({
                date: new Date(schumann.date).toISOString().slice(0, 10),
                image: schumann.image || '',
            });
        } catch (error: any) {
            toast.error('Ошибка загрузки записи о частоте Шумана');
            navigate('/admin/schumann');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const dataToSend = {
                date: new Date(formData.date).toISOString(),
                image: formData.image,
            };

            if (isEdit) {
                await api.put(`/api/schumann/${id}`, dataToSend);
                toast.success('Запись о частоте Шумана обновлена');
            } else {
                await api.post('/api/schumann', dataToSend);
                toast.success('Запись о частоте Шумана создана');
            }
            navigate('/admin/schumann');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Ошибка сохранения');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/schumann')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft size={20} />
                        Назад к частоте Шумана
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEdit ? 'Редактировать запись о частоте Шумана' : 'Создать запись о частоте Шумана'}
                    </h1>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <MyInput
                            label="Дата"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                        />

                        <ImageUpload
                            value={formData.image}
                            onChange={(url) => setFormData({ ...formData, image: url })}
                            label="Изображение"
                        />

                        <div className="flex gap-3 justify-end pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/schumann')}
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
                </div>
            </div>
        </AdminLayout>
    );
};
