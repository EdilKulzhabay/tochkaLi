import { useState, useEffect } from "react";
import { UserLayout } from "../../components/User/UserLayout"
import { Link } from "react-router-dom"
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


const SmallCard = ({ title, link, img }: { title: string, link: string, img: string }) => {
    return (
        <Link 
            to={link} 
            className="min-h-24 flex items-center bg-[#333333] relative rounded-lg p-4 overflow-hidden"
            style={{
                backgroundImage: `url(${img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <p className="text-sm font-medium" dangerouslySetInnerHTML={{ __html: title }}></p>
        </Link>
    )
}

const LargeCard = ({ title, link, image, content }: { title: string, link: string, image: string, content: string }) => {
    return (
        <Link to={link} className="flex items-center bg-[#333333] rounded-lg p-4 gap-x-4">
            <div className="">
                <p className="text-lg font-medium">{title}</p>
                <p className="text-sm mt-1" dangerouslySetInnerHTML={{ __html: content }}></p>    
            </div>
            <div className="w-[98px] h-[98px] flex items-center justify-center rounded-full bg-white/10 shrink-0">
                <img src={image} alt={title} className="w-[50px] h-[50px] object-cover" />
            </div>
        </Link>
    )
}

export const Main = () => {
    const [userName, setUserName] = useState<string>("");

    useEffect(() => {
        const loadUserName = () => {
            try {
                const fullNameStr = localStorage.getItem("fullName");
                if (fullNameStr) {
                    const fullName = fullNameStr.split(' ')[1];
                    setUserName(fullName.slice(0, fullName.length - 1));
                }
            } catch (error) {
                console.error('Ошибка парсинга user из localStorage:', error);
            }
        };
        
        loadUserName();
        
        // Слушаем изменения в localStorage на случай, если данные обновятся
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'user') {
                loadUserName();
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return (
        <UserLayout>
            <div className="px-4 pb-10">
                <div className="flex items-center justify-between pt-5 pb-4">
                    <div className="">
                        <img src={logo} alt="logo" className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-6">
                        <Link to="/about">
                            <img src={users} alt="users" className="w-6 h-6" />
                        </Link>
                        <Link to="/client/faq">
                            <img src={faq} alt="faq" className="w-6 h-6" />
                        </Link>
                        <Link to="/client/profile">
                            <img src={user} alt="user" className="w-6 h-6" />
                        </Link>
                    </div>
                </div>
                <h1 className="mt-3 text-2xl font-bold">Добро пожаловать, {userName ? userName : ""}!</h1>
                <div className="grid grid-cols-2 gap-4 mt-3">
                    <SmallCard title="Дневник ОДБ" link="/client/diary" img={main1}/>
                    <SmallCard title="Расписание" link="/client/schedule" img={main2}/>
                    <SmallCard title={`Описание<br />транзитов`} link="/client/transit" img={main3}/>
                    <SmallCard title={`Описание<br />гороскопов`} link="/client/horoscope" img={main4}/>
                </div>
                <div className="mt-4 space-y-3">
                    <LargeCard 
                        title="Видео" 
                        link="/client/video-lessons" 
                        image={mainVideo} 
                        content="Популярные видео проекта .li, которые содержат эксклюзивный контент и знакомят с Точкой"
                    />
                    <LargeCard 
                        title="Практики" 
                        link="/client/practices" 
                        image={mainPractice} 
                        content="Самые действенные и простые инструменты управления подсознанием на каждый день"
                    />
                    <LargeCard 
                        title="Медитации" 
                        link="/client/meditations" 
                        image={mainMeditation} 
                        content="Эффективная проработка внутренних конфликтов, соединение со своей энергией и запуск процессов изменений"
                    />
                </div>
            </div>
        </UserLayout>
    )
}