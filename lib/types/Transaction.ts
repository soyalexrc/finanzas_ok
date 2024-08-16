export type Transaction = {
    id: number;
    recurrentDate: string;
    date: string;
    amount: string;
    notes: string;
    account_id: number;
    user_id?: string;
    category_id: number;
}

export type FullTransactionRaw = {
    id: number;
    recurrentDate: string;
    date: string;
    user_id?: string;
    amount: string;
    notes: string;
    account_title: string;
    account_id: number;
    account_icon: string;
    account_positive_status: number;
    account_balance: number;
    category_title: string;
    category_id: number;
    category_type: string;
    category_icon: string;
}

export type FullTransaction = {
    id: number;
    recurrentDate: string;
    date: string;
    amount: string;
    notes: string;
    user_id?: string;
    category: Category,
    account: Account,
}

export type TransactionsGroupedByDate = {
    id: number;
    total: number;
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
    positive_status: number;
    id: number;
}

export type ChartPoints = {
    date: string;
    total: number;
}

export type TransactionWithAmountNumber = {
    id: number;
    recurrentDate: string;
    date: string;
    amount: number;
    notes: string;
    user_id?: string;
    account_id: number;
    category_id: number;
}

export type TransactionsGroupedByCategory = {
    category: {
        id: number,
        title: string;
        icon: string;
    },
    transactions: TransactionWithAmountNumber[]
}
