import {configureStore} from "@reduxjs/toolkit";
import transactionsListReducer from './features/transactions/transactionsListsSlice'
import networkReducer from './features/network/networkSlice'
import accountsReducer from './features/accounts/accountsSlice'
import categoriesReducer from './features/categories/categoriesSlice'
import uiReducer from './features/ui/uiSlice'
import transactionsReducer from './features/transactions/transactionsSlice'

export const store = configureStore({
    reducer: {
        transactionsLists: transactionsListReducer,
        transactions: transactionsReducer,
        network: networkReducer,
        accounts: accountsReducer,
        categories: categoriesReducer,
        ui: uiReducer
    }
})

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
