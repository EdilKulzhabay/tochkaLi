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
import api from "../../api";


const SmallCard = ({ title, link}: { title: string, link: string }) => {
    return (
        <Link 
            to={link} 
            className="min-h-24 flex items-center justify-center bg-[#333333] relative rounded-lg p-4 overflow-hidden"
            style={{
                backgroundImage: `url(${title === "Дневник ОДБ" ? main1 : title === "Расписание" ? main2 : title === "Описание транзитов" ? main3 : main4})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <p className="text-sm font-medium text-center" dangerouslySetInnerHTML={{ __html: title }}></p>
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
    const [meditationContent, setMeditationContent] = useState<string>('');
    const [practiceContent, setPracticeContent] = useState<string>('');
    const [videoContent, setVideoContent] = useState<string>('');
    const [mainContent1, setMainContent1] = useState<string>('');
    const [mainContent2, setMainContent2] = useState<string>('');
    const [mainContent3, setMainContent3] = useState<string>('');
    const [mainContent4, setMainContent4] = useState<string>('');

    useEffect(() => {
        fetchContent();
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        setUserName(user.fullName.split(' ')[1] || "");
    }, []);

    const fetchContent = async () => {
        const responseMeditation = await api.get('/api/dynamic-content/name/main-meditation');
        setMeditationContent(responseMeditation.data.data.content);
        const responsePractice = await api.get('/api/dynamic-content/name/main-practice');
        setPracticeContent(responsePractice.data.data.content);
        const responseVideo = await api.get('/api/dynamic-content/name/main-video');
        setVideoContent(responseVideo.data.data.content);
        const responseMainContent1 = await api.get('/api/dynamic-content/name/main-1');
        setMainContent1(responseMainContent1.data.data.content);
        const responseMainContent2 = await api.get('/api/dynamic-content/name/main-2');
        setMainContent2(responseMainContent2.data.data.content);
        const responseMainContent3 = await api.get('/api/dynamic-content/name/main-3');
        setMainContent3(responseMainContent3.data.data.content);
        const responseMainContent4 = await api.get('/api/dynamic-content/name/main-4');
        setMainContent4(responseMainContent4.data.data.content);
    }

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
                <h1 className="mt-3 text-2xl font-bold">Добро пожаловать! {userName ? userName : ""}</h1>
                <div className="grid grid-cols-2 gap-4 mt-3">
                    <SmallCard title={mainContent1 || ''} link="/client/diary" />
                    <SmallCard title={mainContent2 || ''} link="/client/schedule" />
                    <SmallCard title={mainContent3 || ''} link="/client/transit" />
                    <SmallCard title={mainContent4 || ''} link="/client/horoscope" />
                </div>
                <div className="mt-4 space-y-3">
                    <LargeCard 
                        title="Видео" 
                        link="/client/video-lessons" 
                        image={mainVideo} 
                        content={videoContent || ''}
                    />
                    <LargeCard 
                        title="Практики" 
                        link="/client/practices" 
                        image={mainPractice} 
                        content={practiceContent || ''}
                    />
                    <LargeCard 
                        title="Медитации" 
                        link="/client/meditations" 
                        image={mainMeditation} 
                        content={meditationContent || ''}
                    />
                </div>
            </div>
        </UserLayout>
    )
}