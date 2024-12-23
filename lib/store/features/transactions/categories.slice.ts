import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {RootState} from "@/lib/store";

export interface Category {
    id: string;
    title: string;
    description: string;
    icon: string;
    type: string;
}

interface CategoriesState {
    list: Category[];
    filtered: Category[];
}

const initialState: CategoriesState = {
    list: [],
    filtered: []
};

const categoriesSlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {
        updateCategoriesList: (state, payload: PayloadAction<Category[]>) => {
            state.list = payload.payload;
        } ,
        updateCategoriesListFiltered: (state, payload: PayloadAction<Category[]>) => {
            state.filtered = payload.payload;
        }
    },
});

export const {
    updateCategoriesList,
    updateCategoriesListFiltered
} = categoriesSlice.actions;



export default categoriesSlice.reducer;

export const selectCategoriesList = (state: RootState) => state.categories.list;
export const selectCategoriesListFiltered = (state: RootState) => state.categories.filtered;
