import {ChartPoints, TransactionWithAmountNumber} from "@/lib/types/Transaction";

export function calculateTotalTransactions(transactions: TransactionWithAmountNumber[], hiddenFeatureFlag: boolean) {
    return transactions.reduce((acc, item) => acc + (hiddenFeatureFlag ? item.hidden_amount : item.amount), 0).toFixed(2)
}

export function calculateTotalFromChartPoints(points: ChartPoints[], hiddenFeatureFlag: boolean) {
    return points.reduce((acc, item) => acc + (hiddenFeatureFlag ? item.total_hidden : item.total), 0).toFixed(2)
}

export function calculateTotalsFromChartPoints(points: ChartPoints[], hiddenFeatureFlag: boolean): { totalIncome: string, totalExpense: string } {
    return {
        totalIncome: points.reduce((acc, item) => acc + (hiddenFeatureFlag ? item.total_income_hidden : item.total_income), 0).toFixed(2),
        totalExpense: points.reduce((acc, item) => acc + (hiddenFeatureFlag ? item.total_expense_hidden : item.total_expense), 0).toFixed(2)
    }
}
