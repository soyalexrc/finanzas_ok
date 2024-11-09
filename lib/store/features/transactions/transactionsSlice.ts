import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "@/lib/store";
import {FullTransaction, HomeViewTypeFilter, Transaction, TransactionsGroupedByDate} from "@/lib/types/Transaction";
import {formatDate} from "@/lib/helpers/date";

export interface TransactionsState {
    currentTransaction: Transaction;
    transactionsGroupedByDate: TransactionsGroupedByDate[];
    homeViewTypeFilter: HomeViewTypeFilter,
    currentBalance: number;
}

function setInitialDate() {
    const date = formatDate(new Date());
    date.setHours(5);
    return date.toISOString();
}

const initialState: TransactionsState = {
    currentTransaction: {
        amount: "0",
        category_icon: '',
        category: '',
        category_type: '',
        currency_code_t: 'USD',
        currency_symbol_t: '$',
        account: '',
        dateTime: new Date().toDateString(),
        date: setInitialDate(),
        notes: '',
        hidden_amount: "0",
        recurrentDate: 'none',
        id: -1
    },
    transactionsGroupedByDate: [],
    currentBalance: 0,
    homeViewTypeFilter: {
        type: 'Spent',
        date: 'week'
    }
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
        onChangeHiddenAmount: (state, action: PayloadAction<string>) => {
            state.currentTransaction.hidden_amount = action.payload;
        },
        updateHiddenFlag: (state, action: PayloadAction<number>) => {
            // state.currentTransaction.is_hidden_transaction = action.payload;
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
        resetCurrentTransaction: (state) => {
            state.currentTransaction = {
                amount: "0",
                hidden_amount: "0",
                dateTime: new Date().toISOString(),
                currency_symbol_t: '$',
                currency_code_t: 'USD',
                account: '',
                category_type: '',
                category: '',
                category_icon: '',
                date: new Date().toISOString(),
                notes: '',
                recurrentDate: 'none',
                id: -1
            }
        },
        updateHomeViewTypeFilter: (state, action: PayloadAction<HomeViewTypeFilter>) => {
            state.homeViewTypeFilter = action.payload;
        },
        removeTransactionFromHomeList: (state, action: PayloadAction<{ transactionId: number, groupId: number }>) => {
            const indexGroup = state.transactionsGroupedByDate.findIndex(g => g.id === action.payload.groupId);
            for (const item of state.transactionsGroupedByDate[indexGroup].items) {
                if (item.id === action.payload.transactionId) {
                    const indexItem = state.transactionsGroupedByDate[indexGroup].items.indexOf(item);

                    const totalAmountInGroup = state.transactionsGroupedByDate[indexGroup].total;
                    const amountOfItem = Number(state.transactionsGroupedByDate[indexGroup].items[indexItem].amount);
                    state.transactionsGroupedByDate[indexGroup].total = totalAmountInGroup - amountOfItem;

                    state.transactionsGroupedByDate[indexGroup].items.splice(indexItem, 1);
                    if (state.transactionsGroupedByDate[indexGroup].items.length < 1) {
                        state.transactionsGroupedByDate.splice(indexGroup, 1);
                    }
                }
            }
        },
        addTransactionInHomeList: (state, action: PayloadAction<FullTransaction>) => {
            const indexGroup = state.transactionsGroupedByDate.findIndex(g => g.date === action.payload.date);
            state.transactionsGroupedByDate[indexGroup].items.push(action.payload)
            const totalAmountInGroup = state.transactionsGroupedByDate[indexGroup].total;
            state.transactionsGroupedByDate[indexGroup].total = totalAmountInGroup + Number(action.payload.amount);
        },
        resetTransactionsSlice: (state) => {
            state.currentTransaction = initialState.currentTransaction;
            state.transactionsGroupedByDate = initialState.transactionsGroupedByDate;
            state.currentBalance = initialState.currentBalance;
            state.homeViewTypeFilter = initialState.homeViewTypeFilter;
        }
    }
});

export const {
    onChangeNotes,
    updateCurrentTransaction,
    updateTransactionsGroupedByDate,
    onRecurrentSettingChange,
    onChangeAmount,
    updateHomeViewTypeFilter,
    onChangeDate,
    resetCurrentTransaction,
    removeTransactionFromHomeList,
    updateCurrentBalance,
    updateHiddenFlag,
    resetTransactionsSlice,
    addTransactionInHomeList,
    onChangeHiddenAmount
} = transactionsSlice.actions;

export const selectCurrentTransaction = (state: RootState) => state.transactions.currentTransaction
export const selectTransactionsGroupedByDate = (state: RootState) => state.transactions.transactionsGroupedByDate
export const selectHomeViewTypeFilter = (state: RootState) => state.transactions.homeViewTypeFilter
export const selectCurrentBalance = (state: RootState) => state.transactions.currentBalance;

export default transactionsSlice.reducer;
