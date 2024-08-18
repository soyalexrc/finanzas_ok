import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "@/lib/store";
import {Account, Category} from "@/lib/types/Transaction";

export interface CategoriesState {
    list: Category[];
    selected: Category;
    selectedCreateUpdate: Category;
}


const initialState: CategoriesState = {
    list: [],
    selected: {
        icon: '🥑',
        title: 'Groceries',
        id: 1,
        type: 'expense'
    },
    selectedCreateUpdate: {
        type: 'expense',
        title: '',
        icon: '',
        id: -1
    }
}

export const categoriesSlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {
        updateCategoriesList: (state, action: PayloadAction<Category[]>) => {
            state.list = action.payload;
        },
        selectCategory: (state, action: PayloadAction<Category>) => {
            state.selected = action.payload;
        },
        updateCategoryCreateUpdate: (state, action: PayloadAction<Category>) => {
            state.selectedCreateUpdate = action.payload;
        },
        addCategory: (state, action: PayloadAction<Category>) => {
            state.list.push(action.payload);
        },
        resetCategoryCreateUpdate: (state) => {
            state.selectedCreateUpdate = {
                id: 0,
                icon: '',
                title: '',
                type: 'expense'
            }
        }
    }
});

export const {
    updateCategoriesList,
    resetCategoryCreateUpdate,
    updateCategoryCreateUpdate,
    addCategory,
    selectCategory
} = categoriesSlice.actions;

export const selectCategories = (state: RootState) => state.categories.list
export const selectSelectedCategory = (state: RootState) => state.categories.selected;
export const selectCategoryCreateUpdate = (state: RootState) => state.categories.selectedCreateUpdate;

export default categoriesSlice.reducer;
