import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/Admin/AdminLayout';
import { RichTextEditor } from '../../components/Admin/RichTextEditor';
import { MyInput } from '../../components/Admin/MyInput';
import { MyButton } from '../../components/Admin/MyButton';
import { ImageUpload } from '../../components/Admin/ImageUpload';
import { MonthDayInput } from '../../components/Admin/MonthDayInput';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import api from '../../api';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';

interface Line {
    title: string;
    content: string;
}

interface FormData {
    startDate: string;
    endDate: string;
    title: string;
    subtitle: string;
    image: string;
    lines: Line[];
    accessType: string;
    energyCorridor: boolean;
}

export const HoroscopeForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        startDate: '',
        endDate: '',
        title: '',
        subtitle: '',
        image: '',
        lines: [],
        accessType: 'subscription', 
        energyCorridor: false,
    });

    useEffect(() => {
        if (id) {
            fetchHoroscope();
        }
    }, [id]);

    const fetchHoroscope = async () => {
        try {
            const response = await api.get(`/api/horoscope/${id}`);
            const data = response.data.data;
            setFormData({
                startDate: data.startDate || '',
                endDate: data.endDate || '',
                title: data.title || '',
                subtitle: data.subtitle || '',
                image: data.image || '',
                lines: data.lines || [],
                accessType: data.accessType || 'free',
                energyCorridor: data.energyCorridor || false,
            });
        } catch (error) {
            toast.error('Ошибка загрузки гороскопа');
            navigate('/admin/horoscope');
        }
    };

    const handleLineChange = (lineIndex: number, field: 'title' | 'content', value: string) => {
        setFormData(prev => {
            const newLines = [...prev.lines];
            newLines[lineIndex] = {
                ...newLines[lineIndex],
                [field]: value
            };
            return { ...prev, lines: newLines };
        });
    };

    const addLine = () => {
        setFormData(prev => ({
            ...prev,
            lines: [...prev.lines, { title: '', content: '' }]
        }));
    };

    const removeLine = (lineIndex: number) => {
        setFormData(prev => {
            const newLines = [...prev.lines];
            newLines.splice(lineIndex, 1);
            return { ...prev, lines: newLines };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (id) {
                await api.put(`/api/horoscope/${id}`, formData);
                toast.success('Гороскоп обновлен');
            } else {
                await api.post('/api/horoscope', formData);
                toast.success('Гороскоп создан');
            }
            navigate('/admin/horoscope');
        } catch (error) {
            toast.error('Ошибка сохранения');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Заголовок с кнопкой назад */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/horoscope')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {id ? 'Редактировать гороскоп' : 'Создать гороскоп'}
                    </h1>
                </div>

                {/* Форма */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Настройки */}
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

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="energyCorridor"
                                checked={formData.energyCorridor}
                                onChange={(e) => setFormData({ ...formData, energyCorridor: e.target.checked })}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="energyCorridor" className="text-sm font-medium text-gray-700">
                                Энергетический коридор
                            </label>
                        </div>
                    </div>

                    {/* Основной контент */}
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

                    {/* Элементы контента */}
                    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">Элементы контента</h2>
                        </div>

                        <div className="space-y-4">
                            {formData.lines.map((line, lineIndex) => (
                                <div key={lineIndex} className="p-4 border border-gray-300 rounded-lg bg-gray-50">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-medium text-gray-700">
                                            Элемент {lineIndex + 1}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeLine(lineIndex)}
                                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        <MyInput
                                            label="Заголовок элемента"
                                            type="text"
                                            value={line.title}
                                            onChange={(e) => handleLineChange(lineIndex, 'title', e.target.value)}
                                            placeholder="Введите заголовок"
                                        />

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Содержание</label>
                                            <RichTextEditor
                                                value={line.content}
                                                onChange={(value) => handleLineChange(lineIndex, 'content', value)}
                                                placeholder="Введите содержание"
                                                height="200px"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {formData.lines.length === 0 && (
                                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                                    Нет элементов контента. Нажмите "Добавить элемент" чтобы начать.
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end">
                            <button
                                type="button"
                                onClick={addLine}
                                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus size={16} />
                                Добавить элемент
                            </button>
                        </div>
                    </div>

                    {/* Кнопки действий */}
                    <div className="flex gap-3 justify-end bg-white rounded-lg shadow-sm p-6">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/horoscope')}
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
