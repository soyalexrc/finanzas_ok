import {SQLiteDatabase} from "expo-sqlite";
import { englishCategories, spanishCategories } from '@/lib/utils/data/categories';
import {getLocales} from "expo-localization";

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
    console.log('migrations ran');

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

        // const transactions = await db.getAllAsync('SELECT * FROM transactions');
        // console.log(transactions);

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

                const categories = db.getAllSync(`SELECT * FROM categories`);
                const languageCode = getLocales()[0].languageCode ?? 'en';

                console.log('categories', categories)

                if (categories.length < 1) {
                    const categoriesToInsert = languageCode === 'es' ? spanishCategories : englishCategories;
                    for (const category of categoriesToInsert) {
                        const statement = db.prepareSync(`INSERT INTO categories (title, icon, type) VALUES ($title, $icon, $type)`)
                        statement.executeSync({ $title: category.title, $icon: category.icon, $type: category.type })
                    }
                }

                const accounts = db.getAllSync(`SELECT * FROM accounts`);
                if (accounts.length < 1) {
                    const locales = getLocales();
                    const statement = db.prepareSync(`INSERT INTO accounts (title, icon, balance, positive_state, currency_code, currency_symbol) VALUES ($title, $icon, $balance, $positive_state, $currency_code, $currency_symbol)`)
                    statement.executeSync({ $title: languageCode === 'es' ? 'Efectivo' : 'Cash', $icon: '💵', $balance: 0, $positive_state: true, $currency_code: locales[0].currencyCode, $currency_symbol: locales[0].currencySymbol })
                }


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
    }
];
