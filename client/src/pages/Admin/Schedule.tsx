import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { AdminTable } from '../../components/AdminTable';
import { Modal } from '../../components/Modal';
import { RichTextEditor } from '../../components/RichTextEditor';
import { MyInput } from '../../components/MyInput';
import { MyButton } from '../../components/MyButton';
import { Plus } from 'lucide-react';
import api from '../../api';
import { toast } from 'react-toastify';

export const ScheduleAdmin = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    
    const [formData, setFormData] = useState({
        eventTitle: '',
        eventDate: '',
        location: '',
        eventLink: '',
        description: '',
        isActive: true,
    });

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        try {
            const response = await api.get('/api/schedule');
            setSchedules(response.data.data);
        } catch (error: any) {
            toast.error('Ошибка загрузки расписания');
        }
    };

    const handleOpenModal = (item?: any) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                eventTitle: item.eventTitle,
                eventDate: new Date(item.eventDate).toISOString().slice(0, 16),
                location: item.location,
                eventLink: item.eventLink || '',
                description: item.description,
                isActive: item.isActive,
            });
        } else {
            setEditingItem(null);
            setFormData({
                eventTitle: '',
                eventDate: new Date().toISOString().slice(0, 16),
                location: '',
                eventLink: '',
                description: '',
                isActive: true,
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingItem) {
                await api.put(`/api/schedule/${editingItem._id}`, formData);
                toast.success('Событие обновлено');
            } else {
                await api.post('/api/schedule', formData);
                toast.success('Событие создано');
            }
            fetchSchedules();
            handleCloseModal();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Ошибка сохранения');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (item: any) => {
        if (!confirm('Вы уверены, что хотите удалить это событие?')) return;

        try {
            await api.delete(`/api/schedule/${item._id}`);
            toast.success('Событие удалено');
            fetchSchedules();
        } catch (error: any) {
            toast.error('Ошибка удаления');
        }
    };

    const columns = [
        { key: 'eventTitle', label: 'Название события' },
        { 
            key: 'eventDate', 
            label: 'Дата и время',
            render: (value: string) => new Date(value).toLocaleString('ru-RU')
        },
        { key: 'location', label: 'Место' },
        { 
            key: 'isActive', 
            label: 'Статус',
            render: (value: boolean) => value ? 'Активно' : 'Неактивно'
        },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Расписание</h1>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} />
                        Добавить событие
                    </button>
                </div>

                <AdminTable
                    columns={columns}
                    data={schedules}
                    onEdit={handleOpenModal}
                    onDelete={handleDelete}
                />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingItem ? 'Редактировать событие' : 'Создать событие'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <MyInput
                        label="Название события"
                        type="text"
                        value={formData.eventTitle}
                        onChange={(e) => setFormData({ ...formData, eventTitle: e.target.value })}
                        placeholder="Введите название"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <MyInput
                            label="Дата и время"
                            type="datetime-local"
                            value={formData.eventDate}
                            onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                        />

                        <MyInput
                            label="Место проведения"
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="Zoom, Адрес и т.д."
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
                            height="300px"
                        />
                    </div>

                    <div className="flex gap-3 justify-end pt-4">
                        <button
                            type="button"
                            onClick={handleCloseModal}
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
            </Modal>
        </AdminLayout>
    );
};

