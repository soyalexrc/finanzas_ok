import type {PayloadAction} from '@reduxjs/toolkit'
import {createSlice} from '@reduxjs/toolkit'
import {NetInfoState, NetInfoStateType} from "@react-native-community/netinfo";
import {RootState} from "@/lib/store";

// Define a type for the slice state
interface UiState {
    emoji: string;
}

// Define the initial state using that type
const initialState: UiState = {
    emoji: '📬',
}

export const uiSlice = createSlice({
    name: 'ui',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
        changeEmoji: (state, action: PayloadAction<string>) => {
            state.emoji = action.payload;
        }
    },
})

export const {changeEmoji} = uiSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectCurrentEmoji = (state: RootState) => state.ui.emoji;

export default uiSlice.reducer
