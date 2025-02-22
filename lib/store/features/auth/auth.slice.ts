import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {RootState} from "@/lib/store";

export interface User {
    _id: string;
    firstname: string;
    lastname: string;
    photoUrl?: string;
    email: string;
    access_token: string;
}

interface AuthState {
    user: User | null;
    accessToken: string;
}

const initialState: AuthState = {
    user: null,
    accessToken: ''
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        updateUser: (state, payload: PayloadAction<User>) => {
            state.user = payload.payload;
        } ,
        updateAccessToken: (state, payload: PayloadAction<string>) => {
            state.accessToken = payload.payload;
        }
    },
});

export const {
    updateUser,
    updateAccessToken
} = authSlice.actions;



export default authSlice.reducer;

export const selectAuth = (state: RootState) => state.auth;
