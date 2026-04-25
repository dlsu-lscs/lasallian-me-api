import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { relations } from '@/shared/infrastructure/database/relations.js';

export const createTestDatabase = async () => {
  const client = new PGlite();
  const db = drizzle({ client, relations });

  await migrate(db, { migrationsFolder: 'drizzle' });

  return {
    db,
    client,
  };
};
