import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { UserLayout } from '../../components/User/UserLayout';
import api from '../../api';
import { MyLink } from '../../components/User/MyLink';
import { useAuth } from '../../contexts/AuthContext';

export const Welcome = () => {
    const [searchParams] = useSearchParams();
    const [content, setContent] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { updateUser } = useAuth();

    useEffect(() => {
        // Извлекаем параметры из URL
        const telegramId = searchParams.get('telegramId') || '';
        const telegramUserName = searchParams.get('telegramUserName') || '';

        // Сохраняем в localStorage
        if (telegramId) localStorage.setItem("telegramId", telegramId);
        if (telegramUserName) localStorage.setItem("telegramUserName", telegramUserName);

        const fetchUser = async () => {
            if (!telegramId) {
                console.log('telegramId не найден');
                return;
            }
            
            try {
                const response = await api.get(`/api/user/telegram/${telegramId}`);

                if (!response.data.success) {
                    localStorage.clear();
                    if (telegramId) localStorage.setItem("telegramId", telegramId);
                    if (telegramUserName) localStorage.setItem("telegramUserName", telegramUserName);
                    return;
                }
                
                if (response.data.success && response.data.user) {
                    
                    // Проверяем, что user не null и не undefined
                    if (response.data.user !== null && response.data.user !== undefined) {
                        // Всегда сохраняем пользователя в localStorage, даже если fullName пустой
                        const userString = JSON.stringify(response.data.user);
                        localStorage.setItem('user', userString);
                        
                        // Обновляем состояние в AuthContext
                        updateUser(response.data.user);
                        
                        // Проверяем, что данные действительно сохранились
                        const savedUser = localStorage.getItem('user');
                        console.log("Проверка сохраненного user: ", savedUser);
                        
                        // Переходим на главную только если есть fullName
                        if (response.data.user.fullName && response.data.user.fullName.trim() !== '') {
                            const fullName = response.data.user.fullName;
                            localStorage.setItem('fullName', fullName);
                            navigate('/main');
                        }
                    } else {
                        console.error('response.data.user равен null или undefined');
                    }
                } else {
                    console.error('Не удалось получить пользователя:', {
                        success: response.data.success,
                        user: response.data.user
                    });
                }
            } catch (error) {
                console.error('Ошибка получения пользователя:', error);
            }
        }

        if (telegramId) {
            fetchUser();
        }

        // createUser();
    }, [searchParams]);

    useEffect(() => {
        setLoading(true);
        const fetchUser = async () => {
            try {
                const response = await api.get(`/api/welcome`);
                setContent(response.data.data[0]);
                setLoading(false);
            } catch (error) {
                console.log(error);
                setLoading(false);
            }
        }
        fetchUser();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }
    
    return (
        <UserLayout>
            <div className='relative'>
                {content?.image && (
                    <img 
                        src={`${import.meta.env.VITE_API_URL}${content?.image}`} 
                        alt={content?.title} 
                        className='w-full h-auto rounded-lg object-cover z-10' 
                    />
                )}
                <div 
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(to bottom, #161616 0%, #16161600 30%)',
                    }}
                />
                <div 
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(to bottom, #16161600 70%, #161616 100%)',
                    }}
                />
            </div>
            <div className='px-4 pb-10'>
                <h1 className="text-2xl font-bold mt-4">{content?.title}</h1>
                <p className="mt-4" dangerouslySetInnerHTML={{ __html: content?.content }} />
                <MyLink to="/about" text="Далее" className='w-full mt-4' color='red'/>
            </div>
        </UserLayout>
    )
}