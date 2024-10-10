import {SQLiteDatabase} from "expo-sqlite";
import {
    Account, AccountCreate, AccountEdit,
    Category, CategoryCreate, ChartPoints,
    FullTransaction,
    FullTransactionRaw,
    Transaction, TransactionsGroupedByCategory,
    TransactionsGroupedByDate
} from "@/lib/types/Transaction";
import {a} from "ofetch/dist/shared/ofetch.8459ad38";

export function getAllAccounts(db: SQLiteDatabase): Account[] {
    // db.runSync(`UPDATE accounts SET balance = ? WHERE id = ? `, [500, 1]);
    // db.runSync(`INSERT INTO accounts (title, icon, balance, positive_state) VALUES ($title, $icon, $balance, $positive_status)`, { $title: 'Visa 1234', $icon: '💳', $balance: 43142.23, $positive_status: false })
    return db.getAllSync(`SELECT *
                          FROM accounts ORDER BY title`);
}

export function getAllCategories(db: SQLiteDatabase): Category[] {
    return db.getAllSync(`SELECT *
                          FROM categories ORDER BY title`);
}

export async function getTransactions(db: SQLiteDatabase, dateFrom: string, dateTo: string, accountId: number, categoryId: number): Promise<{
    amountsGroupedByDate: ChartPoints[],
    transactionsGroupedByCategory: TransactionsGroupedByCategory[]
}> {
    console.log({
        dateFrom, accountId, dateTo, categoryId
    })
    let amountsGroupedByDate: ChartPoints[] = [];
    let transactionsGroupedByCategory: TransactionsGroupedByCategory[] = [];

    if (accountId === 0 && categoryId === 0) {
        amountsGroupedByDate = await db.getAllAsync(`
            SELECT strftime('%Y-%m-%d', date) AS date,
            ROUND(SUM(amount), 2) AS total
            FROM transactions
            WHERE
                date BETWEEN ?
              and ?
            GROUP BY date
        `, [dateFrom, dateTo]);

        transactionsGroupedByCategory = await db.getAllAsync(`
            SELECT c.title,
                   c.icon,
                   c.id,
                   a.id                AS account_id,
                   a.title             AS account_id,
                   a.currency_symbol   AS currency_symbol,
                   a.currency_code     AS currency_code,
                   json_group_array(json_object(
                           'id', t.id,
                           'amount', t.amount,
                           'recurrentDate', t.recurrentDate,
                           'date', t.date,
                           'notes', t.notes,
                           'account_id', t.account_id,
                           'category_id', t.category_id
                                    )) AS transactions
            FROM transactions t
                     LEFT JOIN categories c ON t.category_id = c.id
                     LEFT JOIN accounts a ON t.account_id = a.id
            WHERE
                date BETWEEN ?
              and ?
            GROUP BY c.id
        `, [dateFrom, dateTo]);
    } else if (accountId !== 0 && categoryId === 0) {
        amountsGroupedByDate = await db.getAllAsync(`
            SELECT strftime('%Y-%m-%d', date) AS date,
            ROUND(SUM(amount), 2) AS total
            FROM transactions
            WHERE
                date BETWEEN ?
              and ?
              AND account_id = ?
            GROUP BY date
        `, [dateFrom, dateTo, accountId]);

        transactionsGroupedByCategory = await db.getAllAsync(`
            SELECT c.title,
                   c.icon,
                   c.id,
                   a.id                AS account_id,
                   a.title             AS account_id,
                   a.currency_symbol   AS currency_symbol,
                   a.currency_code     AS currency_code,
                   json_group_array(json_object(
                           'id', t.id,
                           'amount', t.amount,
                           'recurrentDate', t.recurrentDate,
                           'date', t.date,
                           'notes', t.notes,
                           'account_id', t.account_id,
                           'category_id', t.category_id
                                    )) AS transactions
            FROM transactions t
                     LEFT JOIN categories c ON t.category_id = c.id
                     LEFT JOIN accounts a ON t.account_id = a.id
            WHERE
                date BETWEEN ?
              and ?
              AND account_id = ?
            GROUP BY c.id
        `, [dateFrom, dateTo, accountId]);

    } else if (categoryId !== 0 && accountId === 0) {
        amountsGroupedByDate = await db.getAllAsync(`
            SELECT strftime('%Y-%m-%d', date) AS date,
            ROUND(SUM(amount), 2) AS total
            FROM transactions
            WHERE
                date BETWEEN ?
              and ?
              AND category_id = ?
            GROUP BY date
        `, [dateFrom, dateTo, categoryId]);

        transactionsGroupedByCategory = await db.getAllAsync(`
            SELECT c.title,
                   c.icon,
                   c.id,
                   a.id                AS account_id,
                   a.title             AS account_id,
                   a.currency_symbol   AS currency_symbol,
                   a.currency_code     AS currency_code,
                   json_group_array(json_object(
                           'id', t.id,
                           'amount', t.amount,
                           'recurrentDate', t.recurrentDate,
                           'date', t.date,
                           'notes', t.notes,
                           'account_id', t.account_id,
                           'category_id', t.category_id
                                    )) AS transactions
            FROM transactions t
                     LEFT JOIN categories c ON t.category_id = c.id
                     LEFT JOIN accounts a ON t.account_id = a.id
            WHERE
                date BETWEEN ?
              and ?
              AND category_id = ?

            GROUP BY c.id
        `, [dateFrom, dateTo, categoryId]);
    } else {
        amountsGroupedByDate = await db.getAllAsync(`
            SELECT strftime('%Y-%m-%d', date) AS date,
            ROUND(SUM(amount), 2) AS total
            FROM transactions
            WHERE
                date BETWEEN ?
              and ?
              AND account_id = ?
              AND category_id = ?
            GROUP BY date
        `, [dateFrom, dateTo, accountId, categoryId]);

        transactionsGroupedByCategory = await db.getAllAsync(`
            SELECT c.title,
                   c.icon,
                   c.id,
                   a.id                AS account_id,
                   a.title             AS account_id,
                   a.currency_symbol   AS currency_symbol,
                   a.currency_code     AS currency_code,
                   json_group_array(json_object(
                           'id', t.id,
                           'amount', t.amount,
                           'recurrentDate', t.recurrentDate,
                           'date', t.date,
                           'notes', t.notes,
                           'account_id', t.account_id,
                           'category_id', t.category_id
                                    )) AS transactions
            FROM transactions t
                     LEFT JOIN categories c ON t.category_id = c.id
                     LEFT JOIN accounts a ON t.account_id = a.id
            WHERE
                date BETWEEN ?
              and ?
              AND account_id = ?
              AND category_id = ?
            GROUP BY c.id
        `, [dateFrom, dateTo, accountId, categoryId]);
    }

    // const debugTr = transactionsGroupedByCategory.find((group: any) => group.id === 21)

    // console.log(JSON.parse(debugTr?.transactions as any)?.map((t, index) => ({  i: index, t: t.amount })));


    const result = {
        amountsGroupedByDate,
        transactionsGroupedByCategory: transactionsGroupedByCategory.map((group: any) => ({
            category: {
                title: group.title,
                icon: group.icon,
                id: group.id,
            },
            account: {
                id: group.account_id,
                title: group.account_title,
                currency_code: group.currency_code,
                currency_symbol: group.currency_symbol,
            },
            transactions: JSON.parse(group.transactions)?.map((t: any) => ({
                ...t,
                account_symbol: group.currency_symbol
            }))
        }))
    }

    // const debugAll = await db.getAllAsync('SELECT amount FROM transactions as t WHERE t.category_id = 21')
    //
    // console.log(debugAll)
    // const debug = result.transactionsGroupedByCategory.filter(g => g.category.id === 21)
    //
    // console.log(debug[0].transactions.map((t: any) => ({ amount: t.amount })));


    return result;
}

