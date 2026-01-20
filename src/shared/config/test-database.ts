import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import * as schema from '@/shared/infrastructure/database/schema.js';

export const createTestDatabase = async () => {
    const client = new PGlite();
    const db = drizzle(client, { schema });

    // Apply migrations
    await migrate(db, { migrationsFolder: "drizzle" });

    return {
        db,
        client,
    };
};