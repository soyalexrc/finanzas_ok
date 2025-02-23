import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {RootState} from "@/lib/store";

export interface Category {
    _id: string;
    title: string;
    description: string;
    icon: string;
    type: string;
    user: string;
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
        updateCategoriesList: (state, action: PayloadAction<Category[]>) => {
            state.list = action.payload;
        } ,
        updateCategoriesListFiltered: (state, action: PayloadAction<Category[]>) => {
            state.filtered = action.payload;
        },
        addNewToList: (state, action: PayloadAction<Category>) => {
            state.list.push(action.payload);
        }
    },
});

export const {
    updateCategoriesList,
    updateCategoriesListFiltered,
    addNewToList
} = categoriesSlice.actions;



export default categoriesSlice.reducer;

export const selectCategoriesList = (state: RootState) => state.categories.list;
export const selectCategoriesListFiltered = (state: RootState) => state.categories.filtered;
