import { useEffect, useState } from "react";
import { UserLayout } from "../../components/User/UserLayout";
import { BackNav } from "../../components/User/BackNav";
import api from "../../api";
import { formatDateRangeReadable } from "../../components/User/dateUtils";
import { MobileAccordionList } from "../../components/User/MobileAccordionList";
import { RedButton } from "../../components/User/RedButton";
import { Link } from "react-router-dom";

interface TransitLine {
    title: string;
    content: string;
}

interface TransitContent {
    title: string;
    subtitle?: string;
    date: string;
    lines: TransitLine[];
}

interface TransitEntity {
    dates: string;
    datesContent: TransitContent[];
    accessType: string;
}

export const ClientTransit = () => {
    const [transits, setTransits] = useState<TransitEntity[]>([]);
    const [currentTransit, setCurrentTransit] = useState<TransitContent | null>(null);

    useEffect(() => {
        fetchTransit();
    }, []);

    const fetchTransit = async () => {
        try {
            const response = await api.get("/api/transit");
            const data: TransitEntity[] = response.data?.data || [];
            setTransits(data);

            const today = new Date().toISOString().split("T")[0];
            const firstTransit = data[0];

            if (firstTransit?.datesContent?.length) {
                const todayTransit = firstTransit.datesContent.find((item) => item.date === today);
                setCurrentTransit(todayTransit || null);
            } else {
                setCurrentTransit(null);
            }
        } catch (error) {
            console.error("Failed to fetch transit", error);
            setTransits([]);
            setCurrentTransit(null);
        }
    };

    const activeTransit = transits[0];

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
                        {currentTransit && (
                            <div className="mt-4">
                                <p className="text-xl font-semibold">
                                    {activeTransit ? formatDateRangeReadable(activeTransit.dates) : ""}
                                </p>
                                <h2 className="text-2xl mt-3">{currentTransit.title}</h2>
                                <h3 className="text-xl mt-2">{currentTransit.subtitle}</h3>
                                <div className="mt-4">
                                    {currentTransit.lines?.length ? (
                                        <MobileAccordionList items={currentTransit.lines} />
                                    ) : (
                                        <p className="mt-4 text-gray-500">Нет контента для выбранной даты.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {!currentTransit && (
                        <div className="px-4 mt-8">
                            <h2 className="text-2xl font-bold">Нет данных</h2>
                            <p className="text-gray-600">Нет записей транзитов для текущего дня</p>
                        </div>
                    )}
                </div>

                <div className="px-4">
                    <Link 
                        to="/client/schumann"
                        className="w-full block border border-[#FFC293] text-[#FFC293] py-2.5 text-center font-medium rounded-full"
                    >
                        Посмотреть частоту Шумана
                    </Link>
                    <RedButton
                        text="Посмотреть все транзиты"
                        onClick={() => {}}
                        className="w-full mt-3"
                    />
                </div>
            </div>
        </UserLayout>
    );
};

