import { useEffect, useState } from 'react';
import { UserLayout } from '../../components/User/UserLayout';
import api from '../../api';
import { MobileAccordionList } from '../../components/User/MobileAccordionList';
import { RedButton } from '../../components/User/RedButton';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export const About = () => {
    const [content, setContent] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleJoinClub = () => {
        const telegramId = localStorage.getItem('telegramId');
        if (!telegramId) {
            toast.error('Ошибка: не найден telegramId');
            navigate(-1);
            return;
        }
        const fetchUser = async () => {
            try {
                const response = await api.get(`/api/user/telegram/${telegramId}`);
                if (response.data.success && response.data.user) {
                    if (!response.data.user.emailConfirmed) {
                        navigate('/client/register');
                    } else {
                        // Если email подтвержден, редиректим пользователя на страницу оплаты Робокассы
                        // Примерная ссылка на оплату (замените на свою реальную страницу/endpoint)
                        window.location.href = "https://auth.robokassa.ru/Merchant/Index.aspx?MerchantLogin=YOUR_MERCHANT_LOGIN&OutSum=1000&InvId=12345&Description=Оплата+клуба+li&SignatureValue=YOUR_SIGNATURE";
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }

        fetchUser();
    }

    const handleSkip = () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.fullName || user.fullName.trim() === '') {
            navigate("/client-performance");
        } else {
            navigate("/main");
        }
    }

    useEffect(() => {
        setLoading(true);
        const fetchContent = async () => {
            try {
                const response = await api.get(`/api/about-club`);
                setContent(response.data.data[0]);
                setLoading(false);
            } catch (error) {
                console.log(error);
                setLoading(false);
            }
        }
        fetchContent();
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
            <div className='px-4 pb-10 bg-[#161616]'>
                <h1 className="text-2xl font-bold mt-4">{content?.title}</h1>
                <p className="mt-4" dangerouslySetInnerHTML={{ __html: content?.content }} />
                <h2 className="text-xl font-medium mt-8">Что входит в подписку</h2>
                {content?.list.length > 0 && (
                    <div className='mt-4'>
                        <MobileAccordionList items={content?.list} />
                    </div>
                )}
                <button 
                    className='bg-white/10 block text-white py-2.5 text-center font-medium rounded-full w-full mt-4 cursor-pointer'
                    onClick={handleSkip}
                >
                    Пропустить
                </button>
                <RedButton text="Вступить в клуб" onClick={handleJoinClub} className='w-full mt-4 cursor-pointer'/>
            </div>
        </UserLayout>
    )
}