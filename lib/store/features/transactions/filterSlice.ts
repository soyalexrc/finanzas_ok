import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "@/lib/store";

interface FilterState {
    month: { text: string, number: number};
    year: number;
    type: 'expense' | 'income';
    totalInYear: { symbol: string, amount: number }[];
    totalByMonth: { month: string, percentage: number, monthNumber: number }[];
}

const initialState: FilterState = {
    month: { text: '', number: 0 },
    totalInYear: [],
    year: new Date().getFullYear(),
    type: 'expense',
    totalByMonth: [
        {month: 'JAN', percentage: 0, monthNumber: 1},
        {month: 'FEB', percentage: 0, monthNumber: 2},
        {month: 'MAR', percentage: 0, monthNumber: 3},
        {month: 'APR', percentage: 0, monthNumber: 4},
        {month: 'MAY', percentage: 0, monthNumber: 5},
        {month: 'JUN', percentage: 0, monthNumber: 6},
        {month: 'JUL', percentage: 0, monthNumber: 7},
        {month: 'AUG', percentage: 0, monthNumber: 8},
        {month: 'SEP', percentage: 0, monthNumber: 9},
        {month: 'OCT', percentage: 0, monthNumber: 10},
        {month: 'NOV', percentage: 0, monthNumber: 11},
        {month: 'DEC', percentage: 0, monthNumber: 12}
    ]
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
        }
    }
})

export const {
    updateTotalsInYear,
    updateFilterType,
    updateYear,
    updateMonth,
    updateTotalByMonth
} = filterSlice.actions;

export const selectTotalsInYear = (state: RootState) => state.filter.totalInYear;
export const selectMonth = (state: RootState) => state.filter.month;
export const selectYear = (state: RootState) => state.filter.year;
export const selectType = (state: RootState) => state.filter.type;
export const selectTotalByMonth = (state: RootState) => state.filter.totalByMonth;

export default filterSlice.reducer;
