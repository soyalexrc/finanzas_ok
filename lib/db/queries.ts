import {SQLiteDatabase} from "expo-sqlite";
import {
    Account,
    Category, ChartPoints,
    FullTransaction,
    FullTransactionRaw,
    Transaction, TransactionsGroupedByCategory,
    TransactionsGroupedByDate
} from "@/lib/types/Transaction";

export function getAllAccounts(db: SQLiteDatabase): Account[] {
    // db.runSync(`UPDATE accounts SET balance = ? WHERE id = ? `, [500, 1]);
    // db.runSync(`INSERT INTO accounts (title, icon, balance, positive_state) VALUES ($title, $icon, $balance, $positive_status)`, { $title: 'Visa 1234', $icon: '💳', $balance: 43142.23, $positive_status: false })
    return db.getAllSync(`SELECT *
                          FROM accounts`);
}

export function getAllCategories(db: SQLiteDatabase): Category[] {
    return db.getAllSync(`SELECT *
                          FROM categories`);
}

export async function getTransactions(db: SQLiteDatabase): Promise<{amountsGroupedByDate: ChartPoints[], transactionsGroupedByCategory: TransactionsGroupedByCategory[]}> {
    const amountsGroupedByDate = await db.getAllAsync(`
        SELECT strftime('%Y-%m-%d', date) AS date,
            ROUND(SUM(amount), 2) AS total
        FROM transactions
        GROUP BY date
    `);

    const transactionsGroupedByCategory = await db.getAllAsync(`
        SELECT c.title, c.icon, c.id,
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
        GROUP BY c.id
    `);


    return {
        amountsGroupedByDate,
        transactionsGroupedByCategory: transactionsGroupedByCategory.map((group: any) => ({
            category: {
                title: group.title,
                icon: group.icon,
                id: group.id,
            },
            transactions: JSON.parse(group.transactions)
        }))
    }
}

export async function getTransactionsGroupedAndFiltered(db: SQLiteDatabase, startDate: string, endDate: string, type: 'Spent' | 'Revenue' | 'Balance', accountId = 0): Promise<TransactionsGroupedByDate[]> {
    try {

        // const statement = await db.prepareAsync('INSERT INTO transactions (recurrentDate, date, amount, notes, account_id, category_id) VALUES ($recurrentDate, $date, $amount, $notes, $account_id, $category_id)');
        // await statement.executeAsync({ $recurrentDate: 'none', $date: '2024-07-30T10:00:00.000Z', $amount: 30.42, $notes: 'gaastos de algo 2', $account_id: 1, $category_id: 2})
        // await statement.executeAsync({ $recurrentDate: 'weekly', $date: '2024-07-31T10:00:00.000Z', $amount: 14, $notes: '', $account_id: 1, $category_id: 12})
        // await statement.executeAsync({ $recurrentDate: 'none', $date: '2024-08-01', $amount: 10.43, $notes: '', $account_id: 1, $category_id: 1})
        // await statement.executeAsync({ $recurrentDate: 'none', j$date: '2024-07-25T10:00:00.000Z', $amount: 20.12, $notes: '', $account_id: 1, $category_id: 13})
        // await statement.executeAsync({ $recurrentDate: 'none', $date: '2024-07-25T10:00:00.000Z', $amount: 10, $notes: '', $account_id: 1, $category_id: 9})
        // await statement.executeAsync({ $recurrentDate: 'monthly', $date: '2024-07-22T10:00:00.000Z', $amount: 420, $notes: 'Regalo de cumpleanos', $account_id: 1, $category_id: 2})
        // await statement.executeAsync({ $recurrentDate: 'none', $date: '2024-08-02T10:00:00.000Z', $amount: 6.50, $notes: 'Compras de bodega', $account_id: 1, $category_id: 1})

        let groups: { total: number, formatted_date: string }[] = [];

        if (accountId === 0) {
            groups = await db.getAllAsync(`
                SELECT strftime('%Y-%m-%d', t.date) AS formatted_date,
                       ROUND(SUM(t.amount), 2)      AS total,
                       c.type                       AS transaction_type,
                       t.account_id
                FROM transactions t
                         LEFT JOIN categories c ON t.category_id = c.id
                WHERE date BETWEEN ?
                  and ?
                  AND transaction_type = ?
                GROUP BY formatted_date
                ORDER BY date DESC;
            `, [startDate, endDate, type === 'Revenue' ? 'income' : 'expense']);
        } else {
            groups = await db.getAllAsync(`
                SELECT strftime('%Y-%m-%d', t.date) AS formatted_date,
                       ROUND(SUM(t.amount), 2)      AS total,
                       c.type                       AS transaction_type,
                       t.account_id
                FROM transactions t
                         LEFT JOIN categories c ON t.category_id = c.id
                WHERE date BETWEEN ?
                  and ?
                  AND transaction_type = ?
                  AND t.account_id = ?
                GROUP BY formatted_date
                ORDER BY date DESC;
            `, [startDate, endDate, type === 'Revenue' ? 'income' : 'expense', accountId]);
        }


        const transactions: FullTransactionRaw[] = await db.getAllAsync(`
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
            WHERE t.date BETWEEN ?
              and ?
              AND c.type = ?
        `, [startDate, endDate, type === 'Revenue' ? 'income' : 'expense', accountId]);

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
                positive_status: t.account_positive_status,
            }
        }));

        return groups.map((g, i) => ({
            id: i + 1,
            date: g.formatted_date,
            total: g.total,
            items: formattedTransactions.filter(t => t.date === g.formatted_date),
        }))
    } catch (err) {
        console.error(err);
        return [];
    }
}

