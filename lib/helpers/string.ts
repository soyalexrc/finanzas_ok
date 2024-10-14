import {TransactionsGroupedByDate} from "@/lib/types/Transaction";

export function textShortener(txt: string, limit = 10): string {
    return txt?.length > limit ? txt.substring(0, limit - 1).concat('...') : txt;
}

export function formatAmountToNumber(numberString: string): number {
    return Number(numberString.replace(/,/g, ''));
}

export function formatByThousands(value: string) {
    const decimals = value.split('.')[1] ?? '';
    const rawValue = value.split('.')[0];
    const valueWithCommas = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ','); // Regex for comma separators

    return valueWithCommas + (decimals && '.' + decimals);
}

export function formatTitleOption(key: string, type: string): string {
    return key === 'Balance' ? key :  key + ' this ' + type
}

// export function calculateTotal(data: TransactionsGroupedByDate[]): { amount: string, decimals: string } {
//     const total = data.reduce((acc, cur) => acc + cur.total, 0);
//     const decimalsString = String(total).split('.')[1] ?? '00';
//     const decimals = decimalsString.length > 2 ? decimalsString.substring(0, 2) : decimalsString
//     return {
//         decimals: decimals,
//         amount: String(total).split('.')[0],
//     }
// }

export function calculateTotal(data: TransactionsGroupedByDate[], hiddenFeatureFlag: boolean): { amount: string, decimals: string, symbol: string }[] {
    const totalsBySymbol = data.reduce((acc, cur) => {
        cur.totals.forEach(total => {
            if (!acc[total.symbol]) {
                acc[total.symbol] = 0;
            }
            acc[total.symbol] += hiddenFeatureFlag ? total.hidden_amount : total.amount;
        });
        return acc;
    }, {} as Record<string, number>);

    const result =  Object.entries(totalsBySymbol).map(([symbol, total]) => {
        const decimalsString = String(total).split('.')[1] ?? '00';
        const decimals = decimalsString.length > 2 ? decimalsString.substring(0, 2) : decimalsString;
        return {
            amount: String(total).split('.')[0],
            decimals: decimals,
            symbol: symbol
        };
    });

    return result.sort((a, b) => (a.symbol === '$' ? 1 : b.symbol === '$' ? -1 : 0));
}

export function formatWithDecimals(total: number): {amount: string, decimals: string} {
    const decimalsString = String(total).split('.')[1] ?? '00';
    const decimals = decimalsString.length > 2 ? decimalsString.substring(0, 2) : decimalsString
    return {
        amount: String(total).split('.')[0],
        decimals: decimals,
    }
}
