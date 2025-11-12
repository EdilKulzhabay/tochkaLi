import { UserLayout } from "../../components/User/UserLayout"
import { BackNav } from "../../components/User/BackNav"
import { useState, useEffect } from "react"
import api from "../../api"
import { formatDateRangeReadable } from "../../components/User/dateUtils"
import { MobileAccordionList } from "../../components/User/MobileAccordionList"
import { RedButton } from "../../components/User/RedButton"

export const ClientHoroscope = () => {
    const [horoscopes, setHoroscopes] = useState<any>(null);
    const [currentHoroscope, setCurrentHoroscope] = useState<any>(null);

    useEffect(() => {
        fetchHoroscope();
    }, []);

    const fetchHoroscope = async () => {
        const response = await api.get('/api/horoscope');
        setHoroscopes(response.data.data);
        const today = new Date().toISOString().split('T')[0];
        const horoscopeList = response.data.data[0]
        const currentHoroscope1 = horoscopeList.datesContent.find((horoscope: any) => horoscope.date === today);
        setCurrentHoroscope(currentHoroscope1);
    }

    return (
        <UserLayout>
            <div className="pb-10 min-h-screen flex flex-col justify-between">
                <div>
                    <BackNav title="Антисоциумный гороскоп" />
                    <div className="px-4 mt-2">
                        <p>
                            Социумные гороскопы помогают жить в комфорте для ума, но при этом не дают достичь сверхрезультатов. Когда вы начинаете действовать по врожденной энергии, а не как вам говорит ум, вы начинаете получать сверхрезультаты
                        </p>
                        {currentHoroscope && (
                            <div className="mt-4 flex items-center justify-between">
                                <h2 className="text-xl font-medium">{currentHoroscope.title}</h2>
                                <p className="text-lg">
                                    {formatDateRangeReadable(horoscopes[0].dates)}
                                </p>
                            </div>
                        )}
                    </div>
                    {currentHoroscope?.image && (
                        <div className="mt-3">
                            <img src={`${import.meta.env.VITE_API_URL}${currentHoroscope.image}`} alt={currentHoroscope.title} className="w-full h-auto rounded-lg object-cover" />
                        </div>
                    )}
                    {currentHoroscope && (
                        <div className="px-4 mt-8">
                            {currentHoroscope.lines && currentHoroscope.lines.length > 0 && (
                                <MobileAccordionList items={currentHoroscope.lines} />
                            )}

                            
                        </div>
                    )}
                    {!currentHoroscope && (
                        <div className="px-4 mt-8">
                            <h2 className="text-2xl font-bold">Нет данных</h2>
                            <p className="text-gray-600">Нет данных для текущего дня</p>
                        </div>
                    )}
                </div>

                <div className="px-4 mt-auto">
                    <RedButton
                        text="Посмотреть все гороскопы"
                        onClick={() => {}}
                        className="w-full"
                    />
                </div>
            </div>
        </UserLayout>
    )
}