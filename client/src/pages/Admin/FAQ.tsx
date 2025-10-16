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

export const FAQAdmin = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    
    const [formData, setFormData] = useState({
        question: '',
        answer: '',
    });

    useEffect(() => {
        fetchFAQs();
    }, []);

    const fetchFAQs = async () => {
        try {
            const response = await api.get('/api/faq');
            setFaqs(response.data.data);
        } catch (error: any) {
            toast.error('Ошибка загрузки FAQ');
        }
    };

    const handleOpenModal = (item?: any) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                question: item.question,
                answer: item.answer,
            });
        } else {
            setEditingItem(null);
            setFormData({ question: '', answer: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({ question: '', answer: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingItem) {
                await api.put(`/api/faq/${editingItem._id}`, formData);
                toast.success('FAQ обновлен');
            } else {
                await api.post('/api/faq', formData);
                toast.success('FAQ создан');
            }
            fetchFAQs();
            handleCloseModal();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Ошибка сохранения');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (item: any) => {
        if (!confirm('Вы уверены, что хотите удалить этот FAQ?')) return;

        try {
            await api.delete(`/api/faq/${item._id}`);
            toast.success('FAQ удален');
            fetchFAQs();
        } catch (error: any) {
            toast.error('Ошибка удаления');
        }
    };

    const columns = [
        { key: 'question', label: 'Вопрос' },
        { 
            key: 'answer', 
            label: 'Ответ',
            render: (value: string) => (
                <div 
                    className="max-w-xs truncate" 
                    dangerouslySetInnerHTML={{ __html: value }}
                />
            )
        },
        { 
            key: 'createdAt', 
            label: 'Создан',
            render: (value: string) => new Date(value).toLocaleDateString('ru-RU')
        },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">FAQ</h1>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} />
                        Добавить FAQ
                    </button>
                </div>

                <AdminTable
                    columns={columns}
                    data={faqs}
                    onEdit={handleOpenModal}
                    onDelete={handleDelete}
                />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingItem ? 'Редактировать FAQ' : 'Создать FAQ'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <MyInput
                        label="Вопрос"
                        type="text"
                        value={formData.question}
                        onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                        placeholder="Введите вопрос"
                    />

                    <div>
                        <label className="block text-sm font-medium mb-2">Ответ</label>
                        <RichTextEditor
                            value={formData.answer}
                            onChange={(value) => setFormData({ ...formData, answer: value })}
                            placeholder="Введите ответ"
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

