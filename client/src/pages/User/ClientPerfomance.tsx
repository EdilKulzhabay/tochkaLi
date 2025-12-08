import bgGar from '../../assets/bgGar.png';
import { ClientInput } from '../../components/User/ClientInput';
import { useState, useEffect } from 'react';
import { RedButton } from '../../components/User/RedButton';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';

export const ClientPerfomance = () => {
    const [fullName, setFullName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { updateUser, user } = useAuth();
    const [screenHeight, setScreenHeight] = useState<number>(0);

    useEffect(() => {
        // Используем user из контекста, если он есть, иначе пытаемся получить из localStorage
        const currentUser = user || (() => {
            try {
                const userStr = localStorage.getItem('user');
                return userStr ? JSON.parse(userStr) : null;
            } catch (error) {
                console.error('Ошибка парсинга user из localStorage:', error);
                return null;
            }
        })();

        // Проверка на блокировку пользователя
        if (currentUser && currentUser.isBlocked && currentUser.role !== 'admin') {
            navigate('/client/blocked-user');
            return;
        }

        if (!currentUser || !currentUser.fullName || currentUser.fullName.trim() === '') {
            return;
        }

        setFullName(currentUser.fullName);
        const nameParts = currentUser.fullName.split(' ');
        setFirstName(nameParts[1] || '');
        setLastName(nameParts[0] || '');
    }, [user]);

    useEffect(() => {
        if (!fullName || fullName.trim() === '') {
            return;
        }
        navigate(`/main`);
    }, [fullName]);

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
            const fullNameToUpdate = `${lastName.trim()} ${firstName.trim()}`.trim();
            
            const response = await api.patch(`/api/users/${telegramId}`, {
                fullName: fullNameToUpdate,
            });

            if (response.data.success && response.data.data) {
                // Сохраняем обновленные данные пользователя в localStorage и обновляем контекст
                console.log("response.data.data = =", response.data.data);
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

    useEffect(() => {
        const updateScreenHeight = () => {
            // window.innerHeight - высота окна браузера в пикселях (это то же самое, что h-screen)
            const height = window.innerHeight;
            setScreenHeight(height);
            console.log('Высота экрана (h-screen):', height, 'px');
        };

        // Получаем высоту при монтировании компонента
        updateScreenHeight();

        // Обновляем при изменении размера окна
        window.addEventListener('resize', updateScreenHeight);

        return () => {
            window.removeEventListener('resize', updateScreenHeight);
        };
    }, []);
    return (
        <div 
            style={{
                backgroundImage: `url(${bgGar})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
            className='min-h-screen px-4 pb-6 flex flex-col justify-between lg:justify-start'
        >
            <div style={{ height: `${screenHeight/3}px` }}></div>
            <div className='flex-1 lg:flex-0 lg:w-[700px] lg:mx-auto'>
                <h1 className='text-[48px] font-semibold text-white leading-12'>Представьтесь, пожалуйста</h1>
                <div className='mt-6 lg:mt-10 space-y-3'>
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

            <div className='lg:w-[700px] lg:mx-auto'>
                <button 
                    onClick={() => navigate(-1)}
                    className='w-full mt-4 lg:mt-10 bg-white/10 block text-white py-2.5 text-center font-medium rounded-full'
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