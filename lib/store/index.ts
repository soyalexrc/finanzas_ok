import {configureStore} from "@reduxjs/toolkit";
import transactionsListReducer from './features/transactions/transactionsListsSlice'
import networkReducer from './features/network/networkSlice'
import accountsReducer from './features/accounts/accountsSlice'
import categoriesReducer from './features/categories/categoriesSlice'
import transactionsReducer from './features/transactions/transactionsSlice'
import reportReducer from './features/transactions/reportSlice';

export const store = configureStore({
    reducer: {
        transactionsLists: transactionsListReducer,
        transactions: transactionsReducer,
        network: networkReducer,
        accounts: accountsReducer,
        categories: categoriesReducer,
        report: reportReducer
    }
})

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
