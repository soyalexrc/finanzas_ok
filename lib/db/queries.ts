import {SQLiteDatabase} from "expo-sqlite";
import {
    Account,
    AccountCreate,
    AccountEdit,
    Category,
    CategoryCreate,
    ChartPoints,
    FullTransaction,
    FullTransactionRaw,
    Transaction,
    TransactionsGroupedByCategory,
    TransactionsGroupedByDate
} from "@/lib/types/Transaction";
import {migrateDbIfNeeded} from "@/lib/db/migrations";
import {getCustomMonthRangeWithYear} from "@/lib/helpers/date";
import {calculatePercentageOfTotal} from "@/lib/helpers/operations";
import {
    chineseCategories,
    englishCategories, frenchCategories,
    germanCategories,
    japaneseCategories,
    spanishCategories
} from "@/lib/utils/data/categories";
import { getLocales } from 'expo-localization'

export function getAllAccounts(db: SQLiteDatabase): Account[] {
    // db.runSync(`UPDATE accounts SET balance = ? WHERE id = ? `, [500, 1]);
    // db.runSync(`INSERT INTO accounts (title, icon, balance, positive_state) VALUES ($title, $icon, $balance, $positive_status)`, { $title: 'Visa 1234', $icon: '💳', $balance: 43142.23, $positive_status: false })
    return db.getAllSync(`SELECT *
                          FROM accounts ORDER BY title`);
}

export function getAllCards(db: SQLiteDatabase): any[] {
    // db.runSync(`UPDATE accounts SET balance = ? WHERE id = ? `, [500, 1]);
    // db.runSync(`INSERT INTO accounts (title, icon, balance, positive_state) VALUES ($title, $icon, $balance, $positive_status)`, { $title: 'Visa 1234', $icon: '💳', $balance: 43142.23, $positive_status: false })
    return db.getAllSync(`SELECT *
                          FROM cards ORDER BY type`);
}

export function getSettingsRaw(db: SQLiteDatabase): {key: string, value: string}[] {
    return  db.getAllSync(`SELECT * FROM settings`);
}


export function getSettings(db: SQLiteDatabase): {[key: string]: string} {
    const data =  db.getAllSync(`SELECT * FROM settings`);

    const settingsObject: { [key: string]: string } = {};
    data.forEach((row: any) => {
        settingsObject[row.key] = row.value;
    });
    return settingsObject
}

export function updateSettingByKey(db: SQLiteDatabase, key: string, value: string): boolean{
    try {
        const row = db.getFirstSync('SELECT key FROM settings WHERE key = ?', [key]);;
        if (!row) {
            db.runSync('INSERT INTO settings (key, value) VALUES ($key, $value)', {$key: key, $value: value});
            return true;
        } else {
            db.runSync(`UPDATE settings  SET value = ? WHERE key = ?`, [value, key]);
            return true
        }
    } catch (err) {
        console.error(err);
        return false
    }
}

export function insertMultipleCategories(db: SQLiteDatabase): void {
    const locales = getLocales();
    let categories: Category[] = [];
    if (locales[0].languageCode === 'es') {
        categories = spanishCategories
    } else if (locales[0].languageCode === 'en') {
        categories = englishCategories
    }
    else if (locales[0].languageCode === 'de') {
        categories = germanCategories
    }
    else if (locales[0].languageCode === 'ja') {
        categories = japaneseCategories
    }
    else if (locales[0].languageCode === 'zh') {
        categories = chineseCategories
    }
    else if (locales[0].languageCode === 'fr') {
        categories = frenchCategories
    }

    let filteredCategories = [...categories];

    const currentCategories = db.getAllSync(`SELECT * FROM categories`);

    if (currentCategories.length > 0) {
        filteredCategories = categories.filter(category => !currentCategories.some((c: any) => c.title === category.title));
    }

    try {
        for (const category of filteredCategories) {
            const statement = db.prepareSync(`INSERT INTO categories (title, icon, type) VALUES ($title, $icon, $type)`)
            statement.executeSync({ $title: category.title, $icon: category.icon, $type: category.type })
        }
    } catch (err) {
        console.error(err);
    }
}

