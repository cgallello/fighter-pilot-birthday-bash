import { db } from './db';
import { sql } from 'drizzle-orm';

export async function runMigrations() {
  console.log('Running database migrations...');

  try {
    // Create enums first
    await db.execute(sql`CREATE TYPE IF NOT EXISTS plan_type AS ENUM ('FAIR', 'RAIN')`);
    await db.execute(sql`CREATE TYPE IF NOT EXISTS rsvp_status AS ENUM ('JOINED', 'DECLINED')`);

    // Create guests table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS guests (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        phone text NOT NULL,
        phone_verified boolean NOT NULL DEFAULT false,
        description text,
        plus_ones integer NOT NULL DEFAULT 1,
        created_at timestamp NOT NULL DEFAULT now(),
        last_verified_at timestamp
      )
    `);

    // Create event_blocks table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS event_blocks (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        title text NOT NULL,
        description text NOT NULL,
        start_time timestamp NOT NULL,
        end_time timestamp,
        location text NOT NULL,
        plan_type plan_type NOT NULL,
        sort_order integer NOT NULL DEFAULT 0,
        created_at timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create rsvps table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS rsvps (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        guest_id varchar NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
        event_block_id varchar NOT NULL REFERENCES event_blocks(id) ON DELETE CASCADE,
        status rsvp_status NOT NULL,
        updated_at timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create settings table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS settings (
        key text PRIMARY KEY,
        value text NOT NULL
      )
    `);

    // Create user_sessions table for session store
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_sessions (
        sid varchar NOT NULL COLLATE "default",
        sess json NOT NULL,
        expire timestamp(6) NOT NULL
      ) WITH (OIDS=FALSE)
    `);

    await db.execute(sql`
      ALTER TABLE user_sessions ADD CONSTRAINT session_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE
    `);

    console.log('Database migrations completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
}