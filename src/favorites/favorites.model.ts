import { userFavorites } from "@/shared/infrastructure/database/schema.js";

export {userFavorites} 

export type SelectFavorite = typeof userFavorites.$inferSelect
export type InsertFavorite = typeof userFavorites.$inferInsert