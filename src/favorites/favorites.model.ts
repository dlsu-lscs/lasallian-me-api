import { application, author, user, userFavorite } from "@/shared/infrastructure/database/schema.js";

export {application, author, user, userFavorite} 

export type SelectFavorite = typeof userFavorite.$inferSelect
export type InsertFavorite = typeof userFavorite.$inferInsert