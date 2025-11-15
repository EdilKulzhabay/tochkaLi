import { useEffect, useState } from 'react';
import { UserLayout } from '../../components/User/UserLayout';
import api from '../../api';
import { MobileAccordionList } from '../../components/User/MobileAccordionList';
import { MyLink } from '../../components/User/MyLink';
import { RedButton } from '../../components/User/RedButton';

export const About = () => {
    const [content, setContent] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        const fetchUser = async () => {
            try {
                const response = await api.get(`/api/about-club`);
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
                <h2 className="text-xl font-medium mt-8">Что входит в подписку</h2>
                {content?.list.length > 0 && (
                    <div className='mt-4'>
                        <MobileAccordionList items={content?.list} />
                    </div>
                )}
                <MyLink to="/main" text="Пропустить" className='w-full mt-4' color='gray'/>
                <RedButton text="Вступить в клуб" onClick={() => {}} className='w-full mt-4'/>
            </div>
        </UserLayout>
    )
}