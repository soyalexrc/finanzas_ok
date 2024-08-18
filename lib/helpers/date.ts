import {
    endOfMonth,
    endOfWeek,
    format,
    formatDistanceToNow,
    isSameWeek,
    isToday,
    isYesterday,
    startOfMonth,
    startOfWeek
} from "date-fns";
import {fromZonedTime} from "date-fns-tz";

export function getCurrentWeek(): {start: Date, end: Date} {
    const today = new Date();
    return {
        start: startOfWeek(today, {weekStartsOn: 1}),
        end: endOfWeek(today),
    }
}

export function getCurrentMonth(): {start: Date, end: Date} {
    const today = new Date();
    return {
        start: startOfMonth(today),
        end: endOfMonth(today),
    }
}

export const formatDateHomeItemGroups = (date: string) => {
    const now = new Date();
    const localDate = fromZonedTime(date, Intl.DateTimeFormat().resolvedOptions().timeZone);
    if (isToday(localDate)) {
        return 'Today';
    } else if (isYesterday(localDate)) {
        return 'Yesterday';
    } else if (isSameWeek(localDate, now)) {
        return format(localDate, 'EEEE'); // e.g., Monday, Tuesday
    } else {
        // For dates beyond a week, use formatDistanceToNow
        return formatDistanceToNow(date, { addSuffix: true });
    }
};

export function formatDate(date: string | Date | number) {
    return fromZonedTime(date, Intl.DateTimeFormat().resolvedOptions().timeZone);
}

export function getDateRangeBetweenGapDaysAndToday(gap: number): {start: Date, end: Date} {
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

export function getDateRangeAlongTimeAgo(): {start: Date, end: Date} {
    const today = new Date();
    const start = new Date(today);
    start.setFullYear(today.getFullYear() - 1);
    return {
        start: formatDate(start),
        end: formatDate(today),
    }
}