type Group = {
    totals: { amount: number; symbol: string }[];
    formatted_date: string;
}

type GroupRaw = {
    total: number;
    formatted_date: string;
    currency_symbol: string;
}

export async function getTransactionsGroupedAndFiltered(db: SQLiteDatabase, startDate: string, endDate: string, type: 'Spent' | 'Revenue' | 'Balance', accountId = 0): Promise<TransactionsGroupedByDate[]> {
    try {
        let groups: GroupRaw[] = [];
        let transactions: FullTransactionRaw[] = [];

        if (accountId === 0) {
            groups = await db.getAllAsync(`
                SELECT strftime('%Y-%m-%d', t.date) AS formatted_date,
                       ROUND(SUM(t.amount), 2)      AS total,
                       c.type                       AS transaction_type,
                       t.account_id,
                       a.currency_symbol            AS currency_symbol
                FROM transactions t
                         LEFT JOIN categories c ON t.category_id = c.id
                         LEFT JOIN accounts a ON t.account_id = a.id
                WHERE date BETWEEN ?
                  and ?
                  AND transaction_type = ?
                GROUP BY formatted_date, currency_symbol
                ORDER BY date DESC;
            `, [startDate, endDate, type === 'Revenue' ? 'income' : 'expense']);


            transactions = await db.getAllAsync(`
                SELECT t.id,
                       t.amount,
                       t.recurrentDate,
                       strftime('%Y-%m-%d', t.date) AS date,
            t.notes,
            c.title AS category_title,
            c.id AS category_id,
            c.icon AS category_icon,
            c.type AS category_type,
            a.title AS account_title,
            a.currency_code AS account_currency_code,
            a.currency_symbol AS account_currency_symbol,
            a.icon AS account_icon,
            a.id AS account_id,
            a.balance AS account_balance,
            a.positive_state AS account_positive_state
                FROM transactions t
                    LEFT JOIN categories c
                ON t.category_id = c.id
                    LEFT JOIN accounts a ON t.account_id = a.id
                WHERE t.date BETWEEN ?
                  and ?
                  AND c.type = ?
            `, [startDate, endDate, type === 'Revenue' ? 'income' : 'expense']);

        } else {
            groups = await db.getAllAsync(`
                SELECT strftime('%Y-%m-%d', t.date) AS formatted_date,
                       ROUND(SUM(t.amount), 2)      AS total,
                       c.type                       AS transaction_type,
                       t.account_id,
                       a.currency_symbol            AS currency_symbol
                FROM transactions t
                         LEFT JOIN categories c ON t.category_id = c.id
                         LEFT JOIN accounts a ON t.account_id = a.id
                WHERE date BETWEEN ?
                  and ?
                  AND transaction_type = ?
                  AND t.account_id = ?
                GROUP BY formatted_date
                ORDER BY date DESC;
            `, [startDate, endDate, type === 'Revenue' ? 'income' : 'expense', accountId]);

            transactions = await db.getAllAsync(`
                SELECT t.id,
                       t.amount,
                       t.recurrentDate,
                       strftime('%Y-%m-%d', t.date) AS date,
            t.notes,
            c.title AS category_title,
            c.id AS category_id,
            c.icon AS category_icon,
            c.type AS category_type,
            a.title AS account_title,
            a.currency_code AS account_currency_code,
            a.currency_symbol AS account_currency_symbol,
            a.icon AS account_icon,
            a.id AS account_id,
            a.balance AS account_balance,
            a.positive_state AS account_positive_state
                FROM transactions t
                    LEFT JOIN categories c
                ON t.category_id = c.id
                    LEFT JOIN accounts a ON t.account_id = a.id
                WHERE t.date BETWEEN ?
                  and ?
                  AND c.type = ?
                  AND t.account_id = ?
            `, [startDate, endDate, type === 'Revenue' ? 'income' : 'expense', accountId]);

        }

        const formattedTransactions = transactions.map(t => ({
            id: t.id,
            date: t.date,
            notes: t.notes,
            amount: String(t.amount),
            recurrentDate: t.recurrentDate,
            category: {
                id: t.category_id,
                icon: t.category_icon,
                title: t.category_title,
                type: t.category_type
            },
            account: {
                id: t.account_id,
                icon: t.account_icon,
                title: t.account_title,
                balance: t.account_balance,
                currency_code: t.account_currency_code,
                currency_symbol: t.account_currency_symbol,
                positive_state: t.account_positive_state,
            }
        }));

        const groupedData = groups.reduce((acc: any[], curr: any) => {
            const dateGroup = acc.find(group => group.formatted_date === curr.formatted_date);
            const totalObj = {amount: curr.total, symbol: curr.currency_symbol};

            if (dateGroup) {
                dateGroup.totals.push(totalObj);
            } else {
                acc.push({
                    formatted_date: curr.formatted_date,
                    totals: [totalObj]
                });
            }

            return acc;
        }, []);

        return groupedData.map((g, i) => ({
            id: i + 1,
            date: g.formatted_date,
            totals: g.totals,
            items: formattedTransactions.filter(t => t.date === g.formatted_date),
        }))
    } catch (err) {
        console.error(err);
        return [];
    }
}

