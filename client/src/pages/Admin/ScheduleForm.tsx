import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/Admin/AdminLayout';
import { RichTextEditor } from '../../components/Admin/RichTextEditor';
import { MyInput } from '../../components/Admin/MyInput';
import { MyButton } from '../../components/Admin/MyButton';
import { ArrowLeft } from 'lucide-react';
import api from '../../api';
import { toast } from 'react-toastify';

export const ScheduleForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    
    const [formData, setFormData] = useState({
        eventTitle: '',
        startDate: '',
        endDate: '',
        eventLink: '',
        description: '',
    });

    useEffect(() => {
        if (id) {
            setIsEdit(true);
            fetchSchedule();
        } else {
            const now = new Date().toISOString().slice(0, 16);
            setFormData(prev => ({
                ...prev,
                startDate: now,
                endDate: now,
            }));
        }
    }, [id]);

    const fetchSchedule = async () => {
        try {
            const response = await api.get(`/api/schedule/${id}`);
            const schedule = response.data.data;
            setFormData({
                eventTitle: schedule.eventTitle,
                startDate: new Date(schedule.startDate).toISOString().slice(0, 16),
                endDate: new Date(schedule.endDate).toISOString().slice(0, 16),
                eventLink: schedule.eventLink || '',
                description: schedule.description,
            });
        } catch (error: any) {
            toast.error('Ошибка загрузки события');
            navigate('/admin/schedule');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEdit) {
                await api.put(`/api/schedule/${id}`, formData);
                toast.success('Событие обновлено');
            } else {
                await api.post('/api/schedule', formData);
                toast.success('Событие создано');
            }
            navigate('/admin/schedule');
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
                        onClick={() => navigate('/admin/schedule')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft size={20} />
                        Назад к расписанию
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEdit ? 'Редактировать событие' : 'Создать событие'}
                    </h1>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <MyInput
                            label="Название события"
                            type="text"
                            value={formData.eventTitle}
                            onChange={(e) => setFormData({ ...formData, eventTitle: e.target.value })}
                            placeholder="Введите название"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <MyInput
                                label="Дата и время начала"
                                type="datetime-local"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            />

                            <MyInput
                                label="Дата и время окончания"
                                type="datetime-local"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            />
                        </div>

                        <MyInput
                            label="Ссылка на событие (необязательно)"
                            type="text"
                            value={formData.eventLink}
                            onChange={(e) => setFormData({ ...formData, eventLink: e.target.value })}
                            placeholder="https://zoom.us/j/..."
                        />

                        <div>
                            <label className="block text-sm font-medium mb-2">Описание</label>
                            <RichTextEditor
                                value={formData.description}
                                onChange={(value) => setFormData({ ...formData, description: value })}
                                placeholder="Введите описание события"
                                height="400px"
                            />
                        </div>

                        <div className="flex gap-3 justify-end pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/schedule')}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Отмена
                            </button>
                            <MyButton
                                text={loading ? 'Сохранение...' : 'Сохранить'}
                                type="submit"
                                disabled={loading}
                            />
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
};
