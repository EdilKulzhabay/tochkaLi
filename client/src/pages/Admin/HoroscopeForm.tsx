import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { RichTextEditor } from '../../components/RichTextEditor';
import { MyInput } from '../../components/MyInput';
import { MyButton } from '../../components/MyButton';
import { DateRangePicker } from '../../components/DateRangePicker';
import { ArrowLeft } from 'lucide-react';
import api from '../../api';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';

interface Line {
    date: string;
    title: string;
    content: string;
}

interface FormData {
    title: string;
    subtitle: string;
    mainContent: string;
    dates: string;
    lines: Line[];
    accessType: string;
    isActive: boolean;
}

export const HoroscopeForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        title: '',
        subtitle: '',
        mainContent: '',
        dates: '',
        lines: [],
        accessType: 'free',
        isActive: true,
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
                title: data.title || '',
                subtitle: data.subtitle || '',
                mainContent: data.mainContent || '',
                dates: data.dates || '',
                lines: data.lines || [],
                accessType: data.accessType || 'free',
                isActive: data.isActive !== undefined ? data.isActive : true,
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
            const newLines = datesList.map(date => {
                // Пытаемся найти существующую линию для этой даты
                const existingLine = formData.lines.find(line => line.date === date);
                return existingLine || {
                    date,
                    title: '',
                    content: ''
                };
            });
            setFormData(prev => ({ ...prev, lines: newLines }));
        }
    };

    const handleLineChange = (index: number, field: 'title' | 'content', value: string) => {
        setFormData(prev => {
            const newLines = [...prev.lines];
            newLines[index] = { ...newLines[index], [field]: value };
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
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Ошибка сохранения');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto space-y-6">
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
                    {/* Основная информация */}
                    <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                        <h2 className="text-xl font-semibold text-gray-900">Основная информация</h2>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <MyInput
                                label="Название"
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Введите название"
                            />

                            <MyInput
                                label="Подзаголовок"
                                type="text"
                                value={formData.subtitle}
                                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                placeholder="Введите подзаголовок"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Основной контент</label>
                            <RichTextEditor
                                value={formData.mainContent}
                                onChange={(value) => setFormData({ ...formData, mainContent: value })}
                                placeholder="Введите основной контент"
                                height="250px"
                            />
                        </div>
                    </div>

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

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            <label htmlFor="isActive" className="text-sm font-medium">
                                Активен
                            </label>
                        </div>
                    </div>

                    {/* Блоки для каждой даты */}
                    {formData.lines.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Данные по датам ({formData.lines.length})
                            </h2>
                            
                            <div className="space-y-6">
                                {formData.lines.map((line, index) => (
                                    <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="font-medium text-gray-700 text-lg">
                                                📅 {line.date}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                День {index + 1}
                                            </span>
                                        </div>
                                        <div className="space-y-3">
                                            <MyInput
                                                label="Заголовок"
                                                type="text"
                                                value={line.title}
                                                onChange={(e) => handleLineChange(index, 'title', e.target.value)}
                                                placeholder="Введите заголовок для этой даты"
                                            />
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Контент</label>
                                                <RichTextEditor
                                                    value={line.content}
                                                    onChange={(value) => handleLineChange(index, 'content', value)}
                                                    placeholder="Введите контент для этой даты"
                                                    height="200px"
                                                />
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

