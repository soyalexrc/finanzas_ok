import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {RootState} from "@/lib/store";

export interface CurrencyV2 {
    _id: string;
    name: string;
    code: string;
    symbol: string;
    country: string;
    decimals:number;
    format:string;
    isoNumber: number;
    subunit: string;
    subunitToUnit: number;
}

interface CurrenciesState {
    list: CurrencyV2[];
}

const initialState: CurrenciesState = {
    list: [],
};

const currenciesSlice = createSlice({
    name: 'currencies',
    initialState,
    reducers: {
        updateCurrenciesList: (state, payload: PayloadAction<CurrencyV2[]>) => {
            state.list = payload.payload;
        }
    },
});

export const {
    updateCurrenciesList,
} = currenciesSlice.actions;



export default currenciesSlice.reducer;

export const selectCurrenciesList = (state: RootState) => state.currencies.list;
