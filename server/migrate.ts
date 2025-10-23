import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';

export async function runMigrations() {
  console.log('Running Drizzle database migrations...');

  try {
    // Create a separate connection for migrations
    const migrationPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    const migrationDb = drizzle(migrationPool);

    // Run official Drizzle migrations
    await migrate(migrationDb, { migrationsFolder: './drizzle' });

    // Create user_sessions table for session store (not in schema)
    try {
      await migrationDb.execute(sql`
        CREATE TABLE IF NOT EXISTS user_sessions (
          sid varchar PRIMARY KEY,
          sess json NOT NULL,
          expire timestamp NOT NULL
        )
      `);
    } catch (sessionError) {
      console.log('Session table creation skipped (may already exist):', sessionError);
    }

    await migrationPool.end();
    console.log('Database migrations completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
    // Don't throw the error - let the app continue without migrations
    console.log('Continuing without migrations - tables may need to be created manually');
  }
}