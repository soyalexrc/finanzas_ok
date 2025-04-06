export default {
    auth: {
        login: '/auth/login',
        register: '/auth/register'
    },
    categories: {
        listByUser: '/category/byUser',
        create: '/category'
    },
    calendar: {
        list: '/calendar-events/getEventsForDateRange'
    },
    currencies: {
        list: 'currency'
    },
    user: {
        markFavCurrency: '/user/markFavCurrency'
    },
    transactions: {
        listByUser: '/transaction/byUser',
        create: '/transaction',
        update: '/transaction',
        delete: '/transaction',
        getYearlyExpensesByCategory: '/transaction/getYearlyExpensesByCategory',
        getMonthlyStatistics: '/transaction/getMonthlyStatistics',
        getStatisticsByCurrencyAndYear: '/transaction/getStatisticsByCurrencyAndYear',
        getMonthlyTotalsByCategory: '/transaction/getMonthlyExpensesByCategory',
    }
}
