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

export function calculatePercentageOfTotal(amount: number, total: number) {
    return (amount / total) * 100 >= 100 ? 99 : (amount / total) * 100
}

export function convertNumberToK(value: number) {
    if (value % 1000 === 0) {
        return (value / 1000) + 'k';
    } else {
        return (value / 1000).toFixed(1) + 'k';
    }
}
