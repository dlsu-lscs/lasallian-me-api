// Database configuration
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';

const db = drizzle(process.env.DATABASE_URL!);

if(db){
    await db.execute('SELECT 1')
    console.log("Database connection verified successfully.");
} else{
    console.error("Failed to connect to the database.");
}
export { db };