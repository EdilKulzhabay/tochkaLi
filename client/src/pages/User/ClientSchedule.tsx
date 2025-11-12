import { UserLayout } from "../../components/User/UserLayout";
import { BackNav } from "../../components/User/BackNav";
import { DateRangeCalendar } from "../../components/User/DateRangeCalendar";
import { useEffect, useState } from "react";
import api from "../../api";

export const ClientSchedule = () => {
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [schedules, setSchedules] = useState<any>([]);

    const formatDate = (date: Date | null) => {
        if (!date) return '';
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`; // DD.MM.YYYY
    };

    const handleDateRangeSelect = (start: Date | null, end: Date | null) => {
        setStartDate(start);
        setEndDate(end);
    };

    useEffect(() => {
        if (startDate && endDate) {
            const formattedStart = formatDate(startDate);
            const formattedEnd = formatDate(endDate);
            fetchSchedules(formattedStart, formattedEnd);
        }
    }, [startDate, endDate]);

    const fetchSchedules = async (start: string, end: string) => {
        const response = await api.get(`/api/schedule?startDate=${start}&endDate=${end}`);
        console.log(response.data);
        setSchedules(response.data.data);
    }

    return (
        <UserLayout>
            <BackNav title="Расписание" />
            <div className="px-4 mt-4 pb-10">
                <DateRangeCalendar 
                    onDateRangeSelect={handleDateRangeSelect}
                    selectedStartDate={startDate}
                    selectedEndDate={endDate}
                />
                <div className="mt-6 text-white/60">
                    {new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
                <div className="mt-4 space-y-4">
                    {schedules.length > 0 && schedules.map((schedule: any) => (
                        <div 
                            key={schedule._id}
                            className="bg-[#333333] rounded-lg p-4"
                        >
                            <h1 className="text-xl font-medium">{schedule?.eventTitle}</h1>
                            <p className="">{schedule?.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </UserLayout>
    )
}