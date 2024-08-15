import {ChartPoints, TransactionWithAmountNumber} from "@/lib/types/Transaction";

export function calculateTotalTransactions(transactions: TransactionWithAmountNumber[]) {
    return transactions.reduce((acc, item) => acc + item.amount, 0).toString()
}

export function calculateTotalFromChartPoints(points: ChartPoints[]) {
    return points.reduce((acc, item) => acc + item.total, 0).toFixed(2)
}
