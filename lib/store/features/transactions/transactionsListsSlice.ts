import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "@/lib/store";
import {Category} from "@/lib/types/Transaction";

export interface TransactionsListsState {
    resumeTransactions: ResumeItemsGroup
}

export type ResumeItemsGroup = {
    id: number | string,
    date: string,
    total: string,
    items: ResumeItem[]
}

export type ResumeItem = {
    id: number | string,
    category: Category,
    isScheduled: boolean,
    value: string
}

const initialState: TransactionsListsState = {
    resumeTransactions: {
        items: [],
        total: "",
        date: "",
        id: ""
    },
}

export const transactionsListsSlice = createSlice({
    name: 'transactionsLists',
    initialState,
    reducers: {
        bulkResumeTransactions: (state, action: PayloadAction<any>) => {
            state.resumeTransactions = action.payload;
        },
    }
});

export const { bulkResumeTransactions } = transactionsListsSlice.actions;

export const selectResumeTransactions = (state: RootState) => state.transactionsLists

export default transactionsListsSlice.reducer;
