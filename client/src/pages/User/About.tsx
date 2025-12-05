import { useEffect, useState } from 'react';
import { UserLayout } from '../../components/User/UserLayout';
import api from '../../api';
import { MobileAccordionList } from '../../components/User/MobileAccordionList';
import { RedButton } from '../../components/User/RedButton';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CryptoJS from 'crypto-js';

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
                    if (response.data.user.isBlocked) {
                        navigate('/client/blocked-user');
                        return;
                    }
                    if (!response.data.user.emailConfirmed) {
                        navigate('/client/register');
                    } else {
                        const user = response.data.user;
                        const merchantLogin = import.meta.env.VITE_ROBOKASSA_MERCHANT_LOGIN;
                        const password1 = import.meta.env.VITE_ROBOKASSA_PASSWORD1;
                        const isTestMode = import.meta.env.VITE_ROBOKASSA_TEST_MODE === '1';
                        
                        // Генерируем уникальный ID счета
                        const invoiceId = Date.now();
                        const outSum = '10.00';
                        const description = 'Оплата клуба лицензии';

                        // Формируем строку для подписи: MerchantLogin:OutSum:InvoiceID:Password1[:Shp_userId=value]
                        let signatureString = `${merchantLogin}:${outSum}:${invoiceId}:${password1}`;
                        if (user._id) {
                            signatureString += `:Shp_userId=${user._id}`;
                        }
                        
                        // Генерируем MD5 хеш для подписи
                        const signature = CryptoJS.MD5(signatureString).toString();

                        // Формируем URL для оплаты
                        const baseUrl = 'https://auth.robokassa.ru/Merchant/Index.aspx';
                        
                        const params: Record<string, string> = {
                            MerchantLogin: merchantLogin,
                            OutSum: outSum,
                            InvoiceID: invoiceId.toString(),
                            Description: description,
                            SignatureValue: signature,
                            IsTest: isTestMode ? '1' : '0',
                        };

                        if (user._id) {
                            params.Shp_userId = user._id;
                        }

                        const searchParams = new URLSearchParams(params);
                        window.location.href = `${baseUrl}?${searchParams.toString()}`;
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
        if (!user ||!user.fullName || user.fullName.trim() === '') {
            navigate("/client/ease-launch");
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
            <div className='px-4 pb-10 bg-[#161616] z-20'>
                <div className='relative lg:w-[700px] lg:mx-auto lg:-mt-[120px] z-20'>
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
            </div>
        </UserLayout>
    )
}