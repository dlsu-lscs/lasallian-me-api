import { userFavorite } from "@/shared/infrastructure/database/schema.js";

export {userFavorite} 

export type SelectFavorite = typeof userFavorite.$inferSelect
export type InsertFavorite = typeof userFavorite.$inferInsert