import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Константа для CRLF (всегда использовать \r\n)
const CRLF = '\r\n';

/**
 * Экранирует специальные символы для iCalendar формата
 * @param {string} text - Текст для экранирования
 * @returns {string} - Экранированный текст
 */
const escapeICS = (text) => {
    if (!text) return '';
    
    return String(text)
        .replace(/\\/g, '\\\\')  // Обратный слэш
        .replace(/;/g, '\\;')     // Точка с запятой
        .replace(/,/g, '\\,')     // Запятая
        .replace(/\n/g, '\\n')    // Перенос строки
        .replace(/\r/g, '')       // Удаляем \r
        .trim();
};

/**
 * Разбивает длинные строки на несколько строк (максимум 75 символов на строку)
 * Согласно RFC 5545, строки длиннее 75 символов должны быть разбиты
 * @param {string} line - Строка для разбивки
 * @returns {string[]} - Массив строк
 */
const foldLine = (line) => {
    const maxLength = 75;
    if (line.length <= maxLength) {
        return [line];
    }
    
    const lines = [];
    let currentLine = '';
    
    for (let i = 0; i < line.length; i++) {
        if (currentLine.length >= maxLength) {
            lines.push(currentLine);
            currentLine = ' ' + line[i]; // Продолжение строки начинается с пробела
        } else {
            currentLine += line[i];
        }
    }
    
    if (currentLine) {
        lines.push(currentLine);
    }
    
    return lines;
};

/**
 * Форматирует дату в формат iCalendar для ALL DAY события (YYYYMMDD)
 * @param {Date} date - Дата для форматирования
 * @returns {string} - Отформатированная дата
 */
const formatICSDateOnly = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        throw new Error('Invalid date provided');
    }
    
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    
    return `${year}${month}${day}`;
};

/**
 * Форматирует дату в формат iCalendar с временем (YYYYMMDDTHHmmssZ)
 * @param {Date} date - Дата для форматирования
 * @returns {string} - Отформатированная дата в UTC
 */
const formatICSDateTime = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        throw new Error('Invalid date provided');
    }
    
    const utcDate = new Date(date.toISOString());
    const year = utcDate.getUTCFullYear();
    const month = String(utcDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(utcDate.getUTCDate()).padStart(2, '0');
    const hours = String(utcDate.getUTCHours()).padStart(2, '0');
    const minutes = String(utcDate.getUTCMinutes()).padStart(2, '0');
    const seconds = String(utcDate.getUTCSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
};

/**
 * Проверяет, находятся ли две даты в один календарный день
 * @param {Date} date1 - Первая дата
 * @param {Date} date2 - Вторая дата
 * @returns {boolean} - true если в один день
 */
const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    return d1.getUTCFullYear() === d2.getUTCFullYear() &&
           d1.getUTCMonth() === d2.getUTCMonth() &&
           d1.getUTCDate() === d2.getUTCDate();
};

/**
 * Генерирует содержимое .ics файла для события расписания
 * Строго следует стандарту iCalendar (RFC 5545)
 * @param {Object} schedule - Объект события расписания
 * @returns {string} - Содержимое .ics файла
 */
