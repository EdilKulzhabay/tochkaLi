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
    const [screenHeight, setScreenHeight] = useState<number>(0);
    const navigate = useNavigate();
    const { updateUser } = useAuth();

    // Получаем высоту экрана в пикселях
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
                        } else {
                            // Оставляем только 'telegramId', 'telegramUserName' и 'user' в localStorage
                            const telegramIdValue = localStorage.getItem("telegramId");
                            const telegramUserNameValue = localStorage.getItem("telegramUserName");
                            const userValue = localStorage.getItem("user");
                            localStorage.clear();
                            if (telegramIdValue) localStorage.setItem("telegramId", telegramIdValue);
                            if (telegramUserNameValue) localStorage.setItem("telegramUserName", telegramUserNameValue);
                            if (userValue) localStorage.setItem("user", userValue);
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
                        className='w-full h-auto lg:h-screen rounded-lg object-top z-10' 
                    />
                )}
                <div 
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(to top, #000000 0%, #00000000 70%)',
                    }}
                />
                <div 
                    className="absolute inset-0 lg:bg-none"
                    style={{
                        background: 'linear-gradient(to bottom, #16161600 70%, #161616 100%)',
                    }}
                />
            </div>
            <div className='px-4 pt-4 pb-10 bg-[#161616]'>
                <div 
                    className={`relative lg:w-[700px] lg:mx-auto z-20`}
                    style={{
                        marginTop: window.innerWidth >= 1024 ? `-${screenHeight / 2}px` : 0
                    }}    
                >
                    <h1 className="text-2xl font-bold">{content?.title}</h1>
                    <p className="mt-4" dangerouslySetInnerHTML={{ __html: content?.content }} />
                    <MyLink to="/about" text="Далее" className='w-full mt-4' color='red'/>
                </div>
            </div>
        </UserLayout>
    )
}