import {
    endOfMonth,
    endOfWeek,
    format,
    formatDistanceToNow, isSameMonth,
    isSameWeek, isThisMonth,
    isToday,
    isYesterday,
    startOfMonth,
    startOfWeek
} from "date-fns";
import {es, enUS} from 'date-fns/locale'
import {fromZonedTime} from "date-fns-tz";

export function getCurrentWeek(): { start: Date, end: Date } {
    const today = new Date();
    return {
        start: startOfWeek(today, {weekStartsOn: 1}),
        end: endOfWeek(today),
    }
}

export function getCurrentMonth(): { start: Date, end: Date } {
    const today = new Date();
    return {
        start: startOfMonth(today),
        end: endOfMonth(today),
    }
}

export function getCustomMonth(month: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12): { start: Date, end: Date } {
    // based on the month (1 - 12), get the start and end of the month
    const today = new Date();
    today.setMonth(month - 1);
    return {
        start: startOfMonth(today),
        end: endOfMonth(today),
    }
}

export function getCustomMonthRange(month1: number, month2: number): { start: Date, end: Date } {
    const today = new Date();
    today.setMonth(month1 - 1);
    const end = new Date(today);
    end.setMonth(month2 - 1);
    return {
        start: startOfMonth(today),
        end: endOfMonth(end),
    }
}

export function getCustomMonthRangeWithYear(month1: number, month2: number, year: number): { start: Date, end: Date } {
    const today = new Date();
    today.setMonth(month1 - 1);
    today.setFullYear(year);
    const end = new Date(today);
    end.setMonth(month2 - 1);
    return {
        start: startOfMonth(today),
        end: endOfMonth(end),
    }
}
export function getCustomMonthAndYear(month: number, year: number): { start: Date, end: Date } {
    const today = new Date();
    today.setMonth(month - 1);
    today.setFullYear(year);
    return {
        start: startOfMonth(today),
        end: endOfMonth(today),
    }
}

export const formatDateHomeItemGroups = (date: string, locale = 'es') => {
    const now = new Date();
    const localDate = fromZonedTime(date, Intl.DateTimeFormat().resolvedOptions().timeZone);
    if (isToday(localDate)) {
        return locale === 'es' ? 'Hoy' : 'Today';
    } else if (isYesterday(localDate)) {
        return locale === 'es' ? 'Ayer' : 'Yesterday';
    } else if (isSameWeek(localDate, now)) {
        return format(localDate, 'EEEE', {locale: locale === 'es' ? es : enUS}); // e.g., Monday, Tuesday
    } else if (isSameMonth(localDate, now)) {
        return formatDistanceToNow(date, {addSuffix: true, locale: locale === 'es' ? es : enUS});
    }
    else {
        // For dates beyond a week, use formatDistanceToNow
        return format(localDate, 'dd/MM/yyyy', {locale: locale === 'es' ? es : enUS}); // e.g., 10/11/2021
    }
};

export function formatDate(date: string | Date | number) {
    return fromZonedTime(date, Intl.DateTimeFormat().resolvedOptions().timeZone);
}

export function getDateRangeBetweenGapDaysAndToday(gap: number): { start: Date, end: Date } {
    const today = new Date();
    today.setHours(19);
    const start = new Date(today);
    start.setHours(0)
    start.setDate(today.getDate() - gap);
    return {
        start: formatDate(start),
        end: formatDate(today),
    }
}

export function getDateRangeAlongTimeAgo(): { start: Date, end: Date } {
    const today = new Date();
    const start = new Date(today);
    start.setFullYear(today.getFullYear() - 1);
    return {
        start: formatDate(start),
        end: formatDate(today),
    }
}
