import { useState, useEffect } from 'react';
import api from '../../api';
import { UserLayout } from '../../components/User/UserLayout';
import { BackNav } from '../../components/User/BackNav';

export const ClientSchumann = () => {
    const [schumanns, setSchumanns] = useState<any[]>([]);
    const [content, setContent] = useState<any>(null);
    useEffect(() => {
        fetchSchumanns();
        fetchContent();
    }, []);

    const fetchSchumanns = async () => {
        const response = await api.get('/api/schumann');
        setSchumanns(response.data.data);
    };

    const fetchContent = async () => {
        const response = await api.get(`/api/dynamic-content/name/desc-shumana`);
        setContent(response.data.data);
    };

    return (
        <UserLayout>
            <BackNav title="Частота Шумана" />
            <div className='px-4 mt-8 pb-10 bg-[#161616]'>
                <p className='' dangerouslySetInnerHTML={{ __html: content?.content }}>
                </p>
                <div className='mt-4 space-y-4'>
                    {schumanns.map((schumann) => (
                        <div key={schumann._id}>
                            <p className=''>
                                {new Date(schumann.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                            <img src={`${import.meta.env.VITE_API_URL}${schumann.image}`} alt={schumann.title} className='w-full h-auto rounded-lg object-cover mt-2' />
                        </div>
                    ))}
                </div>
            </div>
        </UserLayout>
    );
};