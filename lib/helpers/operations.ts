import {ChartPoints, TransactionWithAmountNumber} from "@/lib/types/Transaction";

export function calculateTotalTransactions(transactions: TransactionWithAmountNumber[], hiddenFeatureFlag: boolean) {
    return transactions.reduce((acc, item) => acc + (hiddenFeatureFlag ? item.hidden_amount : item.amount), 0).toString()
}

export function calculateTotalFromChartPoints(points: ChartPoints[], hiddenFeatureFlag: boolean) {
    console.log(points)
    return points.reduce((acc, item) => acc + (hiddenFeatureFlag ? item.total_hidden : item.total), 0).toFixed(2)
}
