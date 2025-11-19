import { UserLayout } from "../../components/User/UserLayout";
import { BackNav } from "../../components/User/BackNav";
import { DateRangeCalendar } from "../../components/User/DateRangeCalendar";
import { useEffect, useState } from "react";
import api from "../../api";

export const ClientSchedule = () => {
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [schedules, setSchedules] = useState<any>([]);
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
        // Устанавливаем диапазон по умолчанию: сегодня + 90 дней вперед
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const futureDate = new Date(today);
        futureDate.setDate(futureDate.getDate() + 90);
        setStartDate(today);
        setEndDate(futureDate);
    }, []);

    // Фильтруем события по выбранному диапазону дат
    useEffect(() => {
        if (startDate && endDate) {
            const formattedStart = formatDate(startDate);
            const formattedEnd = formatDate(endDate);
            fetchSchedules(formattedStart, formattedEnd);
        } else {
            // Если диапазон не выбран, показываем события на 90 дней вперед
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const futureDate = new Date(today);
            futureDate.setDate(futureDate.getDate() + 90);
            const formattedStart = formatDate(today);
            const formattedEnd = formatDate(futureDate);
            fetchSchedules(formattedStart, formattedEnd);
        }
    }, [startDate, endDate]);

    // Функция для получения всех дат между startDate и endDate
    const getDatesBetween = (start: Date, end: Date): Date[] => {
        const dates: Date[] = [];
        const currentDate = new Date(start);
        currentDate.setHours(0, 0, 0, 0);
        const endDate = new Date(end);
        endDate.setHours(0, 0, 0, 0);
        
        while (currentDate <= endDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return dates;
    };

    // Загружаем события на 90 дней вперед для отображения на календаре
    const fetchAllSchedules = async () => {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const futureDate = new Date(today);
            futureDate.setDate(futureDate.getDate() + 90);
            
            const formattedStart = formatDate(today);
            const formattedEnd = formatDate(futureDate);
            
            const response = await api.get(`/api/schedule?startDate=${formattedStart}&endDate=${formattedEnd}`);
            if (response.data && response.data.success && Array.isArray(response.data.data)) {
                // Извлекаем все даты событий для календаря (все дни от startDate до endDate)
                const dates: Date[] = [];
                response.data.data.forEach((schedule: any) => {
                    if (schedule.startDate && schedule.endDate) {
                        const startDate = new Date(schedule.startDate);
                        const endDate = new Date(schedule.endDate);
                        startDate.setHours(0, 0, 0, 0);
                        endDate.setHours(0, 0, 0, 0);
                        
                        // Добавляем все дни между startDate и endDate включительно
                        const datesInRange = getDatesBetween(startDate, endDate);
                        dates.push(...datesInRange);
                    } else if (schedule.startDate) {
                        // Если есть только startDate, добавляем только его
                        const startDate = new Date(schedule.startDate);
                        startDate.setHours(0, 0, 0, 0);
                        dates.push(startDate);
                    } else if (schedule.endDate) {
                        // Если есть только endDate, добавляем только его
                        const endDate = new Date(schedule.endDate);
                        endDate.setHours(0, 0, 0, 0);
                        dates.push(endDate);
                    }
                });
                // Убираем дубликаты дат
                const uniqueDates = Array.from(new Set(dates.map(date => date.getTime()))).map(time => new Date(time));
                setEventDates(uniqueDates);
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