export async function createAccount(db: SQLiteDatabase, account: AccountCreate): Promise<any> {
    const accounts = await db.getAllAsync('SELECT * FROM accounts WHERE title = ?', [account.title]);
    if (accounts.length > 0) {
        return {
            error: true,
            desc: 'Ya existe una cuenta con ese nombre.',
        };
    } else {
        const statement = await db.prepareAsync('INSERT INTO accounts (title, icon, balance, positive_state, currency_code, currency_symbol) VALUES ($title, $icon, $balance, $positive_state, $currency_code, $currency_symbol)');
        try {
            await statement.executeAsync({
                $title: account.title,
                $icon: account.icon,
                $balance: account.balance,
                $positive_state: account.positive_state,
                $currency_code: account.currency_code,
                $currency_symbol: account.currency_symbol,
            });
            const accountCreated = await db.getAllAsync('SELECT * FROM accounts ORDER BY id DESC LIMIT 1');
            return {
                error: false,
                desc: '',
                data: accountCreated[0]
            }
        } catch (err) {

        } finally {
            await statement.finalizeAsync();
        }

    }
};

export async function createCategory(db: SQLiteDatabase, category: CategoryCreate): Promise<any> {
    const categories = await db.getAllAsync('SELECT * FROM categories WHERE title = ?', [category.title]);
    if (categories.length > 0) {
        return {
            error: true,
            desc: 'Ya existe una categoria con ese nombre.',
        };
    } else {
        const statement = await db.prepareAsync('INSERT INTO categories (title, icon, type) VALUES ($title, $icon, $type)');
        try {
            await statement.executeAsync({
                $title: category.title,
                $icon: category.icon,
                $type: category.type,
            });
            const categoryCreated = await db.getAllAsync('SELECT * FROM categories ORDER BY id DESC LIMIT 1');
            return {
                error: false,
                desc: '',
                data: categoryCreated[0]
            }
        } catch (err) {

        } finally {
            await statement.finalizeAsync();
        }

    }
};


