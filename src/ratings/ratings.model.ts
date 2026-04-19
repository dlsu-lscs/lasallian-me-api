import { application, author, ratings, user } from "@/shared/infrastructure/database/schema.js";

export { application, author, ratings, user };

export type SelectRating = typeof ratings.$inferSelect;
export type InsertRating = typeof ratings.$inferInsert;
