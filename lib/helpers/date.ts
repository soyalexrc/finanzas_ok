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
