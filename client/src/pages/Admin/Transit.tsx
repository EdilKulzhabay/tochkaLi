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

export const TransitAdmin = () => {
    const [transits, setTransits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        planet: '',
        aspect: '',
        intensity: 'medium',
        startDate: '',
        endDate: '',
        affectedZodiacs: [] as string[],
        accessType: 'free',
        isActive: true,
    });

    useEffect(() => {
        fetchTransits();
    }, []);

    const fetchTransits = async () => {
        try {
            const response = await api.get('/api/transit');
            setTransits(response.data.data);
        } catch (error: any) {
            toast.error('Ошибка загрузки транзитов');
        }
    };

    const handleOpenModal = (item?: any) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                ...item,
                startDate: item.startDate.split('T')[0],
                endDate: item.endDate.split('T')[0],
            });
        } else {
            setEditingItem(null);
            setFormData({
                title: '',
                category: '',
                description: '',
                planet: '',
                aspect: '',
                intensity: 'medium',
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0],
                affectedZodiacs: [],
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
                await api.put(`/api/transit/${editingItem._id}`, formData);
                toast.success('Транзит обновлен');
            } else {
                await api.post('/api/transit', formData);
                toast.success('Транзит создан');
            }
            fetchTransits();
            handleCloseModal();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Ошибка сохранения');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (item: any) => {
        if (!confirm('Вы уверены, что хотите удалить этот транзит?')) return;

        try {
            await api.delete(`/api/transit/${item._id}`);
            toast.success('Транзит удален');
            fetchTransits();
        } catch (error: any) {
            toast.error('Ошибка удаления');
        }
    };

    const toggleZodiac = (sign: string) => {
        setFormData(prev => ({
            ...prev,
            affectedZodiacs: prev.affectedZodiacs.includes(sign)
                ? prev.affectedZodiacs.filter(s => s !== sign)
                : [...prev.affectedZodiacs, sign]
        }));
    };

    const columns = [
        { key: 'title', label: 'Название' },
        { key: 'planet', label: 'Планета' },
        { key: 'aspect', label: 'Аспект' },
        { 
            key: 'intensity', 
            label: 'Интенсивность',
            render: (value: string) => {
                const colors = { low: 'green', medium: 'yellow', high: 'red' };
                return <span className={`px-2 py-1 rounded text-${colors[value as keyof typeof colors]}-700 bg-${colors[value as keyof typeof colors]}-100`}>{value}</span>;
            }
        },
        { 
            key: 'startDate', 
            label: 'Начало',
            render: (value: string) => new Date(value).toLocaleDateString('ru-RU')
        },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Транзиты</h1>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} />
                        Добавить транзит
                    </button>
                </div>

                <AdminTable
                    columns={columns}
                    data={transits}
                    onEdit={handleOpenModal}
                    onDelete={handleDelete}
                />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingItem ? 'Редактировать транзит' : 'Создать транзит'}
                maxWidth="900px"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <MyInput
                        label="Название"
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Например: Меркурий в ретрограде"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <MyInput
                            label="Категория"
                            type="text"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            placeholder="Например: Ретроградность"
                        />

                        <div>
                            <label className="block text-sm font-medium mb-2">Интенсивность</label>
                            <select
                                value={formData.intensity}
                                onChange={(e) => setFormData({ ...formData, intensity: e.target.value })}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="low">Низкая</option>
                                <option value="medium">Средняя</option>
                                <option value="high">Высокая</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <MyInput
                            label="Планета"
                            type="text"
                            value={formData.planet}
                            onChange={(e) => setFormData({ ...formData, planet: e.target.value })}
                            placeholder="Меркурий, Венера..."
                        />

                        <MyInput
                            label="Аспект"
                            type="text"
                            value={formData.aspect}
                            onChange={(e) => setFormData({ ...formData, aspect: e.target.value })}
                            placeholder="Ретроград, Соединение..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <MyInput
                            label="Дата начала"
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />

                        <MyInput
                            label="Дата окончания"
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                    </div>

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

                    <div>
                        <label className="block text-sm font-medium mb-2">Затронутые знаки зодиака</label>
                        <div className="grid grid-cols-4 gap-2">
                            {zodiacSigns.map(sign => (
                                <label key={sign} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="checkbox"
                                        checked={formData.affectedZodiacs.includes(sign)}
                                        onChange={() => toggleZodiac(sign)}
                                        className="rounded"
                                    />
                                    <span className="text-sm">{sign}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Описание</label>
                        <RichTextEditor
                            value={formData.description}
                            onChange={(value) => setFormData({ ...formData, description: value })}
                            placeholder="Введите описание транзита"
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

