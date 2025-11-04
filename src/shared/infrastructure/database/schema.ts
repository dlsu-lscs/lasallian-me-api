import { pgTable, unique, serial, varchar, text, foreignKey, integer, check, boolean, doublePrecision, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { user } from "@/users/user.model.js";
// Re-export domain models for better-auth
export * from "@/auth/auth.model.js";
export * from "@/users/user.model.js";

export const authors = pgTable("authors", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 150 }),
	email: varchar({ length: 150 }),
	description: varchar({ length: 255 }),
	website: text(),
	logo: text(),
}, (table) => [
	unique("authors_email_key").on(table.email),
]);

export const applications = pgTable("applications", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	authorId: integer("author_id").notNull(),
	description: varchar({ length: 255 }),
	url: text(),
	previewImages: text("preview_images").array(),
	tags: varchar({ length: 50 }).array(),
}, (table) => [
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [authors.id],
			name: "applications_author_id_fkey"
		}),
]);


export const ratings = pgTable("ratings", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id"),
	applicationId: integer("application_id"),
	comment: varchar({ length: 255 }),
	isAnonymous: boolean("is_anonymous").default(false),
	score: doublePrecision().default(0).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "ratings_user_id_fkey"
		}),
	foreignKey({
			columns: [table.applicationId],
			foreignColumns: [applications.id],
			name: "ratings_application_id_fkey"
		}),
	check("ratings_score_check", sql`(score >= (0.0)::double precision) AND (score <= (5.0)::double precision)`),
]);

export const userFavorites = pgTable("user_favorites", {
	userId: integer("user_id").notNull(),
	applicationId: integer("application_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "user_favorites_user_id_fkey"
		}),
	foreignKey({
			columns: [table.applicationId],
			foreignColumns: [applications.id],
			name: "user_favorites_application_id_fkey"
		}),
	primaryKey({ columns: [table.userId, table.applicationId], name: "user_favorites_pkey"}),
]);
