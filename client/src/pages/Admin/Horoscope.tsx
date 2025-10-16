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

const zodiacSigns = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export const HoroscopeAdmin = () => {
    const [horoscopes, setHoroscopes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    
    const [formData, setFormData] = useState({
        zodiacSign: 'Aries',
        period: '',
        title: '',
        date: '',
        content: '',
        accessType: 'free',
        isActive: true,
    });

    useEffect(() => {
        fetchHoroscopes();
    }, []);

    const fetchHoroscopes = async () => {
        try {
            const response = await api.get('/api/horoscope');
            setHoroscopes(response.data.data);
        } catch (error: any) {
            toast.error('Ошибка загрузки гороскопов');
        }
    };

    const handleOpenModal = (item?: any) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                zodiacSign: item.zodiacSign,
                period: item.period,
                title: item.title,
                date: item.date.split('T')[0],
                content: item.content,
                accessType: item.accessType,
                isActive: item.isActive,
            });
        } else {
            setEditingItem(null);
            setFormData({
                zodiacSign: 'Aries',
                period: '',
                title: '',
                date: new Date().toISOString().split('T')[0],
                content: '',
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
                await api.put(`/api/horoscope/${editingItem._id}`, formData);
                toast.success('Гороскоп обновлен');
            } else {
                await api.post('/api/horoscope', formData);
                toast.success('Гороскоп создан');
            }
            fetchHoroscopes();
            handleCloseModal();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Ошибка сохранения');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (item: any) => {
        if (!confirm('Вы уверены, что хотите удалить этот гороскоп?')) return;

        try {
            await api.delete(`/api/horoscope/${item._id}`);
            toast.success('Гороскоп удален');
            fetchHoroscopes();
        } catch (error: any) {
            toast.error('Ошибка удаления');
        }
    };

    const columns = [
        { key: 'zodiacSign', label: 'Знак зодиака' },
        { key: 'period', label: 'Период' },
        { key: 'title', label: 'Заголовок' },
        { 
            key: 'date', 
            label: 'Дата',
            render: (value: string) => new Date(value).toLocaleDateString('ru-RU')
        },
        { key: 'accessType', label: 'Доступ' },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Гороскопы</h1>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} />
                        Добавить гороскоп
                    </button>
                </div>

                <AdminTable
                    columns={columns}
                    data={horoscopes}
                    onEdit={handleOpenModal}
                    onDelete={handleDelete}
                />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingItem ? 'Редактировать гороскоп' : 'Создать гороскоп'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Знак зодиака</label>
                            <select
                                value={formData.zodiacSign}
                                onChange={(e) => setFormData({ ...formData, zodiacSign: e.target.value })}
                                className="w-full p-2 border rounded-md"
                            >
                                {zodiacSigns.map(sign => (
                                    <option key={sign} value={sign}>{sign}</option>
                                ))}
                            </select>
                        </div>

                        <MyInput
                            label="Период"
                            type="text"
                            value={formData.period}
                            onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                            placeholder="Ежедневный, Еженедельный..."
                        />
                    </div>

                    <MyInput
                        label="Заголовок"
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Введите заголовок"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <MyInput
                            label="Дата"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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

                    <div>
                        <label className="block text-sm font-medium mb-2">Содержание</label>
                        <RichTextEditor
                            value={formData.content}
                            onChange={(value) => setFormData({ ...formData, content: value })}
                            placeholder="Введите текст гороскопа"
                            height="400px"
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