export async function updateCategory(db: SQLiteDatabase, category: Category): Promise<any> {
    try {
        await db.runAsync('UPDATE categories SET title = ?, icon = ?, type = ? WHERE id = ?', [category.title, category.icon, category.type, category.id]);
        const accountCreated = await db.getAllAsync('SELECT * FROM categories ORDER BY id DESC LIMIT 1');
        return accountCreated[0]
    } catch (err) {
        console.error(err);
    }
};

export async function updateAccount(db: SQLiteDatabase, account: AccountEdit): Promise<any> {
    try {
        await db.runAsync('UPDATE accounts SET title = ?, icon = ?, balance = ?, positive_state =? WHERE id = ?', [account.title, account.icon, account.balance, account.positive_state, account.id]);
        const accountCreated = await db.getAllAsync('SELECT * FROM accounts ORDER BY id DESC LIMIT 1');
        return accountCreated[0]
    } catch (err) {
        console.error(err);
    }
};

export async function deleteTransaction(db: SQLiteDatabase, transactionId: number) {
    try {
        return await db.runAsync('DELETE FROM transactions WHERE id = $transactionId', {$transactionId: transactionId})
    } catch (err) {
        console.error(err);
    }
}

export async function createTransaction(db: SQLiteDatabase, transaction: Transaction): Promise<FullTransaction | {}> {
    const statement = await db.prepareAsync(`INSERT INTO transactions (amount, recurrentDate, date, notes, account_id, category_id)
                                             VALUES ($amount, $recurrentDate, $date, $notes, $account_id, $category_id)`);
    try {
        const t = await statement.executeAsync({
            $amount: Number(transaction.amount),
            $recurrentDate: transaction.recurrentDate,
            $date: transaction.date,
            $notes: transaction.notes,
            $account_id: transaction.account_id,
            $category_id: transaction.category_id,
        });

        // const categoryType: {type: string} | null = await db.getFirstAsync('SELECT type FROM categories WHERE id = ?', [transaction.category_id]);
        // const balanceInAccount: {balance: number} | null = await db.getFirstAsync('SELECT balance FROM accounts WHERE id = ?', [transaction.account_id]);
        // await db.runAsync('UPDATE accounts SET balance = ? WHERE id = ?', [categoryType?.type === 'expense' ? balanceInAccount!.balance - Number(transaction.amount) : balanceInAccount!.balance + Number(transaction.amount), transaction.account_id])

        // if (categoryType?.type === 'expense' && balanceInAccount!.balance - Number(transaction.amount) < 0) {
        //     await db.runAsync('UPDATE accounts SET positive_state = ? WHERE id = ?', [0, transaction.account_id])
        // }
        //
        // if (categoryType?.type === 'income' && balanceInAccount!.balance + Number(transaction.amount) > 0) {
        //     await db.runAsync('UPDATE accounts SET positive_state = ? WHERE id = ?', [1, transaction.account_id])
        // }

        const retrievedTransaction: any = await db.getFirstAsync(`
            SELECT t.id,
                   t.amount,
                   t.recurrentDate,
                   strftime('%Y-%m-%d', t.date) AS date,
                t.notes,
                c.title AS category_title,
                c.id AS category_id,
                c.icon AS category_icon,
                c.type AS category_type,
                a.title AS account_title,
                a.icon AS account_icon,
                a.id AS account_id,
                a.balance AS account_balance,
                a.positive_state AS account_positive_state
            FROM transactions t
                LEFT JOIN categories c
            ON t.category_id = c.id
                LEFT JOIN accounts a ON t.account_id = a.id
            WHERE t.id = $id
        `, {$id: t.lastInsertRowId})

        return {
            id: retrievedTransaction.id,
            account: {
                id: retrievedTransaction.account_id,
                title: retrievedTransaction.account_title,
                icon: retrievedTransaction.account_icon,
                balance: retrievedTransaction.account_balance,
                positive_state: retrievedTransaction.account_positive_state
            },
            category: {
                id: retrievedTransaction.category_id,
                icon: retrievedTransaction.category_icon,
                title: retrievedTransaction.category_title,
                type: retrievedTransaction.category_type
            },
            amount: String(retrievedTransaction.amount),
            notes: retrievedTransaction.notes,
            date: retrievedTransaction.date,
            recurrentDate: retrievedTransaction.recurrentDate
        }
    } catch (err) {
        console.error(err);
        return {}
    } finally {
        await statement.finalizeAsync();
    }
}


