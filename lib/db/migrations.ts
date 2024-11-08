import {SQLiteDatabase} from "expo-sqlite";
import { englishCategories, spanishCategories } from '@/lib/utils/data/categories';
import {getLocales} from "expo-localization";

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
    console.log('migrations called');

    // Clear table

    // await db.runAsync(`DROP TRIGGER update_account_balance`)
    // await db.runAsync(`DROP TRIGGER delete_account_balance`)
    // await db.runAsync(`DROP TRIGGER insert_account_balance`)
    // await db.runAsync('DELETE FROM accounts')
    // await db.runAsync('DELETE FROM migrations')
    // await db.runAsync('DELETE FROM transactions')
    // await db.runAsync('DELETE FROM categories')

    // DROP table
    // await db.runAsync('DROP TABLE migrations')
    // await db.runAsync('DROP TABLE accounts')
    // await db.runAsync('DROP TABLE categories')
    // await db.runAsync('DROP TABLE transactions')

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

        // console.log('triggers', r);


        // const allMigrations = await db.getAllAsync('SELECT * FROM migrations')
        // console.log(allMigrations)

        // const allCategories = await db.getAllAsync('SELECT * FROM categories');
        // console.log(allCategories)

        // const allAccounts = await db.getAllAsync('SELECT * FROM accounts');
        // console.log(allAccounts)

        const transactions = await db.getAllAsync('SELECT * FROM transactions');
        console.log(transactions);

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
                CREATE TABLE IF NOT EXISTS transactions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT NOT NULL,
                    recurrentDate TEXT,
                    amount INTEGER NOT NULL,
                    notes TEXT,
                    category_id INTEGER NOT NULL,
                    account_id INTEGER NOT NULL,
                    FOREIGN KEY (category_id) REFERENCES categories(id),
                    FOREIGN KEY (account_id) REFERENCES accounts(id)
                )
            `);

            } catch (err) {
                console.error('Ocurrio un error corriendo las migraciones... ', err)
            }
        }
    },
    {
        version: 1.1,
        name: 'Triggers for deleting and inserting transactions update balance',
        migrate: async (db: SQLiteDatabase) => {
            await db.execAsync(`
                CREATE TRIGGER IF NOT EXISTS insert_account_balance
                AFTER INSERT
                ON transactions
                BEGIN
                    UPDATE accounts
                    SET balance = balance + CASE
                        WHEN (SELECT type FROM categories WHERE id = NEW.category_id) = 'income' THEN NEW.amount
                        ELSE -NEW.amount
                    END
                    
                    WHERE id = NEW.account_id;
                    
                    UPDATE accounts
                    SET positive_state = CASE
                        WHEN balance > 0 THEN 1
                        ELSE 0
                    END
                    
                    WHERE id = NEW.account_id;
                END;    
                
                CREATE TRIGGER IF NOT EXISTS delete_account_balance
                AFTER DELETE
                ON transactions
                BEGIN
                    UPDATE accounts
                    SET balance = balance + CASE
                        WHEN (SELECT type FROM categories WHERE id = OLD.category_id) = 'expense' THEN OLD.amount
                        ELSE -OLD.amount
                    END
                    WHERE id = OLD.account_id;
                    
                    UPDATE accounts
                    SET positive_state = CASE
                        WHEN balance > 0 THEN 1
                        ELSE 0
                    END
                    
                    WHERE id = OLD.account_id;
                END;
            `)
        }
    },
    {
        version: 1.2,
        name: 'alter transactions table for introducing hide amount concept',
        migrate: async (db: SQLiteDatabase) => {
            await db.execAsync(`
                ALTER TABLE transactions ADD COLUMN hidden_amount INTEGER NOT NULL DEFAULT 0;
            `)
        }
    },
    {
        version: 1.3,
        name: 'alter transactions table for introducing hide amount concept',
        migrate: async (db: SQLiteDatabase) => {
            await db.execAsync(`
                ALTER TABLE transactions ADD COLUMN is_hidden_transaction BOOLEAN NOT NULL DEFAULT FALSE;
            `)
        }
    },
    {
        version: 1.4,
        name: 'create new table settings for key value data',
        migrate: async (db: SQLiteDatabase) => {
            await db.execAsync(`
                CREATE TABLE IF NOT EXISTS settings (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        key TEXT NOT NULL,
                        value INTEGER NOT NULL
                    )
            `)
        }
    },
    // {
    //     version: 1.5,
    //     name: 'Add currency fields to transactions and make account_id nullable',
    //     migrate: async (db: SQLiteDatabase) => {
    //         await db.execAsync(`
    //         ALTER TABLE transactions
    //         ADD COLUMN currency_symbol TEXT NOT NULL DEFAULT '',
    //         ADD COLUMN currency_code TEXT NOT NULL DEFAULT '';
    //     `);
    //
    //         // Create a temporary table to store non-null account_id values
    //         await db.execAsync(`
    //         CREATE TEMPORARY TABLE temp_transactions AS
    //         SELECT * FROM transactions WHERE account_id IS NOT NULL;
    //     `);
    //
    //         // Drop the original transactions table
    //         await db.execAsync(`
    //         DROP TABLE transactions;
    //     `);
    //
    //         // Recreate the transactions table with nullable account_id
    //         await db.execAsync(`
    //         CREATE TABLE transactions (
    //             id INTEGER PRIMARY KEY AUTOINCREMENT,
    //             date TEXT NOT NULL,
    //             recurrentDate TEXT,
    //             amount INTEGER NOT NULL,
    //             notes TEXT,
    //             category_id INTEGER NOT NULL,
    //             account_id INTEGER,
    //             currency_symbol TEXT NOT NULL DEFAULT '',
    //             currency_code TEXT NOT NULL DEFAULT '',
    //             FOREIGN KEY (category_id) REFERENCES categories(id),
    //             FOREIGN KEY (account_id) REFERENCES accounts(id)
    //         );
    //     `);
    //
    //         // Insert data from the temporary table into the new table
    //         await db.execAsync(`
    //         INSERT INTO transactions
    //         SELECT * FROM temp_transactions;
    //     `);
    //
    //         // Drop the temporary table
    //         await db.execAsync(`
    //         DROP TABLE temp_transactions;
    //     `);
    //     }
    // }
];