export function deleteSettingByKey(db: SQLiteDatabase, key: string): boolean{
    try {
        const row = db.getFirstSync('SELECT key FROM settings WHERE key = ?', [key]);;
        if (!row) {
            return false;
        } else {
            db.runSync(`DELETE FROM settings WHERE key = ?`, [key]);
            return true
        }
    } catch (err) {
        console.error(err);
        return false
    }
}

export function getSettingByKey(db: SQLiteDatabase, key: string): {value: string} | null {
    // db.runSync(`UPDATE accounts SET balance = ? WHERE id = ? `, [500, 1]);
    // db.runSync(`INSERT INTO accounts (title, icon, balance, positive_state) VALUES ($title, $icon, $balance, $positive_status)`, { $title: 'Visa 1234', $icon: '💳', $balance: 43142.23, $positive_status: false })
    return db.getFirstSync(`SELECT value FROM settings WHERE key = ? `, [key]);
}

export function getAllCategories(db: SQLiteDatabase): Category[] {
    return db.getAllSync(`SELECT *
                          FROM categories ORDER BY title`);
}

export async function wipeData(db: SQLiteDatabase): Promise<void> {
    try {
        // await db.runAsync('DELETE FROM accounts')
        // await db.runAsync('DELETE FROM migrations')
        // await db.runAsync('DELETE FROM transactions')
        // await db.runAsync('DELETE FROM categories')
        //
        // await db.runAsync('DROP TABLE migrations')
        // await db.runAsync('DROP TABLE accounts')
        // await db.runAsync('DROP TABLE categories')
        // await db.runAsync('DROP TABLE transactions')

        await db.runAsync(`DROP TRIGGER IF EXISTS delete_account_balance`)
        await db.runAsync(`DROP TRIGGER IF EXISTS insert_account_balance`)

        await db.runAsync('DROP TABLE migrations')
        await db.runAsync('DROP TABLE accounts')
        await db.runAsync('DROP TABLE categories')
        await db.runAsync('DROP TABLE transactions')
        await db.runAsync('DROP TABLE cards')

        await migrateDbIfNeeded(db)
    } catch (e) {
        console.error(e)
    }
}

export async function importSheetToDB(db: SQLiteDatabase, transactions: Transaction[], accounts: Account[], categories: Category[], settings: {key: string, value: string}[], cards: any[]) {
    try {
        // insert transaction, account, category and setting into Sqlite db
        for (const account of accounts) {
            await createAccount(db, account);
        }

        for (const category of categories) {
            await createCategory(db, category);
        }

        for (const transaction of transactions) {
            createTransactionV2(db, transaction);
        }

        for (const setting of settings) {
            updateSettingByKey(db, setting.key, setting.value);
        }

    } catch (error) {
        console.log(error);
    }
}

export async function getAllTransactions(db: SQLiteDatabase) {
    return await db.getAllAsync('SELECT * FROM transactions');
}

export async function getTransactionsV2(db: SQLiteDatabase, dateFrom: string, dateTo: string): Promise<{
    amountsGroupedByDate: ChartPoints[],
    transactionsGroupedByCategory: TransactionsGroupedByCategory[]
}>  {
    let amountsGroupedByDate: ChartPoints[] = [];
    let transactionsGroupedByCategory: TransactionsGroupedByCategory[] = [];

    amountsGroupedByDate = await db.getAllAsync(`
            SELECT strftime('%Y-%m-%d', date) AS date,
            ROUND(SUM(amount), 2) AS total,
            ROUND(SUM(hidden_amount), 2) AS total_hidden,
            ROUND(SUM(CASE WHEN category_type = 'income' THEN amount ELSE 0 END), 2) AS total_income,
            ROUND(SUM(CASE WHEN category_type = 'expense' THEN amount ELSE 0 END), 2) AS total_expense,
            ROUND(SUM(CASE WHEN category_type = 'income' THEN hidden_amount ELSE 0 END), 2) AS total_income_hidden,
            ROUND(SUM(CASE WHEN category_type = 'expense' THEN hidden_amount ELSE 0 END), 2) AS total_expense_hidden,
            category_type,
            category_icon,
            currency_symbol_t,
            currency_code_t
            FROM transactions t
            WHERE
                date BETWEEN ?
              and ?
            GROUP BY date
        `, [dateFrom, dateTo]);


    transactionsGroupedByCategory = await db.getAllAsync(`
            SELECT category,
                   category_icon,
                   category_type,
                    currency_symbol_t,
                    currency_code_t,
                   json_group_array(json_object(
                           'id', t.id,
                           'amount', t.amount,
                           'hidden_amount', t.hidden_amount,
                           'recurrentDate', t.recurrentDate,
                           'date', t.date,
                           'notes', t.notes,
                           'account', t.account,
                           'category', t.category
                                    )) AS transactions
            FROM transactions t
            WHERE
                date BETWEEN ?
              and ?
            GROUP BY category
        `, [dateFrom, dateTo]);


    return {
        amountsGroupedByDate,
        transactionsGroupedByCategory: transactionsGroupedByCategory.map((group: any) => ({
            category: {
                title: group.category,
                icon: group.category_icon,
                id: 0,
                type: group.category_type,
            },
            account: {
                id: 0,
                title: group.account,
                currency_code: group.currency_code_t,
                currency_symbol: group.currency_symbol_t,
            },
            transactions: JSON.parse(group.transactions)?.map((t: any) => ({
                ...t,
                account_symbol: group.currency_symbol_t
            }))
        }))
    };
}

