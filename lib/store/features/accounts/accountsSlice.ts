import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "@/lib/store";
import {Account} from "@/lib/types/Transaction";

export interface AccountsState {
    list: Account[];
    selectedForm: Account;
    selected: Account;
    selectedCreateUpdate: Account
}

const initialState: AccountsState = {
    list: [],
    selectedForm: {
        id: 0,
        icon: '',
        title: '',
        currency_code: '',
        currency_symbol: '',
        positive_status: 1,
        balance: 0
    },
    selected: {
        id: 0,
        icon: '',
        title: 'All accounts',
        positive_status: 1,
        currency_code: '',
        currency_symbol: '',
        balance: 0
    },
    selectedCreateUpdate: {
        id: 0,
        icon: '',
        title: '',
        positive_status: 1,
        currency_code: '',
        currency_symbol: '',
        balance: 0
    }
}

export const accountsSlice = createSlice({
    name: 'accounts',
    initialState,
    reducers: {
        updateAccountsList: (state, action: PayloadAction<Account[]>) => {
            state.list = action.payload;
        },
        selectAccountForm: (state, action: PayloadAction<Account>) => {
            state.selectedForm = action.payload;
        },
        selectAccountGlobally: (state, action: PayloadAction<Account>) => {
            state.selected = action.payload;
        },
        addAccount: (state, action: PayloadAction<Account>) => {
            state.list.push(action.payload);
        },
        updateAccountCreateUpdate: (state, action: PayloadAction<Account>) => {
            state.selectedCreateUpdate = action.payload;
        },
        resetAccountCreateUpdate: (state) => {
            state.selectedCreateUpdate = {
                id: 0,
                icon: '',
                title: '',
                positive_status: 1,
                currency_code: '',
                currency_symbol: '',
                balance: 0
            }
        }
    }
});

export const {
    updateAccountsList,
    resetAccountCreateUpdate,
    selectAccountGlobally,
    updateAccountCreateUpdate,
    addAccount,
    selectAccountForm
} = accountsSlice.actions;

export const selectAccounts = (state: RootState) => state.accounts.list
export const selectSelectedAccountForm = (state: RootState) => state.accounts.selectedForm
export const selectSelectedAccountGlobal = (state: RootState) => state.accounts.selected;
export const selectAccountCreateUpdate = (state: RootState) => state.accounts.selectedCreateUpdate;

export default accountsSlice.reducer;
