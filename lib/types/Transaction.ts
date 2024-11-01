export type Transaction = {
    id: number;
    recurrentDate: string;
    is_hidden_transaction: number;
    hidden_amount: string;
    date: string;
    amount: string;
    notes: string;
    account_id: number;
    category_id: number;
}

export type FullTransactionRaw = {
    id: number;
    recurrentDate: string;
    date: string;
    amount: string;
    hidden_amount: string;
    is_hidden_transaction: number;
    notes: string;
    account_title: string;
    account_id: number;
    account_icon: string;
    account_currency_code: string;
    account_currency_symbol: string;
    account_positive_state: number;
    account_balance: number;
    category_title: string;
    category_id: number;
    category_type: string;
    category_icon: string;
}

export type FullTransaction = {
    id: number;
    recurrentDate: string;
    hidden_amount: string;
    is_hidden_transaction: number;
    date: string;
    amount: string;
    notes: string;
    category: Category,
    account: Account,
}

export type TransactionsGroupedByDate = {
    id: number;
    totals: { amount: number; symbol: string, hidden_amount: number, is_hidden_transaction: number }[];
    date: string;
    items: FullTransaction[]
}

export type HomeViewTypeFilter = {
    date: 'week' | 'month' | 'none';
    type: 'Spent' | 'Revenue' | 'Balance';
}

export type GroupItem = {
    key: 'Spent' | 'Revenue' | 'Balance';
    items: Array<{
        key: string;
        type: 'week' | 'month' | 'none'
    }>
}

export type Category = {
    title: string;
    icon: string;
//     ICON DEBE SER UN TYPEOF ICON COLLECTION
    type: string;
    id: number;
}

export type Account = {
    title: string;
    icon: string;
    balance: number;
    currency_symbol: string;
    currency_code: string;
    positive_state: number;
    id: number;
}

export type AccountCreate = {
    title: string;
    icon: string;
    balance: number;
    currency_symbol: string;
    currency_code: string;
    positive_state: number;
}

export type CategoryCreate = {
    title: string;
    icon: string;
    type: string;
}

export type AccountEdit = {
    title: string;
    id: number;
    icon: string;
    balance: number;
    positive_state: number;
}

export type ChartPoints = {
    date: string;
    total: number;
    total_income: number;
    total_expense: number;
    total_expense_hidden: number;
    total_income_hidden: number;
    total_hidden: number;
}

export type TransactionWithAmountNumber = {
    id: number;
    recurrentDate: string;
    date: string;
    amount: number;
    hidden_amount: number;
    is_hidden_transaction: number;
    notes: string;
    account_id: number;
    category_id: number;
    account_symbol: string;
}

export type TransactionsGroupedByCategory = {
    category: {
        id: number,
        title: string;
        icon: string;
        type: string;
    },
    account: {
        id: number,
        title: string;
        currency_code: string;
        currency_symbol: string
    }
    transactions: TransactionWithAmountNumber[]
}
