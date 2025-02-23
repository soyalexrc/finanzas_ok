import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
    modalVisible: boolean;
}

const initialState: UIState = {
    modalVisible: false,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        onChangeModalVisible(state, action: PayloadAction<boolean>) {
            state.modalVisible = action.payload;
        },
    },
});

export const { onChangeModalVisible } = uiSlice.actions;
export default uiSlice.reducer;
