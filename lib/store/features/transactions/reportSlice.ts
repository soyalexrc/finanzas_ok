import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "@/lib/store";
import {
    ChartPoints,
    FullTransaction,
    HomeViewTypeFilter,
    Transaction, TransactionsGroupedByCategory,
    TransactionsGroupedByDate, TransactionWithAmountNumber
} from "@/lib/types/Transaction";
import {index} from "@zxing/text-encoding/es2015/encoding/indexes";

export interface ReportState {
    amountsGroupedByDate: ChartPoints[];
    transactionsGroupedByCategory: TransactionsGroupedByCategory[];
    detailGroup: TransactionsGroupedByCategory;
}

const initialState: ReportState = {
    amountsGroupedByDate: [],
    transactionsGroupedByCategory: [],
    detailGroup: {
        category: {
            id: 0,
            title: '',
            icon: ''
        },
        transactions: []
    }
}

export const reportSlice = createSlice({
    name: 'report',
    initialState,
    reducers: {
        updateChartPoints: (state, action: PayloadAction<ChartPoints[]>) => {
            state.amountsGroupedByDate = action.payload;
        },
        updateTransactionsGroupedByCategory: (state, action: PayloadAction<TransactionsGroupedByCategory[]>) => {
            state.transactionsGroupedByCategory = action.payload;
        },
        updateDetailGroup: (state, action: PayloadAction<TransactionsGroupedByCategory>) => {
            state.detailGroup = action.payload;
        }
    }
});

export const {
    updateChartPoints,
    updateTransactionsGroupedByCategory,
    updateDetailGroup
} = reportSlice.actions;

export const selectChartPoints = (state: RootState) => state.report.amountsGroupedByDate;
export const selectTransactionsGroupedByCategory = (state: RootState) => state.report.transactionsGroupedByCategory;
export const selectDetailGroup = (state: RootState) => state.report.detailGroup;


export default reportSlice.reducer;
