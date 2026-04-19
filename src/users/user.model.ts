// User data model or entity
// NOTE: Schema definition is in infrastructure layer for drizzle-kit compatibility
// This re-export maintains DDD structure while allowing migrations to work
export { user } from "@/shared/infrastructure/database/schema.js";