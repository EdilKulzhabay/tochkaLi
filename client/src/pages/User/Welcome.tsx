import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { UserLayout } from '../../components/User/UserLayout';
import api from '../../api';
import { MyLink } from '../../components/User/MyLink';

export const Welcome = () => {
    const { telegramId = "", saleBotId = "", telegramUserName = "", phone = "" } = useParams();
    const [content, setContent] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        localStorage.setItem("telegramId", telegramId);
        localStorage.setItem("saleBotId", saleBotId);
        localStorage.setItem("telegramUserName", telegramUserName);
        localStorage.setItem("phone", phone);
    }, [telegramId, saleBotId, telegramUserName, phone]);

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
                    className='w-full h-auto rounded-lg object-cover' 
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60"></div>
            </div>
            <div className='px-4 pb-10'>
                <h1 className="text-2xl font-bold mt-4">{content?.title}</h1>
                <p className="mt-4" dangerouslySetInnerHTML={{ __html: content?.content }} />
                <MyLink to="/about" text="Далее" className='w-full mt-4' color='red'/>
            </div>
        </UserLayout>
    )
}