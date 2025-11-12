// Auth data models
// NOTE: Schema definitions are in infrastructure layer for drizzle-kit compatibility
// These re-exports maintain DDD structure while allowing migrations to work
export { session, account, verification } from "@/shared/infrastructure/database/schema.js";
