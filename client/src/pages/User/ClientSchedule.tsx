import { UserLayout } from "../../components/User/UserLayout";
import { BackNav } from "../../components/User/BackNav";
import { DateRangeCalendar } from "../../components/User/DateRangeCalendar";
import { useEffect, useState } from "react";
import api from "../../api";

export const ClientSchedule = () => {
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [schedules, setSchedules] = useState<any>([]);
    const [allSchedules, setAllSchedules] = useState<any>([]);
    const [eventDates, setEventDates] = useState<Date[]>([]);

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

    // Загружаем все события при монтировании компонента
    useEffect(() => {
        fetchAllSchedules();
    }, []);

    // Фильтруем события по выбранному диапазону дат
    useEffect(() => {
        if (startDate && endDate) {
            const formattedStart = formatDate(startDate);
            const formattedEnd = formatDate(endDate);
            fetchSchedules(formattedStart, formattedEnd);
        } else {
            // Если диапазон не выбран, показываем все события
            setSchedules(allSchedules);
        }
    }, [startDate, endDate, allSchedules]);

    // Загружаем все события для отображения на календаре
    const fetchAllSchedules = async () => {
        try {
            const response = await api.get('/api/schedule');
            if (response.data && response.data.success && Array.isArray(response.data.data)) {
                setAllSchedules(response.data.data);
                // Извлекаем даты событий для календаря
                const dates = response.data.data
                    .map((schedule: any) => {
                        if (schedule.eventDate) {
                            const date = new Date(schedule.eventDate);
                            date.setHours(0, 0, 0, 0);
                            return date;
                        }
                        return null;
                    })
                    .filter((date: Date | null) => date !== null) as Date[];
                setEventDates(dates);
            }
        } catch (error) {
            console.error('Ошибка загрузки всех событий:', error);
        }
    };

    const fetchSchedules = async (start: string, end: string) => {
        try {
            const response = await api.get(`/api/schedule?startDate=${start}&endDate=${end}`);
            if (response.data && response.data.success && Array.isArray(response.data.data)) {
                setSchedules(response.data.data);
            } else {
                setSchedules([]);
            }
        } catch (error) {
            console.error('Ошибка загрузки событий:', error);
            setSchedules([]);
        }
    }

    return (
        <UserLayout>
            <BackNav title="Расписание" />
            <div className="px-4 mt-4 pb-10">
                <DateRangeCalendar 
                    onDateRangeSelect={handleDateRangeSelect}
                    selectedStartDate={startDate}
                    selectedEndDate={endDate}
                    eventDates={eventDates}
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