export const generateICSContent = (schedule) => {
    if (!schedule || !schedule._id) {
        throw new Error('Schedule object with _id is required');
    }
    
    // UID: <scheduleId>@tochka.li
    const uid = `${schedule._id}@tochka.li`;
    
    // DTSTAMP: текущая дата в UTC
    const dtstamp = formatICSDateTime(new Date());
    
    // Получаем даты
    if (!schedule.startDate) {
        throw new Error('startDate is required');
    }
    
    const startDate = new Date(schedule.startDate);
    const endDate = schedule.endDate ? new Date(schedule.endDate) : new Date(startDate.getTime() + 60 * 60 * 1000);
    
    // Определяем, является ли событие ALL DAY
    // Если startDate и endDate в разные календарные дни → ALL DAY
    const isAllDay = !isSameDay(startDate, endDate);
    
    // Формируем DTSTART и DTEND
    let dtstart, dtend;
    
    if (isAllDay) {
        // ALL DAY событие: DTSTART;VALUE=DATE:YYYYMMDD, DTEND;VALUE=DATE:(endDate + 1 день)
        const endDatePlusOne = new Date(endDate);
        endDatePlusOne.setUTCDate(endDatePlusOne.getUTCDate() + 1);
        
        dtstart = `DTSTART;VALUE=DATE:${formatICSDateOnly(startDate)}`;
        dtend = `DTEND;VALUE=DATE:${formatICSDateOnly(endDatePlusOne)}`;
    } else {
        // Обычное событие: DTSTART:YYYYMMDDTHHmmssZ, DTEND:YYYYMMDDTHHmmssZ
        // Если время не указано, устанавливаем 10:00 по умолчанию
        const startHasTime = startDate.getUTCHours() !== 0 || 
                            startDate.getUTCMinutes() !== 0 || 
                            startDate.getUTCSeconds() !== 0;
        
        const endHasTime = endDate.getUTCHours() !== 0 || 
                          endDate.getUTCMinutes() !== 0 || 
                          endDate.getUTCSeconds() !== 0;
        
        let finalStartDate = new Date(startDate);
        let finalEndDate = new Date(endDate);
        
        if (!startHasTime) {
            finalStartDate.setUTCHours(10, 0, 0, 0);
        }
        if (!endHasTime) {
            // Если endDate равен startDate или меньше, добавляем 1 час
            if (finalEndDate.getTime() <= finalStartDate.getTime()) {
                finalEndDate = new Date(finalStartDate.getTime() + 60 * 60 * 1000);
            } else {
                finalEndDate.setUTCHours(11, 0, 0, 0);
            }
        }
        
        dtstart = `DTSTART:${formatICSDateTime(finalStartDate)}`;
        dtend = `DTEND:${formatICSDateTime(finalEndDate)}`;
    }
    
    // SUMMARY: из eventTitle, экранировать спецсимволы
    const summary = escapeICS(schedule.eventTitle || 'Событие');
    
    // DESCRIPTION: из description, переносы строк заменять на \n
    // Если есть eventLink — добавить в конец
    let description = escapeICS(schedule.description || '');
    if (schedule.eventLink) {
        const link = schedule.eventLink.trim();
        if (description) {
            description += '\\n\\nСсылка: ' + link;
        } else {
            description = 'Ссылка: ' + link;
        }
    }
    
    // Генерируем .ics содержимое (всегда использовать CRLF)
    const icsLines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Tochka.li//Event//EN',
        'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${dtstamp}`,
        dtstart,
        dtend,
    ];
    
    // Добавляем SUMMARY с разбивкой длинных строк
    const summaryLines = foldLine(`SUMMARY:${summary}`);
    icsLines.push(...summaryLines);
    
    // Добавляем DESCRIPTION с разбивкой длинных строк
    if (description) {
        const descLines = foldLine(`DESCRIPTION:${description}`);
        icsLines.push(...descLines);
    }
    
    // STATUS: CONFIRMED
    icsLines.push('STATUS:CONFIRMED');
    
    icsLines.push(
        'END:VEVENT',
        'END:VCALENDAR'
    );
    
    // Всегда использовать CRLF для разделения строк
    return icsLines.join(CRLF);
};

/**
 * Алиас для generateICSContent (для соответствия требованиям)
 * @param {Object} schedule - Объект события расписания
 * @returns {string} - Содержимое .ics файла
 */
export const generateICS = (schedule) => {
    return generateICSContent(schedule);
};

/**
 * Сохраняет .ics файл для события расписания
 * @param {Object} schedule - Объект события расписания
 * @returns {Promise<string>} - Путь к сохраненному файлу
 */
export const generateICSFile = async (schedule) => {
    if (!schedule || !schedule._id) {
        throw new Error('Schedule object with _id is required');
    }
    
    const calendarsDir = path.join(__dirname, '..', 'public', 'calendars');
    
    // Создаем директорию, если её нет
    try {
        await fs.access(calendarsDir);
    } catch {
        await fs.mkdir(calendarsDir, { recursive: true });
    }
    
    const filename = `schedule_${schedule._id}.ics`;
    const filepath = path.join(calendarsDir, filename);
    
    const icsContent = generateICSContent(schedule);
    
    // Сохраняем файл с правильной кодировкой (UTF-8 с BOM для лучшей совместимости)
    // Используем 'utf8' кодировку, CRLF уже включен в icsContent
    await fs.writeFile(filepath, icsContent, { encoding: 'utf8' });
    
    return filepath;
};

/**
 * Удаляет .ics файл для события расписания
 * @param {string} scheduleId - ID события расписания
 * @returns {Promise<void>}
 */
export const deleteICSFile = async (scheduleId) => {
    if (!scheduleId) {
        throw new Error('Schedule ID is required');
    }
    
    const calendarsDir = path.join(__dirname, '..', 'public', 'calendars');
    const filename = `schedule_${scheduleId}.ics`;
    const filepath = path.join(calendarsDir, filename);
    
    try {
        await fs.unlink(filepath);
    } catch (error) {
        // Игнорируем ошибку, если файл не существует
        if (error.code !== 'ENOENT') {
            console.error(`Ошибка при удалении .ics файла ${filepath}:`, error);
            throw error;
        }
    }
};

