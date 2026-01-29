import 'reflect-metadata';
//
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.CLI_DRIZZLE_POSTGRES_DATABASE_URL
});

const db = drizzle(pool);

async function checkDatabase() {
  while (true) {
    try {
      await db.execute('SELECT 1');
      console.log('Database is ready!');
      break; // Exit the loop if the query is successful
    } catch (error) {
      console.log('Waiting for database...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
    }
  }

  await pool.end();
}

checkDatabase().catch(err => {
  console.error('Error checking database:', err);
});
