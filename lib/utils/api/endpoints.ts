export default {
    auth: {
        login: '/auth/login',
        register: '/auth/register'
    },
    categories: {
        listByUser: '/category/byUser',
        create: '/category'
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
        getStatisticsByCurrencyAndYear: '/transaction/getStatisticsByCurrencyAndYear'
    }
}
