import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/Admin/AdminLayout';
import { RichTextEditor } from '../../components/Admin/RichTextEditor';
import { MyInput } from '../../components/Admin/MyInput';
import { MyButton } from '../../components/Admin/MyButton';
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
    startTime: string;
    endDate: string;
    endTime: string;
    title: string;
    subtitle: string;
    lines: Line[];
    accessType: string;
}

export const TransitForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        startDate: '',
        startTime: '00:00',
        endDate: '',
        endTime: '23:59',
        title: '',
        subtitle: '',
        lines: [],
        accessType: 'subscription',
    });

    useEffect(() => {
        if (id) {
            fetchTransit();
        }
    }, [id]);

    const fetchTransit = async () => {
        try {
            const response = await api.get(`/api/transit/${id}`);
            const data = response.data.data;
            const startDate = data.startDate ? new Date(data.startDate) : null;
            const endDate = data.endDate ? new Date(data.endDate) : null;
            
            // Извлекаем время в формате HH:mm
            const formatTime = (date: Date) => {
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                return `${hours}:${minutes}`;
            };
            
            setFormData({
                startDate: startDate ? startDate.toISOString().split('T')[0] : '',
                startTime: startDate ? formatTime(startDate) : '00:00',
                endDate: endDate ? endDate.toISOString().split('T')[0] : '',
                endTime: endDate ? formatTime(endDate) : '23:59',
                title: data.title || '',
                subtitle: data.subtitle || '',
                lines: data.lines || [],
                accessType: data.accessType || 'subscription',
            });
        } catch (error: any) {
            toast.error('Ошибка загрузки транзита');
            navigate('/admin/transit');
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
            // Объединяем дату и время
            const combineDateTime = (date: string, time: string) => {
                if (!date) return null;
                const [hours, minutes] = time.split(':');
                const dateTime = new Date(date);
                dateTime.setHours(parseInt(hours || '0', 10));
                dateTime.setMinutes(parseInt(minutes || '0', 10));
                dateTime.setSeconds(0);
                dateTime.setMilliseconds(0);
                return dateTime.toISOString();
            };

            const { startTime, endTime, ...restFormData } = formData;
            const submitData = {
                ...restFormData,
                startDate: combineDateTime(formData.startDate, formData.startTime),
                endDate: combineDateTime(formData.endDate, formData.endTime),
            };

            if (id) {
                await api.put(`/api/transit/${id}`, submitData);
                toast.success('Транзит обновлен');
            } else {
                await api.post('/api/transit', submitData);
                toast.success('Транзит создан');
            }
            navigate('/admin/transit');
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
                        onClick={() => navigate('/admin/transit')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {id ? 'Редактировать транзит' : 'Создать транзит'}
                    </h1>
                </div>

                {/* Форма */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Настройки */}
                    <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                        <h2 className="text-xl font-semibold text-gray-900">Настройки</h2>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <MyInput
                                    label="Начальная дата"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    placeholder="Выберите начальную дату"
                                />
                                <div className="mt-2"></div>
                                <MyInput
                                    label="Начальное время"
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                />
                            </div>
                            <div>
                                <MyInput
                                    label="Конечная дата"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    placeholder="Выберите конечную дату"
                                />
                                <div className="mt-2"></div>
                                <MyInput
                                    label="Конечное время"
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                />
                            </div>
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
                            onClick={() => navigate('/admin/transit')}
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
