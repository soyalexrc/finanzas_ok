import type {PayloadAction} from '@reduxjs/toolkit'
import {createSlice} from '@reduxjs/toolkit'
import {NetInfoState, NetInfoStateType} from "@react-native-community/netinfo";
import {RootState} from "@/lib/store";

// Define a type for the slice state
interface SettingsState {
    appearance: 'system' | 'light' | 'dark';
}

// Define the initial state using that type
const initialState: SettingsState = {
    appearance: 'system',
}

export const settingsSlice = createSlice({
    name: 'settings',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
        updateAppearance: (state, action: PayloadAction<'system' | 'light' | 'dark'>) => {
            state.appearance = action.payload;
        }
    },
})

export const {
    updateAppearance
} = settingsSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectSettings = (state: RootState) => state.settings;

export default settingsSlice.reducer
