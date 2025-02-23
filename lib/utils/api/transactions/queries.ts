import {useQuery} from '@tanstack/react-query';
import api from "@/lib/utils/api";
import endpoints from "@/lib/utils/api/endpoints";

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

export const useYearlyExpensesByCategory = (userId: string, year: number, currency: string, token: string) => {
    return useQuery({
        queryKey: ['yearlyExpensesByCategory', userId, year, currency, token],
        queryFn: () => fetchYearlyExpensesByCategory({userId, year, currency, token}),
        // staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });
};

export const useMonthlyStatistics = (userId: string, year: number, currency: string, token: string,) => {
    return useQuery({
        queryKey: ['monthlyStatistics', userId, year, currency, token],
        queryFn: () => fetchMonthlyStatistics({userId, year, currency, token}),
        // staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });
};

export const useStatisticsByCurrencyAndYear = (userId: string, year: number, currency: string, token: string,) => {
    return useQuery({
        queryKey: ['statisticsByCurrencyAndYear', userId, year, currency, token],
        queryFn: () => fetchStatisticsByCurrencyAndYear({userId, year, currency, token}),
        // staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });
};

export const useRawTransactions = (userId: string, dateFrom: string, dateTo: string, searchTerm: string, token: string,) => {
    return useQuery({
        enabled: !!searchTerm || (!!dateFrom && !!dateTo), // Run only if searchTerm exists OR both dateFrom & dateTo exist
        queryKey: ['rawTransactions', userId, dateFrom, searchTerm, token],
        queryFn: () => fetchRawTransactions({userId, dateFrom, dateTo, searchTerm, token}),
        // staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });
};
