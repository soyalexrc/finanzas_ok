import {configureStore} from "@reduxjs/toolkit";
// import transactionsListReducer from './features/transactions/transactionsListsSlice'
// import networkReducer from './features/network/networkSlice'
// import accountsReducer from './features/accounts/accountsSlice'
// import categoriesReducer from './features/categories/categoriesSlice'
import transactionsReducer from './features/transactions/transactions.slice'
import uiReducer from './features/ui/ui.slice'
// import reportReducer from './features/transactions/reportSlice';
// import settingsReducer from './features/settings/settingsSlice';
// import uiReducer from './features/ui/uiSlice';
// import filterReducer from './features/transactions/filterSlice';

export const store = configureStore({
    reducer: {
        // transactionsLists: transactionsListReducer,
        transactions: transactionsReducer,
        ui: uiReducer,
        // network: networkReducer,
        // accounts: accountsReducer,
        // categories: categoriesReducer,
        // report: reportReducer,
        // settings: settingsReducer,
        // ui: uiReducer,
        // filter: filterReducer
    }
})

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
