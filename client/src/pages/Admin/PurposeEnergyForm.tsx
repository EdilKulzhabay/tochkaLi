import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '../../components/Admin/AdminLayout';
import { RichTextEditor } from '../../components/Admin/RichTextEditor';
import { MyInput } from '../../components/Admin/MyInput';
import { MyButton } from '../../components/Admin/MyButton';
import { ImageUpload } from '../../components/Admin/ImageUpload';
import { MonthDayInput } from '../../components/Admin/MonthDayInput';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import api from '../../api';
import { toast } from 'react-toastify';

interface ContentItem {
    type: 'video' | 'rutube' | 'text' | 'image';
    videoUrl?: string;
    ruTubeUrl?: string;
    text?: string;
    image?: string;
}

interface FormData {
    startDate: string;
    endDate: string;
    title: string;
    subtitle: string;
    image: string;
    content: ContentItem[];
    accessType: string;
}

export const PurposeEnergyForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [showTypePicker, setShowTypePicker] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        startDate: '',
        endDate: '',
        title: '',
        subtitle: '',
        image: '',
        content: [],
        accessType: 'subscription',
    });

    useEffect(() => {
        if (id) {
            fetchItem();
        }
    }, [id]);

    const fetchItem = async () => {
        try {
            const response = await api.get(`/api/purpose-energy/${id}`);
            const data = response.data.data;
            const mappedContent: ContentItem[] = (data.content || []).map((item: ContentItem) => {
                const inferredType = item.type
                    || (item.videoUrl ? 'video' : item.ruTubeUrl ? 'rutube' : item.image ? 'image' : 'text');
                return {
                    type: inferredType,
                    videoUrl: item.videoUrl || '',
                    ruTubeUrl: item.ruTubeUrl || '',
                    text: item.text || '',
                    image: item.image || '',
                };
            });
            setFormData({
                startDate: data.startDate || '',
                endDate: data.endDate || '',
                title: data.title || '',
                subtitle: data.subtitle || '',
                image: data.image || '',
                content: mappedContent,
                accessType: data.accessType || 'subscription',
            });
        } catch (error) {
            toast.error('Ошибка загрузки энергии предназначения');
            navigate('/admin/purpose-energy');
        }
    };

    const handleContentChange = (index: number, field: keyof ContentItem, value: string) => {
        setFormData(prev => {
            const newContent = [...prev.content];
            newContent[index] = {
                ...newContent[index],
                [field]: value
            };
            return { ...prev, content: newContent };
        });
    };

    const addContentItem = (type: ContentItem['type']) => {
        setFormData(prev => ({
            ...prev,
            content: [...prev.content, { type, videoUrl: '', ruTubeUrl: '', text: '', image: '' }]
        }));
        setShowTypePicker(false);
    };

    const removeContentItem = (index: number) => {
        setFormData(prev => {
            const newContent = [...prev.content];
            newContent.splice(index, 1);
            return { ...prev, content: newContent };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (id) {
                await api.put(`/api/purpose-energy/${id}`, formData);
                toast.success('Энергия предназначения обновлена');
            } else {
                await api.post('/api/purpose-energy', formData);
                toast.success('Энергия предназначения создана');
            }
            navigate('/admin/purpose-energy');
        } catch (error) {
            toast.error('Ошибка сохранения');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/purpose-energy')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {id ? 'Редактировать энергию предназначения' : 'Создать энергию предназначения'}
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                        <h2 className="text-xl font-semibold text-gray-900">Настройки</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <MonthDayInput
                                label="Начальная дата"
                                value={formData.startDate}
                                onChange={(value) => setFormData({ ...formData, startDate: value })}
                                placeholder="Выберите начальную дату"
                            />
                            <MonthDayInput
                                label="Конечная дата"
                                value={formData.endDate}
                                onChange={(value) => setFormData({ ...formData, endDate: value })}
                                placeholder="Выберите конечную дату"
                                min={formData.startDate || undefined}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Доступ</label>
                            <select
                                value={formData.accessType}
                                onChange={(e) => setFormData({ ...formData, accessType: e.target.value })}
                                className="w-full p-2 rounded-md border border-gray-300"
                            >
                                <option value="free">Бесплатно</option>
                                <option value="paid">Платно</option>
                                <option value="subscription">Подписка</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                        <h2 className="text-xl font-semibold text-gray-900">Основной контент</h2>

                        <MyInput
                            label="Заголовок"
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Введите заголовок"
                        />

                        <MyInput
                            label="Подзаголовок"
                            type="text"
                            value={formData.subtitle}
                            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                            placeholder="Введите подзаголовок"
                        />

                        <ImageUpload
                            value={formData.image}
                            onChange={(url) => setFormData({ ...formData, image: url })}
                            label="Изображение"
                        />
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">Элементы контента</h2>
                        </div>

                        <div className="space-y-4">
                            {formData.content.map((item, index) => (
                                <div key={index} className="p-4 border border-gray-300 rounded-lg bg-gray-50">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-medium text-gray-700">
                                            Элемент {index + 1}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeContentItem(index)}
                                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-medium">Тип контента</label>
                                            <select
                                                value={item.type}
                                                onChange={(e) => handleContentChange(index, 'type', e.target.value)}
                                                className="w-full p-2 rounded-md border border-gray-300"
                                            >
                                                <option value="video">Видео</option>
                                                <option value="rutube">RuTube</option>
                                                <option value="text">Текст</option>
                                                <option value="image">Изображение</option>
                                            </select>
                                        </div>

                                        {item.type === 'video' && (
                                            <MyInput
                                                label="Ссылка на видео"
                                                type="text"
                                                value={item.videoUrl || ''}
                                                onChange={(e) => handleContentChange(index, 'videoUrl', e.target.value)}
                                                placeholder="https://..."
                                            />
                                        )}

                                        {item.type === 'rutube' && (
                                            <MyInput
                                                label="Ссылка на RuTube"
                                                type="text"
                                                value={item.ruTubeUrl || ''}
                                                onChange={(e) => handleContentChange(index, 'ruTubeUrl', e.target.value)}
                                                placeholder="https://..."
                                            />
                                        )}

                                        {item.type === 'image' && (
                                            <ImageUpload
                                                value={item.image || ''}
                                                onChange={(url) => handleContentChange(index, 'image', url)}
                                                label="Изображение"
                                            />
                                        )}

                                        {item.type === 'text' && (
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Текст</label>
                                                <RichTextEditor
                                                    value={item.text || ''}
                                                    onChange={(value) => handleContentChange(index, 'text', value)}
                                                    placeholder="Введите текст"
                                                    height="200px"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {formData.content.length === 0 && (
                                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                                    Нет элементов контента. Нажмите "Добавить элемент", чтобы начать.
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col items-end gap-3">
                            {showTypePicker && (
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => addContentItem('video')}
                                        className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Ссылка на видео
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => addContentItem('rutube')}
                                        className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Ссылка на RuTube
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => addContentItem('text')}
                                        className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Текст
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => addContentItem('image')}
                                        className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Изображение
                                    </button>
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => setShowTypePicker((prev) => !prev)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus size={16} />
                                Добавить элемент
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end bg-white rounded-lg shadow-sm p-6">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/purpose-energy')}
                            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
        </AdminLayout>
    );
};