export async function updateTransaction(db: SQLiteDatabase, transaction: Transaction): Promise<FullTransaction | {}> {
    const statement = await db.prepareAsync(`
        UPDATE transactions
        SET amount        = ?,
            recurrentDate = ?,
            date          = ?,
            notes         = ?,
            account_id    = ?,
            category_id   = ?
        WHERE id = ?
    `);
    try {
        const oldTransaction: { amount: number, category_id: string } | null = await db.getFirstAsync('SELECT amount, category_id FROM transactions WHERE id = ?', [transaction.id]);
        const oldCategoryType: { type: string } | null = await db.getFirstAsync('SELECT type FROM categories WHERE id = ?', [oldTransaction?.category_id!]);
        const t = await statement.executeAsync([Number(transaction.amount), transaction.recurrentDate, transaction.date, transaction.notes, transaction.account_id, transaction.category_id, transaction.id]);
        const balanceInAccount: {balance: number, positive_state: number} | null= await db.getFirstAsync('SELECT balance, positive_state FROM accounts WHERE id = ?', [transaction.account_id]);

        const categoryType: { type: string } | null = await db.getFirstAsync('SELECT type FROM categories WHERE id = ?', [transaction.category_id]);

        // Calculate the operation based on category types
        const operation = oldCategoryType?.type === 'expense' ? balanceInAccount?.positive_state! > 0 ? 'reduce' : 'sum' : balanceInAccount?.positive_state! > 0 ? 'reduce' : 'sum';

        // Calculate the balance without the old transaction
        const balanceWithoutOldTransaction = operation === 'sum' ? balanceInAccount?.balance! + oldTransaction?.amount! : balanceInAccount?.balance! - oldTransaction?.amount!;

        // Calculate the balance with the new transaction
        const balanceWithNewTransaction = categoryType?.type === 'expense' ? balanceWithoutOldTransaction - Number(transaction.amount) : balanceWithoutOldTransaction + Number(transaction.amount);


        console.log({
            balanceInAccount,
            operation,
            balanceWithoutOldTransaction,
            balanceWithNewTransaction
        })
        // Removemos el anterior valor de la transaccion en el balance
        // await db.runAsync('UPDATE accounts SET balance = ? WHERE id = ?', [categoryType?.type === 'expense' ? balanceInAccount!.balance + oldTransaction?.amount! : balanceInAccount!.balance - oldTransaction?.amount!, transaction.account_id])


        // const newBalanceBasedOnOldAmountAndNewAmount: number = 10;


        // Actualizamos el nuevo valor de la transaccion en el balance
        if (oldTransaction?.amount !== Number(transaction.amount) || oldCategoryType?.type !== categoryType?.type) {
            await db.runAsync('UPDATE accounts SET balance = ? WHERE id = ?', [balanceWithNewTransaction, transaction.account_id]);
            await db.runAsync('UPDATE accounts SET positive_state = ? WHERE id = ?', [balanceWithNewTransaction < 0 ? 0 : 1, transaction.account_id])
        }

        const retrievedTransaction: any = await db.getFirstAsync(`
            SELECT t.id,
                   t.amount,
                   t.recurrentDate,
                   strftime('%Y-%m-%d', t.date) AS date,
                t.notes,
                c.title AS category_title,
                c.id AS category_id,
                c.icon AS category_icon,
                c.type AS category_type,
                a.title AS account_title,
                a.icon AS account_icon,
                a.id AS account_id,
                a.balance AS account_balance,
                a.positive_state AS account_positive_state
            FROM transactions t
                LEFT JOIN categories c
            ON t.category_id = c.id
                LEFT JOIN accounts a ON t.account_id = a.id
            WHERE t.id = $id
        `, {$id: transaction.id})

        return {
            id: retrievedTransaction.id,
            account: {
                id: retrievedTransaction.account_id,
                title: retrievedTransaction.account_title,
                icon: retrievedTransaction.account_icon,
                balance: retrievedTransaction.account_balance,
                positive_state: retrievedTransaction.account_positive_status
            },
            category: {
                id: retrievedTransaction.category_id,
                icon: retrievedTransaction.category_icon,
                title: retrievedTransaction.category_title,
                type: retrievedTransaction.category_type
            },
            amount: String(retrievedTransaction.amount),
            notes: retrievedTransaction.notes,
            date: retrievedTransaction.date,
            recurrentDate: retrievedTransaction.recurrentDate
        }
    } catch (err) {
        console.error(err);
        return {}
    }
}

