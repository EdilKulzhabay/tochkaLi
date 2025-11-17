import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/Admin/AdminLayout';
import { RichTextEditor } from '../../components/Admin/RichTextEditor';
import { MyInput } from '../../components/Admin/MyInput';
import { MyButton } from '../../components/Admin/MyButton';
import { ImageUpload } from '../../components/Admin/ImageUpload';
import { ArrowLeft } from 'lucide-react';
import api from '../../api';
import { toast } from 'react-toastify';

export const MeditationForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    
    const [formData, setFormData] = useState({
        title: '',
        shortDescription: '',
        fullDescription: '',
        imageUrl: '',
        videoUrl: '',
        accessType: 'free',
        starsRequired: 0,
    });

    useEffect(() => {
        if (id) {
            setIsEdit(true);
            fetchMeditation();
        }
    }, [id]);

    const fetchMeditation = async () => {
        try {
            const response = await api.get(`/api/meditation/${id}`);
            const meditation = response.data.data;
            setFormData({
                ...meditation,
                starsRequired: meditation.starsRequired || 0,
            });
        } catch (error: any) {
            toast.error('Ошибка загрузки медитации');
            navigate('/admin/meditation');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEdit) {
                await api.put(`/api/meditation/${id}`, formData);
                toast.success('Медитация обновлена');
            } else {
                await api.post('/api/meditation', formData);
                toast.success('Медитация создана');
            }
            navigate('/admin/meditation');
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
                        onClick={() => navigate('/admin/meditation')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft size={20} />
                        Назад к медитациям
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEdit ? 'Редактировать медитацию' : 'Создать медитацию'}
                    </h1>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <MyInput
                                label="Название"
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Введите название"
                            />

                            <div>
                                <label className="block text-sm font-medium mb-2">Тип доступа</label>
                                <select
                                    value={formData.accessType}
                                    onChange={(e) => setFormData({ ...formData, accessType: e.target.value })}
                                    className="w-full p-2 border rounded-md"
                                >
                                    <option value="free">Бесплатно</option>
                                    <option value="paid">Платно</option>
                                    <option value="subscription">Подписка</option>
                                    <option value="stars">Звёзды</option>
                                </select>
                            </div>
                        </div>

                        {formData.accessType === 'stars' && (
                            <MyInput
                                label="Количество звёзд для доступа"
                                type="number"
                                value={formData.starsRequired.toString()}
                                onChange={(e) => setFormData({ ...formData, starsRequired: parseInt(e.target.value) || 0 })}
                                placeholder="0"
                            />
                        )}

                        <ImageUpload
                            label="Обложка медитации"
                            value={formData.imageUrl}
                            onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                        />

                        <MyInput
                            label="URL видео"
                            type="text"
                            value={formData.videoUrl}
                            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                            placeholder="https://example.com/video.mp4"
                        />

                        <div>
                            <label className="block text-sm font-medium mb-2">Краткое описание</label>
                            <textarea
                                value={formData.shortDescription}
                                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                                className="w-full p-2 border rounded-md"
                                rows={3}
                                maxLength={500}
                                placeholder="До 500 символов"
                            />
                            <span className="text-xs text-gray-500">{formData.shortDescription.length}/500</span>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Полное описание</label>
                            <RichTextEditor
                                value={formData.fullDescription}
                                onChange={(value) => setFormData({ ...formData, fullDescription: value })}
                                placeholder="Введите полное описание"
                                height="400px"
                            />
                        </div>

                        <div className="flex gap-3 justify-end pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/meditation')}
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
