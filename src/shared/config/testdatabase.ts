// Database configuration
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { logger } from '@/shared/utils/logger.js';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.TEST_DATABASE_URL,
});
const testdb = drizzle(pool);

try {
    await testdb.execute('SELECT 1');
    logger.info("Test database connection verified successfully.");
} catch (error) {
    logger.error("Failed to connect to the test database.", error);
    throw error;
}
export { testdb };