import {SQLiteDatabase} from "expo-sqlite";
import {insertMultipleCategories} from "@/lib/db/queries";
import {getLocales} from "expo-localization";
import {Category} from "@/lib/types/Transaction";
import {
    chineseCategories,
    englishCategories, frenchCategories,
    germanCategories,
    japaneseCategories,
    spanishCategories
} from "@/lib/utils/data/categories";

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
    console.log('migrations called');

    // Clear table

    // await db.runAsync(`DROP TRIGGER IF EXISTS delete_account_balance`)
    // await db.runAsync(`DROP TRIGGER IF EXISTS insert_account_balance`)
    // await db.runAsync('DELETE FROM accounts')
    // await db.runAsync('DELETE FROM migrations')
    // await db.runAsync('DELETE FROM transactions')
    // await db.runAsync('DELETE FROM categories')

    // DROP table
    // await db.runAsync('DROP TABLE migrations')
    // await db.runAsync('DROP TABLE accounts')
    // await db.runAsync('DROP TABLE categories')
    // await db.runAsync('DROP TABLE transactions')
    // await db.runAsync('DROP TABLE cards')

    // Check if migrations table exists

    try {
        await db.execAsync(`
                PRAGMA journal_mode = 'wal';

                CREATE TABLE IF NOT EXISTS migrations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    version INTEGER NOT NULL,
                    name TEXT NOT NULL,
                    applied_at TEXT NOT NULL
                );
            `)

        // Get the latest applied migration version
        const result: any = await db.getFirstAsync(`SELECT MAX(version) as max_version FROM migrations`)
        let latestAppliedMigration = result.max_version ?? 0

        // Get the latest applied migration version
        for (const migration of migrations) {
            if (migration.version > latestAppliedMigration) {
                console.log('new migration ran')
                await migration.migrate(db);
                const statement = await db.prepareAsync(
                    `INSERT INTO migrations (version, name, applied_at) VALUES ($version, $name, $applied_at)`
                )
                await statement.executeAsync({ $version: migration.version, $name: migration.name, $applied_at: new Date().toISOString() });
                latestAppliedMigration = migration.version;
            }
        }

        // const r = await db.getAllAsync(`select * from sqlite_master where type = 'trigger'`)
        //
        // console.log('triggers', r);


        // const allMigrations = await db.getAllAsync('SELECT * FROM migrations')
        // console.log(allMigrations)

        // const allCategories = await db.getAllAsync('SELECT * FROM categories');
        // console.log(allCategories)

        // const allAccounts = await db.getAllAsync('SELECT * FROM accounts');
        // console.log(allAccounts)

        // const transactions = await db.getAllAsync('SELECT * FROM transactions');
        // console.log(transactions);

        const payments = await db.getAllAsync('SELECT * FROM payments');
        console.log(payments);

    } catch (err) {
        console.error('Ocurrio un error corriendo las migraciones... ', err)
    }
}

const migrations = [
    {
        version: 1,
        name: 'initial migration',
        migrate: async (db: SQLiteDatabase) => {
            try {
                await db.execAsync(`
                CREATE TABLE IF NOT EXISTS accounts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    icon TEXT NOT NULL,
                    currency_code string TEXT NOT NULL,
                    currency_symbol string TEXT NOT NULL,
                    balance INTEGER NOT NULL,
                    positive_state BOOLEAN DEFAULT TRUE
                )
            `);

                await db.execAsync(`
                CREATE TABLE IF NOT EXISTS categories (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    icon TEXT NOT NULL,
                    type TEXT NOT NULL
                )
            `);

                await db.execAsync(`
                    CREATE TABLE IF NOT EXISTS cards (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        type TEXT,
                        lastFour TEXT,
                        source TEXT NOT NULL,
                        bg TEXT NOT NULL,
                        creditLine INTEGER,
                        preferred_currency_code TEXT,
                        preferred_currency_symbol TEXT,
                        balance INTEGER
                    )
                `);

                await db.execAsync(`
                    CREATE TABLE IF NOT EXISTS payments (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title TEXT NOT NULL,
                        date TEXT NOT NULL,
                        message TEXT,
                        hidden_amount INTEGER DEFAULT 0,
                        amount INTEGER NOT NULL,
                        currency_symbol TEXT,
                        currency_code TEXT,
                        category_type TEXT NOT NULL,
                        category_icon TEXT NOT NULL,
                        category TEXT,
                        account TEXT,
                        status BOOLEAN DEFAULT TRUE
                    )
                `);

                await db.execAsync(`
                CREATE TABLE IF NOT EXISTS transactions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT NOT NULL,
                    recurrentDate TEXT,
                    amount INTEGER NOT NULL,
                    notes TEXT,
                    hidden_amount INTEGER DEFAULT 0,
                    dateTime DATETIME DEFAULT CURRENT_TIMESTAMP,
                    category TEXT,
                    account TEXT,
                    currency_symbol_t TEXT,
                    currency_code_t TEXT,
                    category_type TEXT NOT NULL,
                    category_icon TEXT NOT NULL
                )
            `);

                await db.execAsync(`
                CREATE TABLE IF NOT EXISTS settings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    key TEXT NOT NULL,
                    value INTEGER NOT NULL
                )
            `)

            //     create default categories
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

            } catch (err) {
                console.error('Ocurrio un error corriendo las migraciones... ', err)
            }
        }
    },
    // {
    //     version: 1.1,
    //     name: 'Triggers for deleting and inserting transactions update balance',
    //     migrate: async (db: SQLiteDatabase) => {
    //         await db.execAsync(`
    //             CREATE TRIGGER IF NOT EXISTS insert_account_balance
    //             AFTER INSERT
    //             ON transactions
    //             BEGIN
    //                 UPDATE accounts
    //                 SET balance = balance + CASE
    //                     WHEN (SELECT type FROM categories WHERE id = NEW.category_id) = 'income' THEN NEW.amount
    //                     ELSE -NEW.amount
    //                 END
    //
    //                 WHERE id = NEW.account_id;
    //
    //                 UPDATE accounts
    //                 SET positive_state = CASE
    //                     WHEN balance > 0 THEN 1
    //                     ELSE 0
    //                 END
    //
    //                 WHERE id = NEW.account_id;
    //             END;
    //
    //             CREATE TRIGGER IF NOT EXISTS delete_account_balance
    //             AFTER DELETE
    //             ON transactions
    //             BEGIN
    //                 UPDATE accounts
    //                 SET balance = balance + CASE
    //                     WHEN (SELECT type FROM categories WHERE id = OLD.category_id) = 'expense' THEN OLD.amount
    //                     ELSE -OLD.amount
    //                 END
    //                 WHERE id = OLD.account_id;
    //
    //                 UPDATE accounts
    //                 SET positive_state = CASE
    //                     WHEN balance > 0 THEN 1
    //                     ELSE 0
    //                 END
    //
    //                 WHERE id = OLD.account_id;
    //             END;
    //         `)
    //     }
    // },
];
