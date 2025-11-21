import { applications } from '@/shared/infrastructure/database/schema.js';

/**
 * Application entity type inferred from database schema
 * Represents a fully persisted application record with ID and timestamps
 */
export type Application = typeof applications.$inferSelect;

/**
 * Type for creating a new application
 * Represents the data required to insert a new record (ID and default values are optional)
 */
export type NewApplication = typeof applications.$inferInsert;

