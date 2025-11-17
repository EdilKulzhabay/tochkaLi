const MONTHS = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
];

export const formatDateRangeReadable = (startDate?: string | Date, endDate?: string | Date) => {
    if (!startDate || !endDate) return "";

    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

    const startMonth = start.getMonth() + 1;
    const startDay = start.getDate();
    const endMonth = end.getMonth() + 1;
    const endDay = end.getDate();

    if (startMonth === endMonth) {
        const monthName = MONTHS[startMonth - 1] || "";
        return `${startDay}-${endDay} ${monthName}`;
    }

    const startMonthName = MONTHS[startMonth - 1] || "";
    const endMonthName = MONTHS[endMonth - 1] || "";

    return `${startDay} ${startMonthName} - ${endDay} ${endMonthName}`;
};

export const formatDateRangeReadableWithYear = (startDate?: string | Date, endDate?: string | Date) => {
    if (!startDate || !endDate) return "";

    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

    const startMonth = start.getMonth() + 1;
    const startDay = start.getDate();
    const endMonth = end.getMonth() + 1;
    const endDay = end.getDate();

    if (startMonth === endMonth) {
        const monthName = MONTHS[startMonth - 1] || "";
        return `${startDay}-${endDay} ${monthName} ${start.getFullYear()}`;
    }

    const startMonthName = MONTHS[startMonth - 1] || "";
    const endMonthName = MONTHS[endMonth - 1] || "";

    return `${startDay} ${startMonthName} ${start.getFullYear()} - ${endDay} ${endMonthName} ${end.getFullYear()}`;
};

