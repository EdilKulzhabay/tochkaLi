import bgGar from '../../assets/bgGar.png';
import { ClientInput } from '../../components/User/ClientInput';
import { useState, useEffect } from 'react';
import { RedButton } from '../../components/User/RedButton';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';

export const ClientPerfomance = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { updateUser } = useAuth();
    useEffect(() => {
        // Загружаем данные из localStorage если есть
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.fullName) {
                    const nameParts = user.fullName.split(' ');
                    if (nameParts.length >= 2) {
                        setLastName(nameParts[0]);
                        setFirstName(nameParts.slice(1).join(' '));
                    } else if (nameParts.length === 1) {
                        setFirstName(nameParts[0]);
                    }
                }
            } catch (e) {
                console.error('Ошибка парсинга пользователя:', e);
            }
        }
    }, []);

    const handleContinue = async () => {
        if (firstName.trim() === '' || lastName.trim() === '') {
            toast.error('Пожалуйста, заполните все поля');
            return;
        }

        const telegramId = localStorage.getItem('telegramId');
        if (!telegramId) {
            toast.error('Ошибка: не найден telegramId');
            return;
        }

        setLoading(true);
        try {
            const fullName = `${lastName.trim()} ${firstName.trim()}`.trim();
            
            const response = await api.patch(`/api/users/${telegramId}`, {
                fullName,
            });

            if (response.data.success && response.data.data) {
                // Сохраняем обновленные данные пользователя в localStorage и обновляем контекст
                localStorage.setItem('user', JSON.stringify(response.data.data));
                localStorage.setItem('firstName', firstName);
                localStorage.setItem('lastName', lastName);
                updateUser(response.data.data);
                toast.success('Данные сохранены');
                navigate('/main');
            } else {
                toast.error('Ошибка обновления данных');
            }
        } catch (error: any) {
            console.error('Ошибка обновления пользователя:', error);
            toast.error(error.response?.data?.message || 'Ошибка обновления данных');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div 
            style={{
                height: '100vh',
                backgroundImage: `url(${bgGar})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
            className='px-4 pb-6 flex flex-col justify-between'
        >
            <div className='flex-1'>
                <div className='h-[45%]' />
                <h1 className='text-[48px] font-semibold text-white leading-12'>Представьтесь пожалуйста</h1>
                <div className='mt-6 space-y-3'>
                    <ClientInput
                        placeholder="Фамилия"
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full"
                        inputType="text"
                    />
                    <ClientInput
                        placeholder="Имя"
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full"
                        inputType="text"
                    />
                </div>
            </div>

            <div>
                <button 
                    onClick={() => navigate(-1)}
                    className='w-full mt-4 bg-white/10 block text-white py-2.5 text-center font-medium rounded-full'
                >Назад</button>
                <RedButton 
                    text={loading ? 'Сохранение...' : 'Продолжить'} 
                    onClick={handleContinue} 
                    className='w-full mt-4'
                    disabled={loading}
                />
            </div>
        </div>
    );
};