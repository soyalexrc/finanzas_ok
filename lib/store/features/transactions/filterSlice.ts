import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "@/lib/store";
import {getMonthsArrayByLocale} from "@/lib/helpers/date";

interface FilterState {
    month: { text: string, number: number};
    year: number;
    type: 'expense' | 'income';
    totalInYear: { symbol: string, amount: number }[];
    totalByMonth: { month: string, percentage: number, monthNumber: number }[];
    limit: number;
}

const initialState: FilterState = {
    month: { text: '', number: 0 },
    totalInYear: [],
    year: new Date().getFullYear(),
    type: 'expense',
    totalByMonth: getMonthsArrayByLocale(),
    limit: 2500
}

const filterSlice = createSlice({
    name: 'filter',
    initialState,
    reducers: {
        updateTotalsInYear(state, action: PayloadAction<{ symbol: string, amount: number }[]>) {
            state.totalInYear = action.payload;
        },
        updateMonth(state, action: PayloadAction<{ text: string, number: number }>) {
            state.month = action.payload;
        },
        updateYear(state, action: PayloadAction<number>) {
            state.year = action.payload;
        },
        updateFilterType(state, action: PayloadAction<'income' | 'expense'>) {
            state.type = action.payload;
        },
        updateTotalByMonth(state, action: PayloadAction<{ month: string, percentage: number, monthNumber: number }[]>) {
            state.totalByMonth = action.payload;
        },
        updateLimit(state, action: PayloadAction<number>) {
            state.limit = action.payload
        },
        resetFilter(state) {
            state.type = 'expense';
            state.limit = 2500;
            state.year = new Date().getFullYear();
            state.totalByMonth = getMonthsArrayByLocale();
            state.totalInYear = []
        }
    }
})

export const {
    updateTotalsInYear,
    updateFilterType,
    resetFilter,
    updateYear,
    updateMonth,
    updateTotalByMonth,
    updateLimit,
} = filterSlice.actions;

export const selectTotalsInYear = (state: RootState) => state.filter.totalInYear;
export const selectMonth = (state: RootState) => state.filter.month;
export const selectYear = (state: RootState) => state.filter.year;
export const selectType = (state: RootState) => state.filter.type;
export const selectLimit = (state: RootState) => state.filter.limit;
export const selectTotalByMonth = (state: RootState) => state.filter.totalByMonth;

export default filterSlice.reducer;
