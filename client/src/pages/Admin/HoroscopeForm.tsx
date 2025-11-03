import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { RichTextEditor } from '../../components/RichTextEditor';
import { MyInput } from '../../components/MyInput';
import { MyButton } from '../../components/MyButton';
import { DateRangePicker } from '../../components/DateRangePicker';
import { ImageUpload } from '../../components/ImageUpload';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import api from '../../api';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';

interface Line {
    title: string;
    content: string;
}

interface DateContent {
    title: string;
    subtitle: string;
    image: string;
    lines: Line[];
}

interface FormData {
    dates: string;
    datesContent: DateContent[];
    accessType: string;
}

export const HoroscopeForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        dates: '',
        datesContent: [],
        accessType: 'free',
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
                dates: data.dates || '',
                datesContent: data.datesContent || [],
                accessType: data.accessType || 'free',
            });
        } catch (error: any) {
            toast.error('Ошибка загрузки гороскопа');
            navigate('/admin/horoscope');
        }
    };

    // Функция для генерации списка дат из диапазона
    const generateDatesFromRange = (dateRange: string): string[] => {
        const match = dateRange.match(/(\d{4}-\d{2}-\d{2})\s*-\s*(\d{4}-\d{2}-\d{2})/);
        if (!match) return [];

        const [, startStr, endStr] = match;
        const startDate = new Date(startStr);
        const endDate = new Date(endStr);
        const dates: string[] = [];

        const current = new Date(startDate);
        while (current <= endDate) {
            dates.push(current.toISOString().split('T')[0]);
            current.setDate(current.getDate() + 1);
        }

        return dates;
    };

    // Обработчик изменения дат
    const handleDatesChange = (newDates: string) => {
        setFormData(prev => ({ ...prev, dates: newDates }));

        // Если формат корректный, генерируем блоки для каждой даты
        const datesList = generateDatesFromRange(newDates);
        if (datesList.length > 0) {
            const newDatesContent = datesList.map(() => ({
                title: '',
                subtitle: '',
                image: '',
                lines: [],
            }));
            setFormData(prev => ({ ...prev, datesContent: newDatesContent }));
        }
    };

    const handleDateContentChange = (index: number, field: 'title' | 'subtitle' | 'image', value: string) => {
        setFormData(prev => {
            const newDatesContent = [...prev.datesContent];
            newDatesContent[index] = { ...newDatesContent[index], [field]: value };
            return { ...prev, datesContent: newDatesContent };
        });
    };

    const handleLineChange = (dateIndex: number, lineIndex: number, field: 'title' | 'content', value: string) => {
        setFormData(prev => {
            const newDatesContent = [...prev.datesContent];
            newDatesContent[dateIndex].lines[lineIndex] = {
                ...newDatesContent[dateIndex].lines[lineIndex],
                [field]: value
            };
            return { ...prev, datesContent: newDatesContent };
        });
    };

    const addLine = (dateIndex: number) => {
        setFormData(prev => {
            const newDatesContent = [...prev.datesContent];
            newDatesContent[dateIndex].lines.push({
                title: '',
                content: ''
            });
            return { ...prev, datesContent: newDatesContent };
        });
    };

    const removeLine = (dateIndex: number, lineIndex: number) => {
        setFormData(prev => {
            const newDatesContent = [...prev.datesContent];
            newDatesContent[dateIndex].lines.splice(lineIndex, 1);
            return { ...prev, datesContent: newDatesContent };
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
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Ошибка сохранения');
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
                            <DateRangePicker
                                label="Даты"
                                value={formData.dates}
                                onChange={handleDatesChange}
                                placeholder="Выберите даты"
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
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Контент для каждой даты */}
                    {formData.datesContent.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Контент по датам ({formData.datesContent.length})
                            </h2>
                            
                            <div className="space-y-8">
                                {formData.datesContent.map((dateContent, dateIndex) => (
                                    <div key={dateIndex} className="p-6 border-2 border-blue-200 rounded-lg bg-blue-50">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="font-bold text-gray-900 text-xl">
                                                День {dateIndex + 1}
                                            </span>
                                            <span className="text-sm text-gray-600">
                                                {(() => {
                                                    const datesList = generateDatesFromRange(formData.dates);
                                                    return datesList[dateIndex];
                                                })()}
                                            </span>
                                        </div>

                                        <div className="space-y-4">
                                            <MyInput
                                                label="Заголовок"
                                                type="text"
                                                value={dateContent.title}
                                                onChange={(e) => handleDateContentChange(dateIndex, 'title', e.target.value)}
                                                placeholder="Введите заголовок"
                                            />

                                            <MyInput
                                                label="Подзаголовок"
                                                type="text"
                                                value={dateContent.subtitle}
                                                onChange={(e) => handleDateContentChange(dateIndex, 'subtitle', e.target.value)}
                                                placeholder="Введите подзаголовок"
                                            />

                                            <ImageUpload
                                                value={dateContent.image}
                                                onChange={(url) => handleDateContentChange(dateIndex, 'image', url)}
                                                label="Изображение"
                                            />

                                            {/* Lines */}
                                            <div className="mt-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <label className="block text-sm font-medium">Элементы контента</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => addLine(dateIndex)}
                                                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                    >
                                                        <Plus size={16} />
                                                        Добавить элемент
                                                    </button>
                                                </div>

                                                <div className="space-y-4">
                                                    {dateContent.lines.map((line, lineIndex) => (
                                                        <div key={lineIndex} className="p-4 border border-gray-300 rounded-lg bg-white">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <span className="text-sm font-medium text-gray-700">
                                                                    Элемент {lineIndex + 1}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeLine(dateIndex, lineIndex)}
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
                                                                    onChange={(e) => handleLineChange(dateIndex, lineIndex, 'title', e.target.value)}
                                                                    placeholder="Введите заголовок"
                                                                />

                                                                <div>
                                                                    <label className="block text-sm font-medium mb-2">Содержание</label>
                                                                    <RichTextEditor
                                                                        value={line.content}
                                                                        onChange={(value) => handleLineChange(dateIndex, lineIndex, 'content', value)}
                                                                        placeholder="Введите содержание"
                                                                        height="200px"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {dateContent.lines.length === 0 && (
                                                        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                                                            Нет элементов контента. Нажмите "Добавить элемент" чтобы начать.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

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
                            onClick={() => {}}
                            disabled={loading}
                        />
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};
