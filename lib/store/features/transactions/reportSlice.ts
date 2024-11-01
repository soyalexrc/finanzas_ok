import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "@/lib/store";
import {
    Account,
    Category,
    ChartPoints,
    TransactionsGroupedByCategory,
} from "@/lib/types/Transaction";
import {getDateRangeBetweenGapDaysAndToday} from "@/lib/helpers/date";

export interface ReportState {
    // TODO dividir en dos, gastos e ingresos.
    amountsGroupedByDate: ChartPoints[];
    transactionsGroupedByCategory: TransactionsGroupedByCategory[];
    detailGroup: TransactionsGroupedByCategory;
    filters: {
        category: Category,
        dateRange: { start: string, end: string },
        account: Account
    }
}

const initialState: ReportState = {
    amountsGroupedByDate: [],
    transactionsGroupedByCategory: [],
    detailGroup: {
        category: {
            id: 0,
            title: '',
            icon: '',
            type: ''
        },
        transactions: [],
        account: {
            title: '',
            currency_symbol: '',
            currency_code: '',
            id: 0
        }
    },
    filters: {
        category: {
            title: '',
            icon: '',
            type: '',
            id: 0,
        },
        dateRange: {
            start: getDateRangeBetweenGapDaysAndToday(15).start.toISOString(),
            end: getDateRangeBetweenGapDaysAndToday(15).end.toISOString()
        },
        account: {
            id: 0,
            icon: '',
            title: '',
            balance: 0,
            currency_symbol: '',
            currency_code: '',
            positive_state: 0
        }
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
        },
        updateCategoryFilter: (state, action: PayloadAction<Category>) => {
            state.filters.category = action.payload;
        },
        updateDateRangeFilter: (state, action: PayloadAction<{ type: 'start' | 'end', value: string }>) => {
            const type = action.payload.type
            state.filters.dateRange[type] = action.payload.value;
        },
        updateAccountFilter: (state, action: PayloadAction<Account>) => {
            state.filters.account = action.payload;
        },
        resetFilters: (state) => {
            state.filters = initialState.filters;
            state.amountsGroupedByDate = initialState.amountsGroupedByDate;
            state.detailGroup = initialState.detailGroup;
            state.transactionsGroupedByCategory = initialState.transactionsGroupedByCategory;
        }
    }
});

export const {
    updateChartPoints,
    updateTransactionsGroupedByCategory,
    updateDetailGroup,
    updateCategoryFilter,
    resetFilters,
    updateDateRangeFilter,
    updateAccountFilter
} = reportSlice.actions;

export const selectChartPoints = (state: RootState) => state.report.amountsGroupedByDate;
export const selectTransactionsGroupedByCategory = (state: RootState) => state.report.transactionsGroupedByCategory;
export const selectDetailGroup = (state: RootState) => state.report.detailGroup;
export const selectCategoryFilter = (state: RootState) => state.report.filters.category;
export const selectDateRangeFilter = (state: RootState) => state.report.filters.dateRange;
export const selectAccountFilter = (state: RootState) => state.report.filters.account;

export default reportSlice.reducer;
