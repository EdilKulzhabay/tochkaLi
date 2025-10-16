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

export const PracticeAdmin = () => {
    const [practices, setPractices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        category: '',
        shortDescription: '',
        fullDescription: '',
        imageUrl: '',
        videoUrl: '',
        accessType: 'free',
        isActive: true,
    });

    useEffect(() => {
        fetchPractices();
    }, []);

    const fetchPractices = async () => {
        try {
            const response = await api.get('/api/practice');
            setPractices(response.data.data);
        } catch (error: any) {
            toast.error('Ошибка загрузки практик');
        }
    };

    const handleOpenModal = (item?: any) => {
        if (item) {
            setEditingItem(item);
            setFormData(item);
        } else {
            setEditingItem(null);
            setFormData({
                title: '',
                subtitle: '',
                category: '',
                shortDescription: '',
                fullDescription: '',
                imageUrl: '',
                videoUrl: '',
                accessType: 'free',
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
                await api.put(`/api/practice/${editingItem._id}`, formData);
                toast.success('Практика обновлена');
            } else {
                await api.post('/api/practice', formData);
                toast.success('Практика создана');
            }
            fetchPractices();
            handleCloseModal();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Ошибка сохранения');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (item: any) => {
        if (!confirm('Вы уверены, что хотите удалить эту практику?')) return;

        try {
            await api.delete(`/api/practice/${item._id}`);
            toast.success('Практика удалена');
            fetchPractices();
        } catch (error: any) {
            toast.error('Ошибка удаления');
        }
    };

    const columns = [
        { key: 'title', label: 'Название' },
        { key: 'category', label: 'Категория' },
        { key: 'accessType', label: 'Доступ' },
        { 
            key: 'isActive', 
            label: 'Статус',
            render: (value: boolean) => value ? 'Активна' : 'Неактивна'
        },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Практики</h1>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} />
                        Добавить практику
                    </button>
                </div>

                <AdminTable
                    columns={columns}
                    data={practices}
                    onEdit={handleOpenModal}
                    onDelete={handleDelete}
                />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingItem ? 'Редактировать практику' : 'Создать практику'}
                maxWidth="900px"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
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

                    <div className="grid grid-cols-2 gap-4">
                        <MyInput
                            label="Категория"
                            type="text"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            placeholder="Например: Дыхание, Йога"
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

                    <MyInput
                        label="URL изображения"
                        type="text"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        placeholder="https://example.com/image.jpg"
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
                            height="350px"
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

