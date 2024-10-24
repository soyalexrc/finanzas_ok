import type {PayloadAction} from '@reduxjs/toolkit'
import {createSlice} from '@reduxjs/toolkit'
import {NetInfoState, NetInfoStateType} from "@react-native-community/netinfo";
import {RootState} from "@/lib/store";

// Define a type for the slice state
interface SettingsState {
    appearance: 'system' | 'light' | 'dark';
    hidden_feature_flag: boolean;
    selectedLanguage: string;
    isOnboardingShown: boolean;
    notifications: {
        scheduling: {
            hour: number,
            minute: number,
            active: boolean,
        }
    }
}

// Define the initial state using that type
const initialState: SettingsState = {
    appearance: 'system',
    hidden_feature_flag: false,
    selectedLanguage: 'es',
    isOnboardingShown: false,
    notifications: {
        scheduling: {
            active: false,
            hour: 20,
            minute: 0
        }
    }
}

export const settingsSlice = createSlice({
    name: 'settings',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
        updateAppearance: (state, action: PayloadAction<'system' | 'light' | 'dark'>) => {
            state.appearance = action.payload;
        },
        updateHiddenFeatureFlag: (state, action: PayloadAction<boolean>) => {
            state.hidden_feature_flag = action.payload;
        },
        updateSelectedLanguage: (state, action: PayloadAction<string>) => {
            state.selectedLanguage = action.payload;
        },
        updateOnboardingState: (state, action: PayloadAction<boolean>) => {
            state.isOnboardingShown = action.payload;
        },
        updateNotificationsScheduling: (state, action: PayloadAction<{hour: number, minute: number, active: boolean}>) => {
            state.notifications.scheduling = action.payload;
        }
    },
})

export const {
    updateAppearance,
    updateSelectedLanguage,
    updateHiddenFeatureFlag,
    updateOnboardingState,
    updateNotificationsScheduling,
} = settingsSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectSettings = (state: RootState) => state.settings;

export default settingsSlice.reducer
