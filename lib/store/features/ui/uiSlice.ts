import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "@/lib/store";

export interface UiState {
    isModalOpen: boolean
}

const initialState: UiState = {
    isModalOpen: false,
}

export const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        updateLayoutModalState: (state, action: PayloadAction<boolean>) => {
            state.isModalOpen = action.payload;
        },
    }
});

export const { updateLayoutModalState } = uiSlice.actions;

export const selectLayoutModalState = (state: RootState) => state.ui.isModalOpen

export default uiSlice.reducer;
