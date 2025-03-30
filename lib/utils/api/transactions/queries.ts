import {useQuery} from '@tanstack/react-query';
import api from "@/lib/utils/api";
import endpoints from "@/lib/utils/api/endpoints";
import {format} from "date-fns";
import {es} from "date-fns/locale";

type YearlyExpensesByCategoryPayload = {
    userId: string;
    year: number;
    currency: string;
    token: string;
}

type RawTransactionsPayload = {
    userId: string;
    dateFrom: string;
    dateTo: string,
    searchTerm: string;
    token: string;
}

export interface Section {
    title: {
        title: string;
        totals: any[]
    };
    data: any[];
}

interface MonthlyTotalsByCategoryPayload  {
    userId: string;
    categoryType: string;
    currencyId: string;
    token: string;
}


interface MonthlyStatisticsPayload extends YearlyExpensesByCategoryPayload {
}

interface StatisticsByCurrencyAndYearPayload extends YearlyExpensesByCategoryPayload {
}

const fetchYearlyExpensesByCategory = async ({userId, year, currency, token}: YearlyExpensesByCategoryPayload) => {
    const response = await api.post(endpoints.transactions.getYearlyExpensesByCategory, {
        userId, year, currency
    }, {
        headers: {authorization: `Bearer ${token}`}
    })

    if (response.status !== 200 && response.status !== 201) {
        throw new Error('Failed to fetch yearly expenses by category');
    }

    return response.data;
};

const fetchMonthlyStatistics = async ({userId, year, currency, token}: MonthlyStatisticsPayload) => {
    const response = await api.post(endpoints.transactions.getMonthlyStatistics, {
        userId, year, currency
    }, {
        headers: {authorization: `Bearer ${token}`}
    })

    if (response.status !== 200 && response.status !== 201) {
        throw new Error('Failed to fetch yearly expenses by month');
    }

    return response.data;
};

const fetchMonthlyTotalsByCategory = async ({userId, categoryType, currencyId, token}: MonthlyTotalsByCategoryPayload) => {
    const response = await api.post(endpoints.transactions.getMonthlyTotalsByCategory, {
        userId, categoryType, currencyId
    }, {
        headers: {authorization: `Bearer ${token}`}
    })

    if (response.status !== 200) {
        throw new Error('Failed to fetch yearly expenses by month');
    }

    return response.data;
}


const fetchStatisticsByCurrencyAndYear = async ({
                                                    userId,
                                                    year,
                                                    currency,
                                                    token
                                                }: StatisticsByCurrencyAndYearPayload) => {
    const response = await api.post(endpoints.transactions.getStatisticsByCurrencyAndYear, {
        userId, year, currency
    }, {
        headers: {authorization: `Bearer ${token}`}
    })

    if (response.status !== 200 && response.status !== 201) {
        throw new Error('Failed to fetch yearly expenses by month');
    }

    return response.data;
};

const fetchRawTransactions = async ({userId, dateFrom, dateTo, searchTerm, token}: RawTransactionsPayload) => {
    const response = await api.post(endpoints.transactions.listByUser, {
        userId, dateFrom, dateTo, searchTerm
    }, {
        headers: {authorization: `Bearer ${token}`}
    })

    if (response.status !== 200 && response.status !== 201) {
        throw new Error('Failed to fetch transactions ');
    }

    return response.data;
};

