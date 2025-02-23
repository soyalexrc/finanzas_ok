import {
    endOfMonth,
    endOfWeek,
    getTime,
    formatDistanceToNow, isSameDay,
    parse, formatISO,
    format, isTomorrow,
    isYesterday,
    startOfMonth,
    startOfWeek
} from "date-fns";
// import { isArray } from 'lodash';
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




// v2



// ----------------------------------------------------------------------

export function fToDate(date: string, format: string){
    return parse(date, format, new Date())
}

export function fDate(date: Date, newFormat: string) {
    const fm = newFormat || 'dd MMM yyyy';

    return date ? format(new Date(date), fm) : '';
}

export function fDateUTC(date: Date, newFormat: string) {
    const fm = newFormat || 'dd MMM yyyy';

    return date ? format(new Date(new Date(date).toUTCString().substring(0, 16)), fm) : '';
}

export function dateUTC(date: Date) {
    return date ? new Date(new Date(date).toUTCString().substring(0, 16)) : date;
}

export function fTime(date: Date, newFormat: string) {
    const fm = newFormat || 'p';

    return date ? format(new Date(date), fm) : '';
}

export function fDateTime(date: Date, newFormat: string) {
    const fm = newFormat || 'dd MMM yyyy p a';

    return date ? format(new Date(date), fm) : '';
}

export function fDateTimeCL(date: string, newFormat: string) {
    const fm = newFormat || 'dd MMM yyyy';

    return date ? format(new Date(formatISO(new Date(date.substring(0, 16)))), fm) : '';
}

export function fDateTimeUTC(date: Date, locale: string) {
    return date ? `${new Date(date).toLocaleDateString(locale, { timeZone: 'UTC' })} ${new Date(date).toLocaleTimeString('es-CL', { timeZone: 'UTC' })}` : '';
}

export function fTimestamp(date: Date) {
    return date ? getTime(new Date(date)) : '';
}

export function fTimestampUTC(date: Date) {
    return date ? getTime(new Date(`${fDateUTC(date, 'yyyy-MM-dd')}T00:00:00`)) : '';
}

export function fToNow(date: Date) {
    return date
        ? formatDistanceToNow(new Date(date), {
            addSuffix: true,
        })
        : '';
}

export function isBetween(inputDate: Date, startDate: Date, endDate: Date) {
    // console.log("🚀 -> isBetween -> startDate:", new Date(startDate.toDateString()))
    const date = new Date(inputDate);
    // console.log("🚀 -> isBetween -> date:", new Date(date.toUTCString().substring(0, 16)))

    const results =
        new Date(date.toUTCString().substring(0, 16)) >= new Date(startDate.toDateString()) &&
        new Date(date.toUTCString().substring(0, 16)) <= new Date(endDate.toDateString());

    return results;
}

export function isAfter(startDate: Date, endDate: Date) {
    const results =
        startDate && endDate ? new Date(startDate).getTime() > new Date(endDate).getTime() : false;

    return results;
}

export function getNumberofDay(stringDay: string) {
    switch (stringDay) {
        case 'Domingo':
            return 0
            break;
        case 'Lunes':
            return 1
            break;
        case 'Martes':
            return 2
            break;
        case 'Miércoles':
            return 3
            break;
        case 'Jueves':
            return 4
            break;
        case 'Viernes':
            return 5
            break;
        case 'Sábado':
            return 6
            break;
        default:
            return null
            break;
    }
}
