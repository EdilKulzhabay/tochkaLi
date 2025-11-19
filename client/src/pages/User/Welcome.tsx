import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { UserLayout } from '../../components/User/UserLayout';
import api from '../../api';
import { MyLink } from '../../components/User/MyLink';

export const Welcome = () => {
    const [searchParams] = useSearchParams();
    const [content, setContent] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Извлекаем параметры из URL
        const telegramId = searchParams.get('telegramId') || '';
        const saleBotId = searchParams.get('saleBotId') || '';
        const telegramUserName = searchParams.get('telegramUserName') || '';

        // Сохраняем в localStorage
        if (telegramId) localStorage.setItem("telegramId", telegramId);
        if (saleBotId) localStorage.setItem("saleBotId", saleBotId);
        if (telegramUserName) localStorage.setItem("telegramUserName", telegramUserName);

        // Создаем пользователя через API
        // const createUser = async () => {
        //     if (!telegramId) return; // Если нет telegramId, пропускаем создание

        //     try {
        //         const response = await api.post('/api/user/create', {
        //             telegramId,
        //             saleBotId,
        //             telegramUserName,
        //         });

        //         if (response.data.success && response.data.user) {
        //             // Сохраняем данные пользователя в localStorage и обновляем контекст
        //             localStorage.setItem('user', JSON.stringify(response.data.user));
        //             updateUser(response.data.user);
        //         } else if (response.data.success === false) {
        //             // Пользователь уже существует, пытаемся получить его через обновление (это вернет пользователя)
        //             try {
        //                 const updateResponse = await api.patch(`/api/users/${telegramId}`, {});
        //                 if (updateResponse.data.success && updateResponse.data.data) {
        //                     localStorage.setItem('user', JSON.stringify(updateResponse.data.data));
        //                     updateUser(updateResponse.data.data);
        //                 }
        //             } catch (updateError) {
        //                 console.error('Ошибка получения пользователя:', updateError);
        //             }
        //         }
        //     } catch (error: any) {
        //         console.error('Ошибка создания пользователя:', error);
        //         toast.error(error.response?.data?.message || 'Ошибка создания пользователя');
        //     }
        // };

        const fetchUser = async () => {
            try {
                const response = await api.get(`/api/user/telegram/${telegramId}`);
                if (response.data.success && response.data.user) {
                    if (response.data.user.fullName && response.data.user.fullName.trim() !== '') {
                        navigate('/main');
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }

        fetchUser();

        // createUser();
    }, [searchParams]);

    useEffect(() => {
        setLoading(true);
        const fetchUser = async () => {
            try {
                const response = await api.get(`/api/welcome`);
                console.log(response.data);
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
                <img 
                    src={`${import.meta.env.VITE_API_URL}${content?.image}`} 
                    alt={content?.title} 
                    className='w-full h-auto rounded-lg object-cover z-10' 
                />
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