const fetchTransactionGroupedByDay = async ({userId, dateFrom, dateTo, searchTerm, token}: RawTransactionsPayload): Promise<Section[]> => {
    const response = await api.post(endpoints.transactions.listByUser, {
        userId, dateFrom, dateTo, searchTerm
    }, {
        headers: {authorization: `Bearer ${token}`}
    })

    if (response.status !== 200 && response.status !== 201) {
        throw new Error('Failed to fetch transactions ');
    }

    const trs = response.data;

    // Group tasks by day
    const groupedByDay: any = trs?.reduce((acc: {
        [key: string]: any[]
    }, transaction: any) => {
        const day = format(new Date(transaction.date || new Date()), 'd MMM · eeee', {locale: es});
        if (!acc[day]) {
            acc[day] = [];
        }
        acc[day].push(transaction);
        return acc;
    }, {});

    // Convert grouped data to sections array
    const listData: Section[] = Object.entries(groupedByDay || {}).map(([day, transactions]: any) => {
        const totals = transactions.reduce((acc: {
            [key: string]: { code: string, symbol: string, total: number }
        }, transaction: any) => {
            const {code, symbol} = transaction.currency;
            if (!acc[code]) {
                acc[code] = {code, symbol, total: 0};
            }
            if (transaction.category.type === 'expense') {
                acc[code].total += transaction.amount;
            }
            return acc;
        }, {});

        return {
            title: {
                title: day,
                totals: Object.values(totals),
            },
            data: transactions,
        };
    });

    // Sort sections by date
    listData.sort((a, b) => {
        const dateA = new Date(a.data[0].date || new Date());
        const dateB = new Date(b.data[0].date || new Date());
        return dateB.getTime() - dateA.getTime();
    });

    return listData;
};


export const useYearlyExpensesByCategory = (userId: string, year: number, currency: string, token: string) => {
    return useQuery({
        queryKey: ['yearlyExpensesByCategory', userId, year, currency, token],
        queryFn: () => fetchYearlyExpensesByCategory({userId, year, currency, token}),
        // staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        staleTime: 1000 * 60 * 60 * 14, // Cache for 24 Hours
    });
};

export const useMonthlyStatistics = (userId: string, year: number, currency: string, token: string,) => {
    return useQuery({
        queryKey: ['monthlyStatistics', userId, year, currency, token],
        queryFn: () => fetchMonthlyStatistics({userId, year, currency, token}),
        // staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        staleTime: 1000 * 60 * 60 * 14, // Cache for 24 Hours
    });
};

export const useStatisticsByCurrencyAndYear = (userId: string, year: number, currency: string, token: string,) => {
    return useQuery({
        queryKey: ['statisticsByCurrencyAndYear', userId, year, currency, token],
        queryFn: () => fetchStatisticsByCurrencyAndYear({userId, year, currency, token}),
        // staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        staleTime: 1000 * 60 * 60 * 14, // Cache for 24 Hours
    });
};

export const useRawTransactions = (userId: string, dateFrom: string, dateTo: string, searchTerm: string, token: string,) => {
    return useQuery({
        enabled: !!searchTerm || (!!dateFrom && !!dateTo), // Run only if searchTerm exists OR both dateFrom & dateTo exist
        queryKey: ['rawTransactions', userId, dateFrom, searchTerm, token],
        queryFn: () => fetchRawTransactions({userId, dateFrom, dateTo, searchTerm, token}),
        // staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        staleTime: 1000 * 60 * 60 * 14, // Cache for 24 Hours
    });
};


export const useTransactionsGroupedByDay = (userId: string, dateFrom: string, dateTo: string, searchTerm: string, token: string,) => {
    return useQuery({
        enabled: !!searchTerm || (!!dateFrom && !!dateTo), // Run only if searchTerm exists OR both dateFrom & dateTo exist
        queryKey: ['transactionsGroupedByDay', userId, dateFrom, searchTerm, token],
        queryFn: () => fetchTransactionGroupedByDay({userId, dateFrom, dateTo, searchTerm, token}),
        // staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        staleTime: 1000 * 60 * 60 * 14, // Cache for 24 Hours
    });
};

export const useMonthlyTotalsByCategory = (userId: string, categoryType: string, currencyId: string, token: string,) => {
    return useQuery({
        queryKey: ['monthlyTotalsByCategory', userId, currencyId, categoryType, token],
        queryFn: () => fetchMonthlyTotalsByCategory({userId, categoryType, currencyId, token}),
        staleTime: 1000 * 60 * 60 * 14, // Cache for 24 Hours
    });
}
