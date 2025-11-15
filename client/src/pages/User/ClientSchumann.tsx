import { useState, useEffect } from 'react';
import api from '../../api';
import { UserLayout } from '../../components/User/UserLayout';
import { BackNav } from '../../components/User/BackNav';

export const ClientSchumann = () => {
    const [schumanns, setSchumanns] = useState<any[]>([]);

    useEffect(() => {
        fetchSchumanns();
    }, []);

    const fetchSchumanns = async () => {
        const response = await api.get('/api/schumann');
        setSchumanns(response.data.data);
    };

    return (
        <UserLayout>
            <BackNav title="Частота Шумана" />
            <div className='px-4 mt-8 pb-10'>
                <p className=''>
                    Резонанс Шумана – это частота электромагнитного поля Земли, которая возникает в результате взаимодействия молний с ионосферой и образования глобальной резонансной полости между поверхностью Земли и ионосферой. Шишковидная железа, расположенная в головном мозге, является ключевым органом, который воспринимает и реагирует на неё. Этот орган управляет многими психическими и телесными процессами, включая гормональную регуляцию. На графиках ниже показана частота Шумана в часовом поясе Омска +3 часа ко времени Москвы.
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