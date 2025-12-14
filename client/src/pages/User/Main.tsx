import { useState, useEffect } from "react";
import { UserLayout } from "../../components/User/UserLayout"
import { Link, useNavigate } from "react-router-dom"
import api from "../../api"
import { useAuth } from "../../contexts/AuthContext"
import logo from "../../assets/logo.png"
import users from "../../assets/users.png"
import faq from "../../assets/faq.png"
import user from "../../assets/user.png"
import mainVideo from "../../assets/mainVideo.png"
import mainPractice from "../../assets/mainPractice.png"
import mainMeditation from "../../assets/mainMeditation.png"
import main1 from "../../assets/main1.png"
import main2 from "../../assets/main2.png"
import main3 from "../../assets/main3.png"
import main4 from "../../assets/main4.png"
import redUser from "../../assets/redUser.png"


const SmallCard = ({ title, link, img }: { title: string, link: string, img: string }) => {
    return (
        <Link 
            to={link} 
            className="min-h-24 flex items-center bg-[#333333] relative rounded-lg p-4 overflow-hidden"
            style={{
                backgroundImage: `url(${img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'right',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <p className="text-xl font-medium" dangerouslySetInnerHTML={{ __html: title }}></p>
        </Link>
    )
}

const LargeCard = ({ title, link, image, content }: { title: string, link: string, image: string, content: string }) => {
    return (
        <Link to={link} className="flex items-center bg-[#333333] rounded-lg p-4 gap-x-4">
            <div className="w-[98px] h-[98px] flex items-center justify-center rounded-full bg-white/10 shrink-0">
                <img src={image} alt={title} className="w-[50px] h-[50px] object-cover" />
            </div>
            <div className="">
                <p className="text-xl font-medium">{title}</p>
                <p className="text-sm mt-1" dangerouslySetInnerHTML={{ __html: content }}></p>    
            </div>
        </Link>
    )
}

export const Main = () => {
    const [userName, setUserName] = useState<string>("");
    const [userData, setUserData] = useState<any>(null);
    const { updateUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        
        const fetchUserData = async () => {
            setLoading(true);
            try {
                const userStr = localStorage.getItem('user');
                const telegramId = localStorage.getItem('telegramId');
                const token = localStorage.getItem('token');
                
                if (!userStr) {
                    console.log('Пользователь не найден в localStorage');
                    navigate('/');
                    return;
                }

                const user = JSON.parse(userStr);
                
                // Проверка на блокировку пользователя
                if (user && user.isBlocked && user.role !== 'admin') {
                    navigate('/client/blocked-user');
                    return;
                }
                let updatedUser = null;

                // Если есть токен, используем стандартный endpoint
                if (token) {
                    try {
                        const response = await api.get('/api/user/me');
                        if (response.data.success && response.data.user) {
                            updatedUser = response.data.user;
                            if (!updatedUser.fullName || updatedUser.fullName.trim() === '') {
                                navigate('/');
                                return;
                            }
                        }
                    } catch (error) {
                        console.error('Ошибка получения данных пользователя через /api/user/me:', error);
                    }
                }
                
                // Если есть telegramId, используем Telegram endpoint
                if (!updatedUser && telegramId) {
                    try {
                        const response = await api.get(`/api/user/telegram/${telegramId}`);
                        if (response.data.success && response.data.user) {
                            updatedUser = response.data.user;
                            if (!updatedUser.fullName || updatedUser.fullName.trim() === '') {
                                navigate('/');
                                return;
                            }
                        } else {
                            navigate('/');
                        }
                    } catch (error) {
                        console.error('Ошибка получения данных пользователя через Telegram API:', error);
                    }
                }
                
                // Если есть userId, используем общий endpoint
                if (!updatedUser && user._id) {
                    try {
                        const response = await api.get(`/api/user/${user._id}`);
                        if (response.data.success && response.data.data) {
                            updatedUser = response.data.data;
                            if (!updatedUser.fullName || updatedUser.fullName.trim() === '') {
                                navigate('/');
                                return;
                            }
                        } else {
                            navigate('/');
                        }
                    } catch (error) {
                        console.error('Ошибка получения данных пользователя через /api/user/:id:', error);
                    }
                }

                // Обновляем данные если получили их с сервера
                if (updatedUser) {
                    // Проверка на блокировку пользователя после получения данных с сервера
                    if (updatedUser.isBlocked && updatedUser.role !== 'admin') {
                        navigate('/client/blocked-user');
                        return;
                    }

                    // Сохраняем обновленные данные в localStorage
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    setUserData(updatedUser);

                    if (!updatedUser.fullName || updatedUser.fullName.trim() === '') {
                        navigate('/');
                        return;
                    }
                    
                    // Обновляем fullName если он есть
                    if (updatedUser.fullName) {
                        localStorage.setItem('fullName', updatedUser.fullName);
                        const nameParts = updatedUser.fullName.split(' ');
                        setUserName(nameParts.length > 1 ? nameParts[1] : nameParts[0]);
                    }
                    
                    // Обновляем состояние в AuthContext
                    if (updateUser) {
                        updateUser(updatedUser);
                    }
                } else {
                    // Если не удалось получить данные с сервера, используем данные из localStorage
                    const loadUserName = () => {
                        try {
                            const fullNameStr = localStorage.getItem("fullName");
                            if (fullNameStr) {
                                const nameParts = fullNameStr.split(' ');
                                setUserName(nameParts.length > 1 ? nameParts[1] : nameParts[0]);
                            } else if (user.fullName) {
                                const nameParts = user.fullName.split(' ');
                                setUserName(nameParts.length > 1 ? nameParts[1] : nameParts[0]);
                            }
                        } catch (error) {
                            console.error('Ошибка парсинга user из localStorage:', error);
                        }
                    };
                    loadUserName();
                }
            } catch (error) {
                console.error('Ошибка при обновлении данных пользователя:', error);
                // В случае ошибки используем данные из localStorage
                try {
                    const fullNameStr = localStorage.getItem("fullName");
                    if (fullNameStr) {
                        const nameParts = fullNameStr.split(' ');
                        setUserName(nameParts.length > 1 ? nameParts[1] : nameParts[0]);
                    }
                } catch (e) {
                    console.error('Ошибка парсинга данных из localStorage:', e);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
    }

    return (
        <UserLayout>
            <div className="px-4 pb-10 bg-[#161616]">
                <div className="flex items-center justify-between pt-5 pb-4">
                    <div className="cursor-pointer" onClick={() => navigate('/client/contactus')}>
                        <img src={logo} alt="logo" className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-6">
                        {userData?.hasPaid && userData?.subscriptionEndDate && new Date(userData.subscriptionEndDate) > new Date() ? (
                                <></>
                        ) : (
                            <Link to="/about">
                                <img src={users} alt="users" className="w-6 h-6" />
                            </Link>
                        )}
                        <Link to="/client/faq">
                            <img src={faq} alt="faq" className="w-6 h-6" />
                        </Link>
                        <Link to="/client/profile">
                            {userData?.hasPaid && userData?.subscriptionEndDate && new Date(userData.subscriptionEndDate) > new Date() ? (
                                <img src={redUser} alt="red user" className="w-6 h-6" />
                            ) : (
                                <img src={user} alt="user" className="w-6 h-6" />
                            )}
                        </Link>
                    </div>
                </div>
                <h1 className="mt-1 text-2xl font-bold">Добро пожаловать, {userName ? userName : ""}!</h1>
                <div className="grid grid-cols-2 gap-4 mt-5">
                    <SmallCard title="Дневник" link="/client/diary" img={main1}/>
                    <SmallCard title="Расписание" link="/client/schedule" img={main2}/>
                    <SmallCard title={`Транзиты`} link="/client/transit" img={main3}/>
                    <SmallCard title={`Гороскоп`} link="/client/horoscope" img={main4}/>
                </div>
                <div className="mt-4 space-y-3">
                    <LargeCard 
                        title="Видео" 
                        link="/client/video-lessons" 
                        image={mainVideo} 
                        content="Популярные видео и эксклюзивный контент от экспертов, которые знакомят с Проектом «Точки»"
                    />
                    <LargeCard 
                        title="Практики" 
                        link="/client/practices" 
                        image={mainPractice} 
                        content="Эффективные инструменты управления энергией и подсознанием на каждый день"
                    />
                    <LargeCard 
                        title="Медитации" 
                        link="/client/meditations" 
                        image={mainMeditation} 
                        content="Разрешение внутренних конфликтов, соединение со своей энергией и запуск процессов изменений"
                    />
                </div>
            </div>
        </UserLayout>
    )
}