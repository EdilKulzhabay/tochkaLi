import { UserLayout } from "../../components/User/UserLayout"
import { BackNav } from "../../components/User/BackNav"
import { useState, useEffect } from "react"
import api from "../../api"
import { formatDateRangeDDMM } from "../../components/User/dateUtils"
import { MobileAccordionList } from "../../components/User/MobileAccordionList"
import { RedButton } from "../../components/User/RedButton"
import { useNavigate } from "react-router-dom"

export const ClientHoroscope = () => {
    const [horoscope, setHoroscope] = useState<any>(null);
    const navigate = useNavigate();
    const [content, setContent] = useState<string>('');

    const fetchContent = async () => {
        const response = await api.get('/api/dynamic-content/name/horoscope-desc');
        setContent(response.data.data.content);
    }

    useEffect(() => {
        fetchHoroscope();
        fetchContent();
    }, []);

    const fetchHoroscope = async () => {
        try {
            const response = await api.get('/api/horoscope/current');
            const data = response.data.data;
            if (data) {
                setHoroscope(data);
            }
        } catch (error) {
            console.error('Ошибка загрузки гороскопа', error);
        }
    }

    return (
        <UserLayout>
            <div className="pb-10 min-h-screen flex flex-col justify-between">
                <div>
                    <BackNav title="Антисоциумный гороскоп" />
                    <div className="px-4 mt-2">
                        <p dangerouslySetInnerHTML={{ __html: content }}></p>
                        {horoscope && (
                            <div className="mt-4">
                                <h2 className="text-xl font-medium">{horoscope.title}</h2>
                                <p className="text-sm">
                                    {formatDateRangeDDMM(horoscope.startDate, horoscope.endDate)}
                                </p>
                            </div>
                        )}
                    </div>
                    {horoscope?.image && (
                        <div className="mt-3 relative">
                            <img src={`${import.meta.env.VITE_API_URL}${horoscope.image}`} alt={horoscope.title} className="w-full h-auto rounded-lg object-cover z-10" />
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
                    )}
                    {horoscope && (
                        <div className="px-4 mt-8">
                            {horoscope.lines && horoscope.lines.length > 0 && (
                                <MobileAccordionList items={horoscope.lines} />
                            )}
                        </div>
                    )}
                    {!horoscope && (
                        <div className="px-4 mt-8">
                            <h2 className="text-2xl font-bold">Нет данных</h2>
                            <p className="text-gray-600">Нет данных для текущего дня</p>
                        </div>
                    )}
                </div>

                <div className="px-4 mt-auto pt-8 space-y-3">
                    <a
                        href="https://tochka.li/signs"
                        target="_blank"
                        className="w-full block border border-[#FFC293] text-[#FFC293] py-2.5 text-center font-medium rounded-full"
                    >
                        Подробнее об энергии на Точке Знаки
                    </a>
                    <RedButton
                        text="Посмотреть все гороскопы"
                        onClick={() => navigate('/client/horoscopes')}
                        className="w-full"
                    />
                </div>
            </div>
        </UserLayout>
    )
}
