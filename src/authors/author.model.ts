export { author } from "@/shared/infrastructure/database/schema.js";
export {z} from "zod"

import { author } from "@/shared/infrastructure/database/schema.js"

export type SelectAuthor = typeof author.$inferSelect
export type InsertAuthor = typeof author.$inferInsert
