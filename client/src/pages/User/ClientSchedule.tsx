import { UserLayout } from "../../components/User/UserLayout";
import { BackNav } from "../../components/User/BackNav";
import { DateRangeCalendar } from "../../components/User/DateRangeCalendar";
import { useEffect, useState } from "react";
import api from "../../api";
import { Switch } from "../../components/User/Switch";
import { Calendar, X } from 'lucide-react';

export const ClientSchedule = () => {
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [schedules, setSchedules] = useState<any>([]);
    const [eventDates, setEventDates] = useState<Date[]>([]);
    const [showAllEvents, setShowAllEvents] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
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

    useEffect(() => {
        if (showAllEvents) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const futureDate = new Date(today);
            futureDate.setDate(futureDate.getFullYear() + 100);
            setStartDate(today);
            setEndDate(futureDate);
        } else {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const futureDate = new Date(today);
            futureDate.setDate(futureDate.getDate() + 90);
            setStartDate(today);
            setEndDate(futureDate);
        }
    }, [showAllEvents]);

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

    const handleScheduleClick = (schedule: any) => {
        setSelectedSchedule(schedule);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedSchedule(null);
    };

    // Функция для форматирования даты в формат YYYYMMDDTHHmmss
    const formatDateForICS = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}${month}${day}T${hours}${minutes}${seconds}`;
    };

    // Функция для добавления в календарь (универсальная для всех устройств)
    const addToCalendar = () => {
        if (!selectedSchedule) return;

        const startDate = selectedSchedule.startDate ? new Date(selectedSchedule.startDate) : new Date();
        const endDate = selectedSchedule.endDate ? new Date(selectedSchedule.endDate) : new Date(startDate.getTime() + 60 * 60 * 1000);
        
        // Устанавливаем время начала на 10:00, если не указано
        if (!selectedSchedule.startTime) {
            startDate.setHours(10, 0, 0, 0);
        }
        // Устанавливаем время окончания на 11:00, если не указано
        if (!selectedSchedule.endTime) {
            endDate.setHours(11, 0, 0, 0);
        }

        // Генерируем .ics файл и создаем ссылку на него
        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Tochka.li//Event//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'BEGIN:VEVENT',
            `UID:${selectedSchedule._id}@tochka.li`,
            `DTSTART:${formatDateForICS(startDate)}`,
            `DTEND:${formatDateForICS(endDate)}`,
            `SUMMARY:${selectedSchedule.eventTitle || 'Событие'}`,
            `DESCRIPTION:${(selectedSchedule.description || '').replace(/\n/g, '\\n')}`,
            'STATUS:CONFIRMED',
            'SEQUENCE:0',
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');

        // Создаем blob URL для .ics файла
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        // Создаем временную ссылку и кликаем по ней
        const link = document.createElement('a');
        link.href = url;
        link.download = `${selectedSchedule.eventTitle || 'event'}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Очищаем URL через небольшую задержку
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 100);
        
        // Закрываем модальное окно
        closeModal();
    };

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
                <div className="mt-6 flex items-center justify-between">
                    <div className="text-white/60">{new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                    <div className="flex items-center gap-x-3">
                        <div className="text-white/60">Все меропрития</div>
                        <Switch
                            checked={showAllEvents}
                            onChange={() => setShowAllEvents(!showAllEvents)}
                        />
                    </div>
                </div>
                <div className="mt-4 space-y-4">
                    {schedules.length > 0 && schedules.map((schedule: any) => (
                        <div 
                            key={schedule._id}
                            className="bg-[#333333] rounded-lg p-4 cursor-pointer hover:bg-[#3a3a3a] transition-colors"
                            onClick={() => handleScheduleClick(schedule)}
                        >
                            <div className="flex items-center justify-between">
                                <h1 className="text-xl font-medium">{schedule?.eventTitle}</h1>
                                <div className="w-1.5 h-1.5 bg-[#EC1313] rounded-full" />
                            </div>
                            <p className="">{schedule?.description}</p>
                        </div>
                    ))}
                </div>

                {/* Модальное окно для добавления в календарь */}
                {isModalOpen && selectedSchedule && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                            {/* Overlay с прозрачным фоном */}
                            <div 
                                className="fixed inset-0 bg-transparent transition-opacity"
                                onClick={closeModal}
                            />

                            {/* Modal */}
                            <div 
                                className="relative inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle"
                                style={{ maxWidth: '500px', width: '100%' }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="bg-gray-800 px-6 py-4 border-b border-gray-600">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-semibold text-white">
                                            {selectedSchedule.eventTitle || 'Добавить в календарь'}
                                        </h3>
                                        <button
                                            onClick={closeModal}
                                            className="text-gray-400 hover:text-gray-300"
                                        >
                                            <X size={24} />
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-gray-800 px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                                    <div className="space-y-4">
                                        <div className="text-white/80">
                                            <p className="mb-2">{selectedSchedule.description}</p>
                                            {selectedSchedule.startDate && (
                                                <p className="text-sm text-white/60">
                                                    Дата начала: {new Date(selectedSchedule.startDate).toLocaleDateString('ru-RU', {
                                                        day: '2-digit',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            )}
                                            {selectedSchedule.endDate && (
                                                <p className="text-sm text-white/60">
                                                    Дата окончания: {new Date(selectedSchedule.endDate).toLocaleDateString('ru-RU', {
                                                        day: '2-digit',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            )}
                                        </div>

                                        <div className="pt-4 border-t border-gray-600">
                                            <button
                                                onClick={addToCalendar}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                            >
                                                <Calendar size={20} />
                                                Добавить в календарь
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </UserLayout>
    )
}