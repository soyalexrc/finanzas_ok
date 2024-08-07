import type {PayloadAction} from '@reduxjs/toolkit'
import {createSlice} from '@reduxjs/toolkit'
import {NetInfoState, NetInfoStateType} from "@react-native-community/netinfo";
import {RootState} from "@/lib/store";

// Define a type for the slice state
interface TicketsState {
    networkState: NetInfoState;
}

// Define the initial state using that type
const initialState: TicketsState = {
    networkState: {
        type: NetInfoStateType.unknown,
        details: null,
        isConnected: null,
        isWifiEnabled: undefined,
        isInternetReachable: null
    },
}

export const networkSlice = createSlice({
    name: 'network',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
        changeNetworkState: (state, action: PayloadAction<NetInfoState>) => {
            state.networkState = action.payload;
        }
    },
})

export const {changeNetworkState} = networkSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectNetworkState = (state: RootState) => state.network.networkState;

export default networkSlice.reducer