export async function createAccount(db: SQLiteDatabase, account: {
    title: string,
    icon: string,
    balance: number,
    positiveState: boolean
}): Promise<any> {
    const accounts = await db.getAllAsync('SELECT * FROM accounts WHERE title = ?', [account.title]);
    if (accounts.length > 0) {
        return {
            error: true,
            desc: 'Ya existe una cuenta con ese nombre.',
        };
    } else {
        const statement = await db.prepareAsync('INSERT INTO accounts (title, icon, balance, positive_state) VALUES ($title, $icon, $balance, $positive_state)');
        try {
            await statement.executeAsync({
                $title: account.title,
                $icon: account.icon,
                $balance: account.balance,
                $positive_state: account.positiveState
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

export async function deleteTransaction(db: SQLiteDatabase, transactionId: number) {
    try {
        return await db.runAsync('DELETE FROM transactions WHERE id = $transactionId', {$transactionId: transactionId})
    } catch (err) {
        console.error(err);
    }
}

export async function createTransaction(db: SQLiteDatabase, transaction: Transaction): Promise<FullTransaction | {}> {
    const statement = await db.prepareAsync(`INSERT INTO transactions (amount, recurrentDate, date, notes, account_id, category_id)
                                             VALUES ($amount, $recurrentDate, $date, $notes, $account_id,
                                                     $category_id)`)
    try {
        const t = await statement.executeAsync({
            $amount: Number(transaction.amount),
            $recurrentDate: transaction.recurrentDate,
            $date: transaction.date,
            $notes: transaction.notes,
            $account_id: transaction.account_id,
            $category_id: transaction.category_id
        });
        const categoryType: string | null = await db.getFirstAsync('SELECT type FROM categories WHERE id = ?', [transaction.category_id]);
        const balanceInAccount: number | null = await db.getFirstAsync('SELECT balance FROM accounts WHERE id = ?', [transaction.account_id]);
        await db.runAsync('UPDATE accounts SET balance = ? WHERE id = ?', [categoryType === 'expense' ? balanceInAccount! - Number(transaction.amount) : balanceInAccount! + Number(transaction.amount)])
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
                positive_status: retrievedTransaction.account_positive_status
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
        const t = await statement.executeAsync([Number(transaction.amount), transaction.recurrentDate, transaction.date, transaction.notes, transaction.account_id, transaction.category_id, transaction.id]);
        const categoryType: string | null = await db.getFirstAsync('SELECT type FROM categories WHERE id = ?', [transaction.category_id]);
        const balanceInAccount: number | null = await db.getFirstAsync('SELECT balance FROM accounts WHERE id = ?', [transaction.account_id]);
        await db.runAsync('UPDATE accounts SET balance = ? WHERE id = ?', [categoryType === 'expense' ? balanceInAccount! - Number(transaction.amount) : balanceInAccount! + Number(transaction.amount)])
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
                positive_status: retrievedTransaction.account_positive_status
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
                positive_status: retrievedTransaction.account_positive_status
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
