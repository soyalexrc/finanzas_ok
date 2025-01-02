import {
    endOfMonth,
    endOfWeek,
    format,
    formatDistanceToNow, isSameDay, isSameMonth,
    isSameWeek, isThisMonth,
    isToday, isTomorrow,
    isYesterday,
    startOfMonth,
    startOfWeek
} from "date-fns";
// import {es, enUS} from 'date-fns/locale'
// import {fromZonedTime} from "date-fns-tz";
import {getLocales} from "expo-localization";
import {DATE_COLORS} from "@/lib/constants/colors";
import {es} from "date-fns/locale";
// import { es,  enUS, fr, ja, de, zhCN} from 'date-fns/locale';

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

export function getMonthsArrayByLocale() {
    const locales = getLocales();
    switch (locales[0].languageCode) {
        case 'es':
            return [
                {month: 'ENE', percentage: 0, monthNumber: 1},
                {month: 'FEB', percentage: 0, monthNumber: 2},
                {month: 'MAR', percentage: 0, monthNumber: 3},
                {month: 'ABR', percentage: 0, monthNumber: 4},
                {month: 'MAY', percentage: 0, monthNumber: 5},
                {month: 'JUN', percentage: 0, monthNumber: 6},
                {month: 'JUL', percentage: 0, monthNumber: 7},
                {month: 'AGO', percentage: 0, monthNumber: 8},
                {month: 'SEP', percentage: 0, monthNumber: 9},
                {month: 'OCT', percentage: 0, monthNumber: 10},
                {month: 'NOV', percentage: 0, monthNumber: 11},
                {month: 'DIC', percentage: 0, monthNumber: 12}
            ];
        case 'fr':
            return [
                {month: 'JAN', percentage: 0, monthNumber: 1},
                {month: 'FEB', percentage: 0, monthNumber: 2},
                {month: 'MAR', percentage: 0, monthNumber: 3},
                {month: 'AVR', percentage: 0, monthNumber: 4},
                {month: 'MAI', percentage: 0, monthNumber: 5},
                {month: 'JUN', percentage: 0, monthNumber: 6},
                {month: 'JUL', percentage: 0, monthNumber: 7},
                {month: 'AOU', percentage: 0, monthNumber: 8},
                {month: 'SEP', percentage: 0, monthNumber: 9},
                {month: 'OCT', percentage: 0, monthNumber: 10},
                {month: 'NOV', percentage: 0, monthNumber: 11},
                {month: 'DEC', percentage: 0, monthNumber: 12}
            ];
        case 'de':
            return [
                {month: 'JAN', percentage: 0, monthNumber: 1},
                {month: 'FEB', percentage: 0, monthNumber: 2},
                {month: 'MÄR', percentage: 0, monthNumber: 3},
                {month: 'APR', percentage: 0, monthNumber: 4},
                {month: 'MAI', percentage: 0, monthNumber: 5},
                {month: 'JUN', percentage: 0, monthNumber: 6},
                {month: 'JUL', percentage: 0, monthNumber: 7},
                {month: 'AUG', percentage: 0, monthNumber: 8},
                {month: 'SEP', percentage: 0, monthNumber: 9},
                {month: 'OKT', percentage: 0, monthNumber: 10},
                {month: 'NOV', percentage: 0, monthNumber: 11},
                {month: 'DEZ', percentage: 0, monthNumber: 12}
            ];
        case 'ja':
            return [
                {month: '1月', percentage: 0, monthNumber: 1},
                {month: '2月', percentage: 0, monthNumber: 2},
                {month: '3月', percentage: 0, monthNumber: 3},
                {month: '4月', percentage: 0, monthNumber: 4},
                {month: '5月', percentage: 0, monthNumber: 5},
                {month: '6月', percentage: 0, monthNumber: 6},
                {month: '7月', percentage: 0, monthNumber: 7},
                {month: '8月', percentage: 0, monthNumber: 8},
                {month: '9月', percentage: 0, monthNumber: 9},
                {month: '10月', percentage: 0, monthNumber: 10},
                {month: '11月', percentage: 0, monthNumber: 11},
                {month: '12月', percentage: 0, monthNumber: 12}
            ];
        case 'zh':
            return [
                {month: '1月', percentage: 0, monthNumber: 1},
                {month: '2月', percentage: 0, monthNumber: 2},
                {month: '3月', percentage: 0, monthNumber: 3},
                {month: '4月', percentage: 0, monthNumber: 4},
                {month: '5月', percentage: 0, monthNumber: 5},
                {month: '6月', percentage: 0, monthNumber: 6},
                {month: '7月', percentage: 0, monthNumber: 7},
                {month: '8月', percentage: 0, monthNumber: 8},
                {month: '9月', percentage: 0, monthNumber: 9},
                {month: '10月', percentage: 0, monthNumber: 10},
                {month: '11月', percentage: 0, monthNumber: 11},
                {month: '12月', percentage: 0, monthNumber: 12}
            ];
        default:
            return [
                {month: 'JAN', percentage: 0, monthNumber: 1},
                {month: 'FEB', percentage: 0, monthNumber: 2},
                {month: 'MAR', percentage: 0, monthNumber: 3},
                {month: 'APR', percentage: 0, monthNumber: 4},
                {month: 'MAY', percentage: 0, monthNumber: 5},
                {month: 'JUN', percentage: 0, monthNumber: 6},
                {month: 'JUL', percentage: 0, monthNumber: 7},
                {month: 'AUG', percentage: 0, monthNumber: 8},
                {month: 'SEP', percentage: 0, monthNumber: 9},
                {month: 'OCT', percentage: 0, monthNumber: 10},
                {month: 'NOV', percentage: 0, monthNumber: 11},
                {month: 'DEC', percentage: 0, monthNumber: 12}
            ];
    }
    // i need to get by the fist locale language, the name of the months and return a syntax similar to the one below
}

