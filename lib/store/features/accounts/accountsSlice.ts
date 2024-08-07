import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "@/lib/store";
import {Account} from "@/lib/types/Transaction";

export interface AccountsState {
    list: Account[];
    selectedForm: Account;
    selected: Account;
}

const initialState: AccountsState = {
    list: [],
    selectedForm: {
        id: 1,
        icon: '💵',
        title: 'Cash',
        positive_status: 1,
        balance: 0
    },
    selected: {
        id: 0,
        icon: '',
        title: 'All accounts',
        positive_status: 1,
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
        }
    }
});

export const { updateAccountsList, selectAccountGlobally, addAccount, selectAccountForm } = accountsSlice.actions;

export const selectAccounts = (state: RootState) => state.accounts.list
export const selectSelectedAccountForm = (state: RootState) => state.accounts.selectedForm
export const selectSelectedAccountGlobal = (state: RootState) => state.accounts.selected

export default accountsSlice.reducer;
