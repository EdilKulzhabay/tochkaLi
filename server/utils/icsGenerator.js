import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
 * Форматирует дату в формат iCalendar (YYYYMMDDTHHmmssZ)
 * @param {Date} date - Дата для форматирования
 * @returns {string} - Отформатированная дата в UTC
 */
const formatICSDate = (date) => {
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
 * Генерирует содержимое .ics файла для события расписания
 * @param {Object} schedule - Объект события расписания
 * @returns {string} - Содержимое .ics файла
 */
export const generateICSContent = (schedule) => {
    if (!schedule || !schedule._id) {
        throw new Error('Schedule object with _id is required');
    }
    
    const uid = `${schedule._id}@tochka.li`;
    const summary = escapeICS(schedule.eventTitle || 'Событие');
    
    // Формируем описание
    let description = escapeICS(schedule.description || '');
    if (schedule.eventLink) {
        const link = schedule.eventLink.trim();
        if (description) {
            description += '\\n\\nСсылка: ' + link;
        } else {
            description = 'Ссылка: ' + link;
        }
    }
    
    // Получаем даты
    let startDate = schedule.startDate ? new Date(schedule.startDate) : new Date();
    let endDate = schedule.endDate ? new Date(schedule.endDate) : new Date(startDate.getTime() + 60 * 60 * 1000);
    
    // Если время не указано явно (только дата без времени), устанавливаем 10:00 по умолчанию
    // Проверяем, есть ли время в дате (часы, минуты, секунды, миллисекунды не равны 0)
    const startHasTime = schedule.startDate && (
        startDate.getUTCHours() !== 0 || 
        startDate.getUTCMinutes() !== 0 || 
        startDate.getUTCSeconds() !== 0 ||
        startDate.getUTCMilliseconds() !== 0
    );
    
    const endHasTime = schedule.endDate && (
        endDate.getUTCHours() !== 0 || 
        endDate.getUTCMinutes() !== 0 || 
        endDate.getUTCSeconds() !== 0 ||
        endDate.getUTCMilliseconds() !== 0
    );
    
    if (!startHasTime) {
        startDate = new Date(startDate);
        startDate.setUTCHours(10, 0, 0, 0);
    }
    if (!endHasTime) {
        endDate = new Date(endDate);
        // Если endDate равен startDate или меньше, добавляем 1 час к startDate
        if (endDate.getTime() <= startDate.getTime()) {
            endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        } else {
            endDate.setUTCHours(11, 0, 0, 0);
        }
    }
    
    const dtstart = formatICSDate(startDate);
    const dtend = formatICSDate(endDate);
    const dtstamp = formatICSDate(new Date());
    
    // Генерируем .ics содержимое
    const icsLines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Tochka.li//Event//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTART:${dtstart}`,
        `DTEND:${dtend}`,
        `DTSTAMP:${dtstamp}`,
        `SUMMARY:${summary}`,
    ];
    
    if (description) {
        icsLines.push(`DESCRIPTION:${description}`);
    }
    
    icsLines.push(
        'STATUS:CONFIRMED',
        'SEQUENCE:0',
        'END:VEVENT',
        'END:VCALENDAR'
    );
    
    return icsLines.join('\r\n');
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
    
    await fs.writeFile(filepath, icsContent, 'utf8');
    
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

