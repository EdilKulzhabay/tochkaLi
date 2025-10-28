import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import { RichTextEditor } from '../../components/RichTextEditor';
import { MyInput } from '../../components/MyInput';
import { MyButton } from '../../components/MyButton';
import { ArrowLeft } from 'lucide-react';
import api from '../../api';
import { toast } from 'react-toastify';

export const FAQForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    
    const [formData, setFormData] = useState({
        question: '',
        answer: '',
    });

    useEffect(() => {
        if (id) {
            setIsEdit(true);
            fetchFAQ();
        }
    }, [id]);

    const fetchFAQ = async () => {
        try {
            const response = await api.get(`/api/faq/${id}`);
            const faq = response.data.data;
            setFormData({
                question: faq.question,
                answer: faq.answer,
            });
        } catch (error: any) {
            toast.error('Ошибка загрузки FAQ');
            navigate('/admin/faq');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEdit) {
                await api.put(`/api/faq/${id}`, formData);
                toast.success('FAQ обновлен');
            } else {
                await api.post('/api/faq', formData);
                toast.success('FAQ создан');
            }
            navigate('/admin/faq');
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
                        onClick={() => navigate('/admin/faq')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft size={20} />
                        Назад к FAQ
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEdit ? 'Редактировать FAQ' : 'Создать FAQ'}
                    </h1>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <MyInput
                            label="Вопрос"
                            type="text"
                            value={formData.question}
                            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                            placeholder="Введите вопрос"
                            required
                        />

                        <div>
                            <label className="block text-sm font-medium mb-2">Ответ</label>
                            <RichTextEditor
                                value={formData.answer}
                                onChange={(value) => setFormData({ ...formData, answer: value })}
                                placeholder="Введите ответ"
                                height="400px"
                            />
                        </div>

                        <div className="flex gap-3 justify-end pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/faq')}
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
