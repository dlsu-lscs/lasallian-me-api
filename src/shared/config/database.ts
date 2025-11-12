// Database configuration
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { logger } from '@/shared/utils/logger.js';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);

if(db){
    await db.execute('SELECT 1')
    logger.info("Database connection verified successfully.");
} else{
    logger.error("Failed to connect to the database.");
}
export { db };