export async function getTransactions(db: SQLiteDatabase, dateFrom: string, dateTo: string, accountId: number, categoryId: number): Promise<{
    amountsGroupedByDate: ChartPoints[],
    transactionsGroupedByCategory: TransactionsGroupedByCategory[]
}> {
    let amountsGroupedByDate: ChartPoints[] = [];
    let transactionsGroupedByCategory: TransactionsGroupedByCategory[] = [];

    if (accountId === 0 && categoryId === 0) {
        amountsGroupedByDate = await db.getAllAsync(`
            SELECT strftime('%Y-%m-%d', date) AS date,
            ROUND(SUM(amount), 2) AS total,
            ROUND(SUM(hidden_amount), 2) AS total_hidden,
            ROUND(SUM(CASE WHEN c.type = 'income' THEN amount ELSE 0 END), 2) AS total_income,
            ROUND(SUM(CASE WHEN c.type = 'expense' THEN amount ELSE 0 END), 2) AS total_expense,
            ROUND(SUM(CASE WHEN c.type = 'income' THEN hidden_amount ELSE 0 END), 2) AS total_income_hidden,
            ROUND(SUM(CASE WHEN c.type = 'expense' THEN hidden_amount ELSE 0 END), 2) AS total_expense_hidden
            FROM transactions t
                LEFT JOIN categories c ON t.category_id = c.id
            WHERE
                date BETWEEN ?
              and ?
            GROUP BY date
        `, [dateFrom, dateTo]);

        transactionsGroupedByCategory = await db.getAllAsync(`
            SELECT c.title,
                   c.icon,
                   c.id,
                   c.type,
                   a.id                AS account_id,
                   a.title             AS account_id,
                   a.type             AS account_type,
                   a.currency_symbol   AS currency_symbol,
                   json_group_array(json_object(
                           'id', t.id,
                           'amount', t.amount,
                           'hidden_amount', t.hidden_amount,
                           'is_hidden_transaction', t.is_hidden_transaction,
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
            ROUND(SUM(amount), 2) AS total,
            ROUND(SUM(hidden_amount), 2) AS total_hidden,
            ROUND(SUM(CASE WHEN c.type = 'income' THEN amount ELSE 0 END), 2) AS total_income,
            ROUND(SUM(CASE WHEN c.type = 'expense' THEN amount ELSE 0 END), 2) AS total_expense,
            ROUND(SUM(CASE WHEN c.type = 'income' THEN hidden_amount ELSE 0 END), 2) AS total_income_hidden,
            ROUND(SUM(CASE WHEN c.type = 'expense' THEN hidden_amount ELSE 0 END), 2) AS total_expense_hidden
            FROM transactions t
                LEFT JOIN categories c ON t.category_id = c.id
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
                   c.type,
                   a.id                AS account_id,
                   a.title             AS account_id,
                   a.currency_symbol   AS currency_symbol,
                   a.currency_code     AS currency_code,
                   json_group_array(json_object(
                           'id', t.id,
                           'amount', t.amount,
                           'hidden_amount', t.hidden_amount,
                           'is_hidden_transaction', t.is_hidden_transaction,
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
            ROUND(SUM(amount), 2) AS total,
            ROUND(SUM(hidden_amount), 2) AS total_hidden,
            ROUND(SUM(CASE WHEN c.type = 'income' THEN amount ELSE 0 END), 2) AS total_income,
            ROUND(SUM(CASE WHEN c.type = 'expense' THEN amount ELSE 0 END), 2) AS total_expense,
            ROUND(SUM(CASE WHEN c.type = 'income' THEN hidden_amount ELSE 0 END), 2) AS total_income_hidden,
            ROUND(SUM(CASE WHEN c.type = 'expense' THEN hidden_amount ELSE 0 END), 2) AS total_expense_hidden
            FROM transactions t
                LEFT JOIN categories c ON t.category_id = c.id
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
                   c.type,
                   a.id                AS account_id,
                   a.title             AS account_id,
                   a.currency_symbol   AS currency_symbol,
                   a.currency_code     AS currency_code,
                   json_group_array(json_object(
                           'id', t.id,
                           'amount', t.amount,
                           'recurrentDate', t.recurrentDate,
                           'date', t.date,
                           'hidden_amount', t.hidden_amount,
                           'is_hidden_transaction', t.is_hidden_transaction,
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
            ROUND(SUM(amount), 2) AS total,
            ROUND(SUM(hidden_amount), 2) AS total_hidden,
            ROUND(SUM(CASE WHEN c.type = 'income' THEN amount ELSE 0 END), 2) AS total_income,
            ROUND(SUM(CASE WHEN c.type = 'expense' THEN amount ELSE 0 END), 2) AS total_expense,
            ROUND(SUM(CASE WHEN c.type = 'income' THEN hidden_amount ELSE 0 END), 2) AS total_income_hidden,
            ROUND(SUM(CASE WHEN c.type = 'expense' THEN hidden_amount ELSE 0 END), 2) AS total_expense_hidden
            FROM transactions t
                LEFT JOIN categories c ON t.category_id = c.id
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
                   c.type,
                   a.id                AS account_id,
                   a.title             AS account_id,
                   a.currency_symbol   AS currency_symbol,
                   a.currency_code     AS currency_code,
                   json_group_array(json_object(
                           'id', t.id,
                           'amount', t.amount,
                           'recurrentDate', t.recurrentDate,
                           'date', t.date,
                           'hidden_amount', t.hidden_amount,
                           'is_hidden_transaction', t.is_hidden_transaction,
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
                type: group.type,
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

export async function getTransactionsGroupedAndFilteredV2(db: SQLiteDatabase, startDate: string, endDate: string, type: 'Spent' | 'Revenue'): Promise<any[]> {
    try {
        let groups: GroupRaw[] = [];
        let transactions: FullTransactionRaw[] = [];

        groups = await db.getAllAsync(`
                SELECT strftime('%Y-%m-%d', t.date) AS formatted_date,
                       ROUND(SUM(t.amount), 2)      AS total,
                       ROUND(SUM(t.hidden_amount), 2)      AS total_hidden,
                       t.category_type,
                       t.account,
                       t.currency_symbol_t            AS currency_symbol
                FROM transactions t
                WHERE date BETWEEN ?
                  and ?
                  AND category_type = ?
                GROUP BY formatted_date, currency_symbol
                ORDER BY date DESC;
            `, [startDate, endDate, type === 'Revenue' ? 'income' : 'expense']);


        transactions = await db.getAllAsync(`
                SELECT t.id,
                       t.amount,
                       t.hidden_amount,
                       t.recurrentDate,
                       strftime('%Y-%m-%d', t.date) AS date,
            t.notes,
            t.category AS category_title,
            t.category_icon,
            t.category_type,
            t.account AS account_title,
            t.currency_code_t AS account_currency_code,
            t.currency_symbol_t AS account_currency_symbol
                FROM transactions t
                WHERE t.date BETWEEN ?
                  and ?
                  AND t.category_type = ?
            `, [startDate, endDate, type === 'Revenue' ? 'income' : 'expense']);

        const formattedTransactions = transactions.map(t => ({
            id: t.id,
            date: t.date,
            notes: t.notes,
            amount: String(t.amount),
            hidden_amount: String(t.hidden_amount),
            recurrentDate: t.recurrentDate,
            category: {
                icon: t.category_icon,
                title: t.category_title,
                type: t.category_type
            },
            account: {
                icon: t.account_icon,
                title: t.account_title,
                currency_code: t.account_currency_code,
                currency_symbol: t.account_currency_symbol,
            }
        }));



        const groupedData = groups.reduce((acc: any[], curr: any) => {
            const dateGroup = acc.find(group => group.formatted_date === curr.formatted_date);
            const totalObj = {amount: curr.total, symbol: curr.currency_symbol, hidden_amount: curr.total_hidden};

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

        // console.log('groupedData', JSON.stringify(groupedData, null, 2));

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


export async function getTransactionsGroupedAndFiltered(db: SQLiteDatabase, startDate: string, endDate: string, type: 'Spent' | 'Revenue' | 'Balance', accountId = 0): Promise<TransactionsGroupedByDate[]> {
    try {
        let groups: GroupRaw[] = [];
        let transactions: FullTransactionRaw[] = [];

        if (accountId === 0) {
            groups = await db.getAllAsync(`
                SELECT strftime('%Y-%m-%d', t.date) AS formatted_date,
                       ROUND(SUM(t.amount), 2)      AS total,
                       ROUND(SUM(t.hidden_amount), 2)      AS total_hidden,
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
                       t.hidden_amount,
                       t.is_hidden_transaction,
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
                SELECT strftime('%Y-%m-%d', t.date)   AS formatted_date,
                       ROUND(SUM(t.amount), 2)        AS total,
                       ROUND(SUM(t.hidden_amount), 2) AS total_hidden,
                       c.type                         AS transaction_type,
                       t.account_id,
                       a.currency_symbol              AS currency_symbol
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
                       t.is_hidden_transaction,
                       t.hidden_amount,
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
            hidden_amount: String(t.hidden_amount),
            is_hidden_transaction: t.is_hidden_transaction,
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
            const totalObj = {amount: curr.total, symbol: curr.currency_symbol, hidden_amount: curr.total_hidden};

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

export function createTransactionV2(db: SQLiteDatabase, transaction: Transaction): FullTransactionRaw | {} {
    try {
        const data = db.runSync(`INSERT INTO transactions (amount, recurrentDate, date, notes, account, category, category_icon, category_type, hidden_amount, dateTime, currency_symbol_t, currency_code_t) VALUES ($amount, $recurrentDate, $date, $notes, $account, $category, $category_icon, $category_type, $hidden_amount, $dateTime, $currency_symbol_t, $currency_code_t)`, {
            $amount: Number(transaction.amount),
            $recurrentDate: transaction.recurrentDate,
            $date: transaction.date,
            $notes: transaction.notes,
            $account: transaction.account ?? '',
            $category: transaction.category,
            $category_icon: transaction.category_icon,
            $category_type: transaction.category_type,
            $hidden_amount: Number(transaction.hidden_amount),
            $dateTime: transaction.dateTime,
            $currency_symbol_t: transaction.currency_symbol_t,
            $currency_code_t: transaction.currency_code_t
        });

        return {};
    } catch (err) {
        console.error(err);
        return {};
    }
}
export async function createTransaction(db: SQLiteDatabase, transaction: Transaction): Promise<FullTransaction | {}> {
    const statement = await db.prepareAsync(`INSERT INTO transactions (amount, recurrentDate, date, notes, account_id, category_id, is_hidden_transaction, hidden_amount)
                                             VALUES ($amount, $recurrentDate, $date, $notes, $account_id, $category_id, $is_hidden_transaction, $hidden_amount)`);
    try {
        const t = await statement.executeAsync({
            $amount: Number(transaction.amount),
            $recurrentDate: transaction.recurrentDate,
            $date: transaction.date,
            $notes: transaction.notes,
            $account_id: 0,
            $category_id: 0,
            $is_hidden_transaction: 0,
            $hidden_amount: transaction.hidden_amount,
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
                   t.is_hidden_transaction,
                   t.hidden_amount,
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
            recurrentDate: retrievedTransaction.recurrentDate,
            hidden_amount: retrievedTransaction.hidden_amount,
            is_hidden_transaction: retrievedTransaction.is_hidden_transaction
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



        // Removemos el anterior valor de la transaccion en el balance
        // await db.runAsync('UPDATE accounts SET balance = ? WHERE id = ?', [categoryType?.type === 'expense' ? balanceInAccount!.balance + oldTransaction?.amount! : balanceInAccount!.balance - oldTransaction?.amount!, transaction.account_id])


        // const newBalanceBasedOnOldAmountAndNewAmount: number = 10;


        // Actualizamos el nuevo valor de la transaccion en el balance
        // if (oldTransaction?.amount !== Number(transaction.amount) || oldCategoryType?.type !== categoryType?.type) {
        //     await db.runAsync('UPDATE accounts SET balance = ? WHERE id = ?', [balanceWithNewTransaction, transaction.account_id]);
        //     await db.runAsync('UPDATE accounts SET positive_state = ? WHERE id = ?', [balanceWithNewTransaction < 0 ? 0 : 1, transaction.account_id])
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
                   t.hidden_amount,
                   t.is_hidden_transaction,
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
            hidden_amount: String(retrievedTransaction.amount),
            is_hidden_transaction: retrievedTransaction.is_hidden_transaction,
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

export function getAmountOfTransactionsByAccountId(db: SQLiteDatabase, accountName: string): number {
    const result: {
        count: number
    } | null = db.getFirstSync('SELECT COUNT(*) AS count FROM transactions WHERE account = ?', [accountName]);
    return result?.count ?? 0;
}

export function getAmountOfTransactionsByCategoryId(db: SQLiteDatabase, categoryId: number): number {
    const result: {
        count: number
    } | null = db.getFirstSync('SELECT COUNT(*) AS count FROM transactions WHERE category_id = ?', [categoryId]);
    return result?.count ?? 0;
}

export function getAmountOfTransactionsByCategoryTitle(db: SQLiteDatabase, categoryTitle: string): number {
    const result: {
        count: number
    } | null = db.getFirstSync('SELECT COUNT(*) AS count FROM transactions WHERE category = ?', [categoryTitle]);
    return result?.count ?? 0;
}

export function getTotalSpentByYear(db: SQLiteDatabase, year: number): { symbol: string, amount: number }[] {
    const { start, end } = getCustomMonthRangeWithYear(1, 12, year);
    return db.getAllSync('SELECT ROUND(SUM(amount), 2) AS amount, currency_symbol_t AS symbol FROM transactions WHERE date BETWEEN ? AND ? AND category_type = ? GROUP BY symbol ORDER BY amount DESC', [start.toISOString(), end.toISOString(), 'expense']);
}


export function getTotalIncomeByYear(db: SQLiteDatabase, year: number): { symbol: string, amount: number }[] {
    const { start, end } = getCustomMonthRangeWithYear(1, 12, year);
    return db.getAllSync('SELECT ROUND(SUM(amount), 2) AS amount, currency_symbol_t AS symbol FROM transactions WHERE date BETWEEN ? AND ? AND category_type = ? GROUP BY symbol ORDER BY amount DESC', [start.toISOString(), end.toISOString(), 'income']);
}

export function getTotalsOnEveryMonthByYear(db: SQLiteDatabase, year: number, type: 'income' | 'expense', limit: number): { month: string, percentage: number, monthNumber: number }[] {
    const janDateFilter = getCustomMonthRangeWithYear(1, 1, year);
    const febDateFilter = getCustomMonthRangeWithYear(2, 2, year);
    const marDateFilter = getCustomMonthRangeWithYear(3, 3, year);
    const aprDateFilter = getCustomMonthRangeWithYear(4, 4, year);
    const mayDateFilter = getCustomMonthRangeWithYear(5, 5, year);
    const junDateFilter = getCustomMonthRangeWithYear(6, 6, year);
    const julDateFilter = getCustomMonthRangeWithYear(7, 7, year);
    const augDateFilter = getCustomMonthRangeWithYear(8, 8, year);
    const sepDateFilter = getCustomMonthRangeWithYear(9, 9, year);
    const octDateFilter = getCustomMonthRangeWithYear(10, 10, year);
    const novDateFilter = getCustomMonthRangeWithYear(11, 11, year);
    const decDateFilter = getCustomMonthRangeWithYear(12, 12, year);

    const jan: any = db.getAllSync(`
        SELECT ROUND(SUM(amount), 2) AS total, currency_symbol_t  AS currency FROM transactions WHERE date BETWEEN ? AND ? AND category_type = ? GROUP BY currency ORDER BY total DESC LIMIT 1 
    `, [janDateFilter.start.toISOString(), janDateFilter.end.toISOString(), type]);

    // Do the same for feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec

    const feb: any = db.getAllSync(`
        SELECT ROUND(SUM(amount), 2) AS total, currency_symbol_t AS currency FROM transactions WHERE date BETWEEN ? AND ? AND category_type = ? GROUP BY currency ORDER BY total DESC LIMIT 1 
    `, [febDateFilter.start.toISOString(), febDateFilter.end.toISOString(), type]);

    const mar: any = db.getAllSync(`
        SELECT ROUND(SUM(amount), 2) AS total, currency_symbol_t AS currency FROM transactions WHERE date BETWEEN ? AND ? AND category_type = ? GROUP BY currency ORDER BY total DESC LIMIT 1 
    `, [marDateFilter.start.toISOString(), marDateFilter.end.toISOString(), type]);

    const apr: any = db.getAllSync(`
        SELECT ROUND(SUM(amount), 2) AS total, currency_symbol_t AS currency FROM transactions WHERE date BETWEEN ? AND ? AND category_type = ? GROUP BY currency ORDER BY total DESC LIMIT 1 
    `, [aprDateFilter.start.toISOString(), aprDateFilter.end.toISOString(), type]);

    const may: any = db.getAllSync(`
        SELECT ROUND(SUM(amount), 2) AS total, currency_symbol_t AS currency FROM transactions WHERE date BETWEEN ? AND ? AND category_type = ? GROUP BY currency ORDER BY total DESC LIMIT 1 
    `, [mayDateFilter.start.toISOString(), mayDateFilter.end.toISOString(), type]);

    const jun: any = db.getAllSync(`
        SELECT ROUND(SUM(amount), 2) AS total, currency_symbol_t AS currency FROM transactions WHERE date BETWEEN ? AND ? AND category_type = ? GROUP BY currency ORDER BY total DESC LIMIT 1 
    `, [junDateFilter.start.toISOString(), junDateFilter.end.toISOString(), type]);

    const jul: any = db.getAllSync(`
        SELECT ROUND(SUM(amount), 2) AS total, currency_symbol_t AS currency FROM transactions WHERE date BETWEEN ? AND ? AND category_type = ? GROUP BY currency ORDER BY total DESC LIMIT 1 
    `, [julDateFilter.start.toISOString(), julDateFilter.end.toISOString(), type]);

    const aug: any = db.getAllSync(`
        SELECT ROUND(SUM(amount), 2) AS total, currency_symbol_t AS currency FROM transactions WHERE date BETWEEN ? AND ? AND category_type = ? GROUP BY currency ORDER BY total DESC LIMIT 1 
    `, [augDateFilter.start.toISOString(), augDateFilter.end.toISOString(), type]);

    const sep: any = db.getAllSync(`
        SELECT ROUND(SUM(amount), 2) AS total, currency_symbol_t AS currency FROM transactions WHERE date BETWEEN ? AND ? AND category_type = ? GROUP BY currency ORDER BY total DESC LIMIT 1 
    `, [sepDateFilter.start.toISOString(), sepDateFilter.end.toISOString(), type]);

    const oct: any = db.getAllSync(`
        SELECT ROUND(SUM(amount), 2) AS total, currency_symbol_t AS currency FROM transactions WHERE date BETWEEN ? AND ? AND category_type = ? GROUP BY currency ORDER BY total DESC LIMIT 1 
    `, [octDateFilter.start.toISOString(), octDateFilter.end.toISOString(), type]);

    const nov: any = db.getAllSync(`
        SELECT ROUND(SUM(amount), 2) AS total, currency_symbol_t AS currency FROM transactions WHERE date BETWEEN ? AND ? AND category_type = ? GROUP BY currency ORDER BY total DESC LIMIT 1 
    `, [novDateFilter.start.toISOString(), novDateFilter.end.toISOString(), type])

    const dec: any = db.getAllSync(`
        SELECT ROUND(SUM(amount), 2) AS total, currency_symbol_t AS currency FROM transactions WHERE date BETWEEN ? AND ? AND category_type = ? GROUP BY currency ORDER BY total DESC LIMIT 1 
    `, [decDateFilter.start.toISOString(), decDateFilter.end.toISOString(), type]);

    // const highestValue = Math.max(jan[0]?.total || 0, feb[0]?.total || 0, mar[0]?.total || 0, apr[0]?.total || 0, may[0]?.total || 0, jun[0]?.total || 0, jul[0]?.total || 0, aug[0]?.total || 0, sep[0]?.total || 0, oct[0]?.total || 0, nov[0]?.total || 0, dec[0]?.total || 0) * 1.2;
    // updateSettingByKey(db, 'filter_limit', String(highestValue));

    return [
        { month: 'JAN', percentage: calculatePercentageOfTotal(jan[0]?.total, limit), monthNumber: 1 },
        { month: 'FEB', percentage: calculatePercentageOfTotal(feb[0]?.total, limit), monthNumber: 2 },
        { month: 'MAR', percentage: calculatePercentageOfTotal(mar[0]?.total, limit), monthNumber: 3 },
        { month: 'APR', percentage: calculatePercentageOfTotal(apr[0]?.total, limit), monthNumber: 4 },
        { month: 'MAY', percentage: calculatePercentageOfTotal(may[0]?.total, limit), monthNumber: 5 },
        { month: 'JUN', percentage: calculatePercentageOfTotal(jun[0]?.total, limit), monthNumber: 6 },
        { month: 'JUL', percentage: calculatePercentageOfTotal(jul[0]?.total, limit), monthNumber: 7 },
        { month: 'AUG', percentage: calculatePercentageOfTotal(aug[0]?.total, limit), monthNumber: 8 },
        { month: 'SEP', percentage: calculatePercentageOfTotal(sep[0]?.total, limit), monthNumber: 9 },
        { month: 'OCT', percentage: calculatePercentageOfTotal(oct[0]?.total, limit), monthNumber: 10 },
        { month: 'NOV', percentage: calculatePercentageOfTotal(nov[0]?.total, limit), monthNumber: 11 },
        { month: 'DIC', percentage: calculatePercentageOfTotal(dec[0]?.total, limit), monthNumber: 12 },
    ];
}

export function searchTransactions(db: SQLiteDatabase, query: string, type: 'all' | 'expense' | 'income'): Transaction[] {
    let transactions: Transaction[] = [];

    if (query === '') {
        return [];
    }

    if (type === 'all') {
        transactions= db.getAllSync(`
        SELECT id,
               amount,
               recurrentDate,
               strftime('%Y-%m-%d', date) AS date,
               category,
               category_icon,
               category_type,
               account,
               notes,
                currency_code_t,
                currency_symbol_t,
                hidden_amount
        FROM transactions 
        WHERE notes LIKE ? OR category LIKE ?
    `, [`%${query}%`, `%${query}%`]);
    }

    if (type !== 'all') {
        transactions = db.getAllSync(`
        SELECT id,
               amount,
               recurrentDate,
               strftime('%Y-%m-%d', date) AS date,
               category,
               category_icon,
               category_type,
               account,
               notes,
                currency_code_t,
                currency_symbol_t,
                hidden_amount
        FROM transactions
        WHERE (notes LIKE ? OR category LIKE ?) AND category_type = ?
        `, [`%${query}%`, `%${query}%`, type]);
    }



    return transactions;
}

export async function deleteAccount(db: SQLiteDatabase, accountId: number) {
    // await db.runAsync('DELETE FROM transactions WHERE account_id = ? ', [accountId]);
    await db.runAsync('DELETE FROM accounts WHERE id = ?', [accountId]);
}

export async function deleteCategory(db: SQLiteDatabase, categoryId: number) {
    // await db.runAsync('DELETE FROM transactions WHERE category_id = ? ', [categoryId]);
    await db.runAsync('DELETE FROM categories WHERE id = ?', [categoryId]);
}