export async function stopRecurringInTransaction(db: SQLiteDatabase, transactionId: number): Promise<FullTransaction | {}> {
    const statement = await db.prepareAsync(`
        UPDATE transactions
        SET recurrentDate = ?
        WHERE id = ?
    `);
    try {
        const t = await statement.executeAsync(['none', transactionId]);
        const retrievedTransaction: any = await db.getFirstAsync(`
            SELECT t.id,
                   t.amount,
                   t.recurrentDate,
                   strftime('%Y-%m-%d', t.date) AS date,
                t.notes,
                c.title AS category_title,
                c.id AS category_id,
                c.icon AS category_icon,
                c.type AS category_type,
                a.title AS account_title,
                a.icon AS account_icon,
                a.id AS account_id,
                a.balance AS account_balance,
                a.positive_state AS account_positive_state
            FROM transactions t
                LEFT JOIN categories c
            ON t.category_id = c.id
                LEFT JOIN accounts a ON t.account_id = a.id
            WHERE t.id = $id
        `, {$id: transactionId})

        return {
            id: retrievedTransaction.id,
            account: {
                id: retrievedTransaction.account_id,
                title: retrievedTransaction.account_title,
                icon: retrievedTransaction.account_icon,
                balance: retrievedTransaction.account_balance,
                positive_state: retrievedTransaction.account_positive_status
            },
            category: {
                id: retrievedTransaction.category_id,
                icon: retrievedTransaction.category_icon,
                title: retrievedTransaction.category_title,
                type: retrievedTransaction.category_type
            },
            amount: String(retrievedTransaction.amount),
            notes: retrievedTransaction.notes,
            date: retrievedTransaction.date,
            recurrentDate: retrievedTransaction.recurrentDate
        }
    } catch (err) {
        console.error(err);
        return {}
    }
}

export async function getCurrentBalance(db: SQLiteDatabase): Promise<number> {
    try {
        const data: { total: number }[] = await db.getAllAsync(`
            SELECT ROUND(SUM(balance), 2) AS total
            FROM accounts
        `);
        return data[0].total;
    } catch (err) {
        console.error(err);
        return 0;
    }
}

export function getAmountOfTransactionsByAccountId(db: SQLiteDatabase, accountId: number): number {
    const result: {
        count: number
    } | null = db.getFirstSync('SELECT COUNT(*) AS count FROM transactions WHERE account_id = ?', [accountId]);
    return result?.count ?? 0;
}

export async function deleteAccount(db: SQLiteDatabase, accountId: number) {
    await db.runAsync('DELETE FROM transactions WHERE account_id = ? ', [accountId]);
    await db.runAsync('DELETE FROM accounts WHERE id = ?', [accountId]);
}

export async function deleteCategory(db: SQLiteDatabase, categoryId: number) {
    await db.runAsync('DELETE FROM transactions WHERE category_id = ? ', [categoryId]);
    await db.runAsync('DELETE FROM categories WHERE id = ?', [categoryId]);
}