export function getDateObject(date: Date | string) : { name: string; color: string }{
    if (isYesterday(date)) {
        return { name: 'Ayer', color: DATE_COLORS.yesterday };
    }
    else if (isSameDay(date, new Date())) {
        return {  name: 'Hoy', color: DATE_COLORS.today };
    } else if (isTomorrow(new Date(date))) {
        return { name: 'Mañana', color: DATE_COLORS.tomorrow };
    } else {
        return { name: format(date, 'EEE dd MMM', { locale: es }), color: DATE_COLORS.other };
    }
}

// export const formatDateHomeItemGroups = (date: string, locale = 'es') => {
//     const now = new Date();
//     const localDate = fromZonedTime(date, Intl.DateTimeFormat().resolvedOptions().timeZone);
//     if (isToday(localDate)) {
//         return locale === 'es' ? 'Hoy' : 'Today';
//     } else if (isYesterday(localDate)) {
//         return locale === 'es' ? 'Ayer' : 'Yesterday';
//     } else if (isSameWeek(localDate, now)) {
//         return format(localDate, 'EEEE', {locale: locale === 'es' ? es : enUS}); // e.g., Monday, Tuesday
//     } else if (isSameMonth(localDate, now)) {
//         return formatDistanceToNow(date, {addSuffix: true, locale: locale === 'es' ? es : enUS});
//     }
//     else {
//         // For dates beyond a week, use formatDistanceToNow
//         return format(localDate, 'dd/MM/yyyy', {locale: locale === 'es' ? es : enUS}); // e.g., 10/11/2021
//     }
// };

// export function formatDate(date: string | Date | number) {
//     return fromZonedTime(date, Intl.DateTimeFormat().resolvedOptions().timeZone);
// }

// export function getDateRangeBetweenGapDaysAndToday(gap: number): { start: Date, end: Date } {
//     const today = new Date();
//     today.setHours(19);
//     const start = new Date(today);
//     start.setHours(0)
//     start.setDate(today.getDate() - gap);
//     return {
//         start: formatDate(start),
//         end: formatDate(today),
//     }
// }

// export function getDateRangeAlongTimeAgo(): { start: Date, end: Date } {
//     const today = new Date();
//     const start = new Date(today);
//     start.setFullYear(today.getFullYear() - 1);
//     return {
//         start: formatDate(start),
//         end: formatDate(today),
//     }
// }
