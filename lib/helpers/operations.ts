import {TransactionWithAmountNumber} from "@/lib/types/Transaction";

export function calculateTotalTransactions(transactions: TransactionWithAmountNumber[]) {
    return transactions.reduce((acc, item) => acc + item.amount, 0).toString()
}
