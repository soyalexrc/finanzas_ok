import {SQLiteDatabase} from "expo-sqlite";
import initialCategories from '@/lib/utils/data/categories';
import {loadString} from "@/lib/utils/storage";

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
    console.log('migrations ran');

    // Clear table
    // await db.runAsync('DELETE FROM accounts')
    // await db.runAsync('DELETE FROM migrations')

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
                )
            `)

        // Get User in session
        const userId = await loadString('userId')

        // Get the latest applied migration version
        const result: any = await db.getFirstAsync(`SELECT MAX(version) as max_version FROM migrations`)
        let latestAppliedMigration = result.max_version ?? 0


        // Get the latest applied migration version
        for (const migration of migrations) {
            if (migration.version > latestAppliedMigration) {
                await migration.migrate(db, userId!);
                const statement = await db.prepareAsync(
                    `INSERT INTO migrations (version, name, applied_at) VALUES ($version, $name, $applied_at)`
                )
                await statement.executeAsync({ $version: migration.version, $name: migration.name, $applied_at: new Date().toISOString() });
                latestAppliedMigration = migration.version;
            }
        }

        // const allMigrations = await db.getAllAsync('SELECT * FROM migrations')
        // console.log(allMigrations)

        // const allCategories = await db.getAllAsync('SELECT * FROM categories');
        // console.log(allCategories)

        // const allAccounts = await db.getAllAsync('SELECT * FROM accounts');
        // console.log(allAccounts)
    } catch (err) {
        console.error('Ocurrio un error corriendo las migraciones... ', err)
    }

}

const migrations = [
    {
        version: 1,
        name: 'initial migration',
        migrate: async (db: SQLiteDatabase, userId: string) => {
            try {
                await db.execAsync(`
                CREATE TABLE IF NOT EXISTS accounts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    is_backed_up Boolean DEFAULT FALSE,
                    user_id TEXT NOT NULL,
                    icon TEXT NOT NULL,
                    balance INTEGER NOT NULL,
                    positive_state BOOLEAN DEFAULT TRUE
                )
            `);

                await db.execAsync(`
                CREATE TABLE IF NOT EXISTS categories (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    is_backed_up Boolean DEFAULT FALSE,
                    user_id TEXT NOT NULL,
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
                    is_backed_up Boolean DEFAULT FALSE,
                    user_id TEXT NOT NULL,
                    category_id INTEGER NOT NULL,
                    account_id INTEGER NOT NULL,
                    FOREIGN KEY (category_id) REFERENCES categories(id),
                    FOREIGN KEY (account_id) REFERENCES accounts(id)
                )
            `);

                const categories = db.getAllSync(`SELECT * FROM categories`);

                if (categories.length < 1) {
                    for (const category of initialCategories) {
                        const statement = db.prepareSync(`INSERT INTO categories (title, icon, type, is_backed_up, user_id) VALUES ($title, $icon, $type, $is_backed_up, $user_id)`)
                        statement.executeSync({ $title: category.title, $icon: category.icon, $type: category.type, $is_backed_up: true, $user_id: userId! })
                    }
                }

                const accounts = db.getAllSync(`SELECT * FROM accounts`);
                if (accounts.length < 1) {
                    const statement = db.prepareSync(`INSERT INTO accounts (title, icon, balance, positive_state, is_backed_up, user_id) VALUES ($title, $icon, $balance, $positive_state, $is_backed_up, $user_id)`)
                    statement.executeSync({ $title: 'Cash', $icon: '💵', $balance: 0, $positive_state: true, $is_backed_up: true, $user_id: userId })
                }

            } catch (err) {
                console.error('Ocurrio un error corriendo las migraciones... ', err)
            }
        }
    },
];
