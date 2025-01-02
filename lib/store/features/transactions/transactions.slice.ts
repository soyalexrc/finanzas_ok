import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "@/lib/store";
import {FullTransaction, HomeViewTypeFilter, Transaction, TransactionsGroupedByDate} from "@/lib/types/transaction";
import {format} from "date-fns";

export interface TransactionsState {
    currentTransaction: Transaction;
    transactionsGroupedByDate: TransactionsGroupedByDate[];
    homeViewTypeFilter: HomeViewTypeFilter,
    currentBalance: number;
    currency: { symbol: string; code: string };
    year: number
}

// function setInitialDate() {
//     const date = new Date();
//     // date.setHours(5);
//     return format(date, 'yyyy-MM-dd\'T\'HH:mm:ssXXX');
// }

const initialState: TransactionsState = {
    currency: { symbol: '$', code: 'USD' },
    currentTransaction: {
        amount: "0",
        category_icon: '',
        category: {
            description: '',
            icon: '',
            title: '',
            type: '',
            id: '',
        },
        images: [],
        documents: [],
        category_type: '',
        currency_code_t: 'USD',
        currency_symbol_t: '$',
        account: '',
        dateTime: '',
        date: new Date().toISOString(),
        notes: '',
        title: '',
        description: '',
        hidden_amount: "0",
        recurrentDate: 'none',
        id: ''
    },
    transactionsGroupedByDate: [],
    currentBalance: 0,
    homeViewTypeFilter: {
        type: 'Spent',
        date: 'month'
    },
    year: new Date().getFullYear()
}

export const transactionsSlice = createSlice({
    name: 'transactions',
    initialState,
    reducers: {
        onChangeNotes: (state, action: PayloadAction<string>) => {
            state.currentTransaction.notes = action.payload;
        },
        onChangeDate: (state, action: PayloadAction<string>) => {
            state.currentTransaction.date = action.payload
        },
        onChangeAmount: (state, action: PayloadAction<string>) => {
            state.currentTransaction.amount = action.payload;
        },
        onChangeCategory: (state, action: PayloadAction<any>) => {
            state.currentTransaction.category = action.payload;
        },
        onChangesTitleAndDescription: (state, action: PayloadAction<{ title: string, description: string }>) => {
            state.currentTransaction.title = action.payload.title;
            state.currentTransaction.description = action.payload.description;
        },
        onChangeYear: (state, action: PayloadAction<number>) => {
            state.year = action.payload;
        },
        onChangeId: (state, action: PayloadAction<string>) => {
            state.currentTransaction.id = action.payload;
        },
        updateHiddenFlag: (state, action: PayloadAction<number>) => {
            // state.currentTransaction.is_hidden_transaction = action.payload;
        },
        addImageToCurrentTransaction: (state, action: PayloadAction<string>) => {
            state.currentTransaction.images.push(action.payload);
        },
        addDocumentToCurrentTransaction: (state, action: PayloadAction<{ title: string, url: string }>) => {
            state.currentTransaction.documents.push(action.payload);
        },
        onRecurrentSettingChange: (state, action: PayloadAction<string>) => {
            state.currentTransaction.recurrentDate = action.payload;
        },
        updateTransactionsGroupedByDate: (state, action: PayloadAction<TransactionsGroupedByDate[]>) => {
            state.transactionsGroupedByDate = action.payload;
        },
        updateCurrentTransaction: (state, action: PayloadAction<Transaction>) => {
            state.currentTransaction = action.payload
        },
        updateCurrentBalance: (state, action: PayloadAction<number>) => {
            state.currentBalance = action.payload;
        },
        updateCurrency: (state, action: PayloadAction<{ code: string, symbol: string }>) => {
            state.currency = action.payload;
        },
        resetCurrentTransaction: (state) => {
            state.currentTransaction = initialState.currentTransaction;
        },
        updateHomeViewTypeFilter: (state, action: PayloadAction<HomeViewTypeFilter>) => {
            state.homeViewTypeFilter = action.payload;
        },
        resetTransactionsSlice: (state) => {
            state.currentTransaction = initialState.currentTransaction;
            state.transactionsGroupedByDate = initialState.transactionsGroupedByDate;
            state.currentBalance = initialState.currentBalance;
            state.homeViewTypeFilter = initialState.homeViewTypeFilter;
        },
    }
});

export const {
    onChangeNotes,
    onChangeId,
    onChangeAmount,
    onChangeDate,
    resetCurrentTransaction,
    onChangeCategory,
    onChangeYear,
    onChangesTitleAndDescription,
    updateCurrency,
    addImageToCurrentTransaction,
    addDocumentToCurrentTransaction
} = transactionsSlice.actions;

export const selectCurrentTransaction = (state: RootState) => state.transactions.currentTransaction
export const selectCurrency = (state: RootState) => state.transactions.currency;
export const selectYear = (state: RootState) => state.transactions.year
export const selectImagesFromCurrentTransaction = (state: RootState) => state.transactions.currentTransaction.images
export const selectDocumentsFromCurrentTransaction = (state: RootState) => state.transactions.currentTransaction.documents
export const selectHomeViewTypeFilter = (state: RootState) => state.transactions.homeViewTypeFilter
export const selectCurrentBalance = (state: RootState) => state.transactions.currentBalance;

export default transactionsSlice.reducer;
