export default {
    auth: {
        login: '/auth/login'
    },
    categories: {
        listByUser: '/category/byUser'
    },
    currencies: {
        list: 'currency'
    },
    transactions: {
        listByUser: '/transaction/byUser',
        create: '/transaction',
        getYearlyExpensesByCategory: '/transaction/getYearlyExpensesByCategory',
        getMonthlyStatistics: '/transaction/getMonthlyStatistics',
        getStatisticsByCurrencyAndYear: '/transaction/getStatisticsByCurrencyAndYear'
    }
}
