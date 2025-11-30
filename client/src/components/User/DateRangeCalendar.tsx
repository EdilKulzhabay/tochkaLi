import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DateRangeCalendarProps {
    onDateRangeSelect?: (startDate: Date | null, endDate: Date | null) => void;
    selectedStartDate?: Date | null;
    selectedEndDate?: Date | null;
    eventDates?: Date[]; // Массив дат с событиями для отображения красных точек
}

const MONTHS = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const DAYS_OF_WEEK = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];

export const DateRangeCalendar = ({ 
    onDateRangeSelect, 
    selectedStartDate, 
    selectedEndDate,
    eventDates = []
}: DateRangeCalendarProps) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [startDate, setStartDate] = useState<Date | null>(selectedStartDate || null);
    const [endDate, setEndDate] = useState<Date | null>(selectedEndDate || null);
    const [hoverDate, setHoverDate] = useState<Date | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Получить первый день месяца и количество дней
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Понедельник = 0

    // Получить дни предыдущего месяца для заполнения первой недели
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const prevMonthDays: number[] = [];
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        prevMonthDays.push(prevMonthLastDay - i);
    }

    const handleDateClick = (day: number, isPrevMonth: boolean = false, isNextMonth: boolean = false) => {
        let clickedDate: Date;
        
        if (isPrevMonth) {
            clickedDate = new Date(year, month - 1, day);
        } else if (isNextMonth) {
            clickedDate = new Date(year, month + 1, day);
        } else {
            clickedDate = new Date(year, month, day);
        }

        // Сброс времени до начала дня
        clickedDate.setHours(0, 0, 0, 0);

        if (!startDate || (startDate && endDate) || (startDate && clickedDate < startDate)) {
            // Начинаем новый выбор
            setStartDate(clickedDate);
            setEndDate(null);
            if (onDateRangeSelect) {
                onDateRangeSelect(clickedDate, null);
            }
        } else if (startDate && !endDate) {
            // Завершаем выбор диапазона
            if (clickedDate >= startDate) {
                setEndDate(clickedDate);
                if (onDateRangeSelect) {
                    onDateRangeSelect(startDate, clickedDate);
                }
            } else {
                // Если кликнули дату раньше начальной, делаем её новой начальной
                setStartDate(clickedDate);
                setEndDate(null);
                if (onDateRangeSelect) {
                    onDateRangeSelect(clickedDate, null);
                }
            }
        }
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const isDateInRange = (day: number, isPrevMonth: boolean = false, isNextMonth: boolean = false): boolean => {
        if (!startDate) return false;

        let checkDate: Date;
        if (isPrevMonth) {
            checkDate = new Date(year, month - 1, day);
        } else if (isNextMonth) {
            checkDate = new Date(year, month + 1, day);
        } else {
            checkDate = new Date(year, month, day);
        }
        checkDate.setHours(0, 0, 0, 0);

        if (endDate) {
            return checkDate >= startDate && checkDate <= endDate;
        } else if (hoverDate && startDate) {
            const rangeStart = startDate < hoverDate ? startDate : hoverDate;
            const rangeEnd = startDate < hoverDate ? hoverDate : startDate;
            return checkDate >= rangeStart && checkDate <= rangeEnd;
        }
        return false;
    };

    const isDateSelected = (day: number, isPrevMonth: boolean = false, isNextMonth: boolean = false): boolean => {
        let checkDate: Date;
        if (isPrevMonth) {
            checkDate = new Date(year, month - 1, day);
        } else if (isNextMonth) {
            checkDate = new Date(year, month + 1, day);
        } else {
            checkDate = new Date(year, month, day);
        }
        checkDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (startDate && checkDate.getTime() === startDate.getTime()) return true;
        if (endDate && checkDate.getTime() === endDate.getTime()) return true;
        return false;
    };

    const isToday = (day: number, isPrevMonth: boolean = false, isNextMonth: boolean = false): boolean => {
        const today = new Date();
        if (isPrevMonth || isNextMonth) return false;
        return (
            today.getDate() === day &&
            today.getMonth() === month &&
            today.getFullYear() === year
        );
    };

    // Проверка, есть ли событие в указанную дату
    const hasEvent = (day: number, isPrevMonth: boolean = false, isNextMonth: boolean = false): boolean => {
        let checkDate: Date;
        if (isPrevMonth) {
            checkDate = new Date(year, month - 1, day);
        } else if (isNextMonth) {
            checkDate = new Date(year, month + 1, day);
        } else {
            checkDate = new Date(year, month, day);
        }
        checkDate.setHours(0, 0, 0, 0);

        return eventDates.some(eventDate => {
            const event = new Date(eventDate);
            event.setHours(0, 0, 0, 0);
            return event.getTime() === checkDate.getTime();
        });
    };

    const handleMouseEnter = (day: number, isPrevMonth: boolean = false, isNextMonth: boolean = false) => {
        if (!startDate || endDate) return;

        let hoveredDate: Date;
        if (isPrevMonth) {
            hoveredDate = new Date(year, month - 1, day);
        } else if (isNextMonth) {
            hoveredDate = new Date(year, month + 1, day);
        } else {
            hoveredDate = new Date(year, month, day);
        }
        hoveredDate.setHours(0, 0, 0, 0);
        setHoverDate(hoveredDate);
    };

    const handleMouseLeave = () => {
        setHoverDate(null);
    };

    // Генерация дней следующего месяца для заполнения последней недели
    const daysToShow = 42; // 6 недель * 7 дней
    const totalDaysShown = prevMonthDays.length + daysInMonth;
    const nextMonthDays: number[] = [];
    if (totalDaysShown < daysToShow) {
        const daysNeeded = daysToShow - totalDaysShown;
        for (let i = 1; i <= daysNeeded; i++) {
            nextMonthDays.push(i);
        }
    }

    return (
        <div className="bg-[#333333] rounded-lg p-4 text-white">
            {/* Заголовок с навигацией */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={handlePrevMonth}
                    className="p-2 hover:bg-white/10 rounded transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                <h2 className="text-lg font-medium">
                    {MONTHS[month]} {year}
                </h2>
                <button
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-white/10 rounded transition-colors"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Дни недели */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS_OF_WEEK.map((day) => (
                    <div key={day} className="text-center text-sm text-white/60 py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Календарная сетка */}
            <div className="grid grid-cols-7 gap-1">
                {/* Дни предыдущего месяца */}
                {prevMonthDays.map((day) => {
                    const inRange = isDateInRange(day, true);
                    const selected = isDateSelected(day, true);
                    const event = hasEvent(day, true);
                    return (
                        <button
                            key={`prev-${day}`}
                            onClick={() => handleDateClick(day, true)}
                            onMouseEnter={() => handleMouseEnter(day, true)}
                            onMouseLeave={handleMouseLeave}
                            className={`
                                aspect-square p-2 rounded text-sm transition-colors relative flex flex-col items-center justify-center
                                ${inRange ? 'bg-white/20' : ''}
                                ${selected ? 'bg-white/40 text-white font-semibold' : 'text-white/40'}
                                hover:bg-white/10
                            `}
                        >
                            <span>{day}</span>
                            {event && (
                                <span className="absolute bottom-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                            )}
                        </button>
                    );
                })}

                {/* Дни текущего месяца */}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const inRange = isDateInRange(day);
                    const selected = isDateSelected(day);
                    const today = isToday(day);
                    const event = hasEvent(day);
                    return (
                        <button
                            key={day}
                            onClick={() => handleDateClick(day)}
                            onMouseEnter={() => handleMouseEnter(day)}
                            onMouseLeave={handleMouseLeave}
                            className={`
                                aspect-square p-2 rounded text-sm transition-colors relative flex flex-col items-center justify-center
                                ${inRange ? 'bg-white/20' : ''}
                                ${selected ? 'bg-white/40 text-white font-semibold' : ''}
                                ${today && !selected ? 'border-2 border-[#FFC293]' : ''}
                                ${!selected && !today ? 'hover:bg-white/10' : ''}
                            `}
                        >
                            <span>{day}</span>
                            {event && (
                                <span className="absolute bottom-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                            )}
                        </button>
                    );
                })}

                {/* Дни следующего месяца */}
                {nextMonthDays.map((day) => {
                    const inRange = isDateInRange(day, false, true);
                    const selected = isDateSelected(day, false, true);
                    const event = hasEvent(day, false, true);
                    return (
                        <button
                            key={`next-${day}`}
                            onClick={() => handleDateClick(day, false, true)}
                            onMouseEnter={() => handleMouseEnter(day, false, true)}
                            onMouseLeave={handleMouseLeave}
                            className={`
                                aspect-square p-2 rounded text-sm transition-colors relative flex flex-col items-center justify-center
                                ${inRange ? 'bg-white/20' : ''}
                                ${selected ? 'bg-white/40 text-white font-semibold' : 'text-white/40'}
                                hover:bg-white/10
                            `}
                        >
                            <span>{day}</span>
                            {event && (
                                <span className="absolute bottom-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Информация о выбранном диапазоне */}
            {/* {(startDate || endDate) && (
                <div className="mt-4 pt-4 border-t border-white/20 text-sm">
                    {startDate && (
                        <div>
                            Начало: {startDate.toLocaleDateString('ru-RU', { 
                                day: 'numeric', 
                                month: 'long', 
                                year: 'numeric' 
                            })}
                        </div>
                    )}
                    {endDate && (
                        <div className="mt-1">
                            Конец: {endDate.toLocaleDateString('ru-RU', { 
                                day: 'numeric', 
                                month: 'long', 
                                year: 'numeric' 
                            })}
                        </div>
                    )}
                </div>
            )} */}
        </div>
    );
};

