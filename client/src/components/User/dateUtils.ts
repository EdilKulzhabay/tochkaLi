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

export const formatDateRangeReadable = (range?: string) => {
    if (!range) return "";

    const match = range.match(/(\d{4})-(\d{2})-(\d{2})\s*-\s*(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return range;

    const [, , startMonth, startDay, , endMonth, endDay] = match;

    if (startMonth === endMonth) {
        const monthName = MONTHS[parseInt(startMonth, 10) - 1] || "";
        return `${parseInt(startDay, 10)}-${parseInt(endDay, 10)} ${monthName}`;
    }

    const startMonthName = MONTHS[parseInt(startMonth, 10) - 1] || "";
    const endMonthName = MONTHS[parseInt(endMonth, 10) - 1] || "";

    return `${parseInt(startDay, 10)} ${startMonthName} - ${parseInt(endDay, 10)} ${endMonthName}`;
};

