import { useEffect, useState } from "react";
import { UserLayout } from "../../components/User/UserLayout";
import { BackNav } from "../../components/User/BackNav";
import api from "../../api";
import { formatDateRangeReadable } from "../../components/User/dateUtils";
import { MobileAccordionList } from "../../components/User/MobileAccordionList";
import { RedButton } from "../../components/User/RedButton";
import { Link, useNavigate } from "react-router-dom";

interface TransitLine {
    title: string;
    content: string;
}

interface TransitEntity {
    startDate: string | Date;
    endDate: string | Date;
    title: string;
    subtitle?: string;
    image?: string;
    lines: TransitLine[];
    accessType: string;
}

export const ClientTransit = () => {
    const [transit, setTransit] = useState<TransitEntity | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTransit();
    }, []);

    const fetchTransit = async () => {
        try {
            const response = await api.get("/api/transit/current");
            const data: TransitEntity = response.data?.data;
            if (data) {
                setTransit(data);
            }
        } catch (error) {
            console.error("Failed to fetch transit", error);
            setTransit(null);
        }
    };

    return (
        <UserLayout>
            <div className="pb-10 min-h-screen flex flex-col justify-between">
                <div>
                    <BackNav title="Описание транзитов" />
                    <div className="px-4 mt-2">
                        <p>
                            Следите за транзитами, чтобы понимать, какие энергии активны прямо сейчас. Это поможет выстраивать
                            планы и действия в гармонии с текущей обстановкой.
                        </p>
                        {transit && (
                            <div className="mt-4">
                                <p className="text-xl font-semibold">
                                    {formatDateRangeReadable(transit.startDate, transit.endDate)}
                                </p>
                                <h2 className="text-2xl mt-3">{transit.title}</h2>
                                {transit.subtitle && (
                                    <h3 className="text-xl mt-2">{transit.subtitle}</h3>
                                )}
                                {transit.image && (
                                    <div className="mt-4">
                                        <img 
                                            src={`${import.meta.env.VITE_API_URL}${transit.image}`} 
                                            alt={transit.title} 
                                            className="w-full h-auto rounded-lg object-cover" 
                                        />
                                    </div>
                                )}
                                <div className="mt-4">
                                    {transit.lines?.length ? (
                                        <MobileAccordionList items={transit.lines} />
                                    ) : (
                                        <p className="mt-4 text-gray-500">Нет контента для выбранной даты.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {!transit && (
                        <div className="px-4 mt-8">
                            <h2 className="text-2xl font-bold">Нет данных</h2>
                            <p className="text-gray-600">Нет записей транзитов для текущего дня</p>
                        </div>
                    )}
                </div>

                <div className="px-4 pt-8">
                    <Link 
                        to="/client/schumann"
                        className="w-full block border border-[#FFC293] text-[#FFC293] py-2.5 text-center font-medium rounded-full"
                    >
                        Посмотреть частоту Шумана
                    </Link>
                    <RedButton
                        text="Посмотреть все транзиты"
                        onClick={() => navigate('/client/transits')}
                        className="w-full mt-3"
                    />
                </div>
            </div>
        </UserLayout>
    );
};
