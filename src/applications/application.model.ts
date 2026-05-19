import { application } from '@/shared/infrastructure/database/schema.js';
export { application, userFavorite, user, rating } from '@/shared/infrastructure/database/schema.js';
export type SelectApplication = typeof application.$inferSelect;
export type InsertApplication = typeof application.$inferInsert;
