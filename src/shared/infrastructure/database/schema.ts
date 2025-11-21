import { pgTable, foreignKey, serial, varchar, integer, text, timestamp, unique, boolean } from "drizzle-orm/pg-core"

export const application = pgTable("application", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull().unique(),
	authorId: integer("author_id").notNull(),
	description: text(),
	url: text(),
	previewImages: text("preview_images").array(),
	tags: varchar({ length: 50 }).array(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [author.id],
			name: "applications_author_id_authors_id_fk"
		}).onDelete("cascade"),
]);

export const author = pgTable("author", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 150 }).notNull(),
	email: varchar({ length: 150 }).notNull(),
	description: text(),
	website: text(),
	logo: text(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
	unique("authors_email_key").on(table.email),
]);
export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
	  .defaultNow()
	  .$onUpdate(() => /* @__PURE__ */ new Date())
	  .notNull(),
  });
  
  export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
	  .$onUpdate(() => /* @__PURE__ */ new Date())
	  .notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
	  .notNull()
	  .references(() => user.id, { onDelete: "cascade" }),
  });
  
  export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
	  .notNull()
	  .references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
	  .$onUpdate(() => /* @__PURE__ */ new Date())
	  .notNull(),
  });
  
  export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
	  .defaultNow()
	  .$onUpdate(() => /* @__PURE__ */ new Date())
	  .notNull(),
  });
  



// // ============================================
// // APPLICATION TABLES
// // ============================================

// export const ratings = pgTable("ratings", {
// 	id: serial().primaryKey().notNull(),
// 	userId: text("user_id"),
// 	applicationId: integer("application_id"),
// 	comment: varchar({ length: 255 }),
// 	isAnonymous: boolean("is_anonymous").default(false),
// 	score: doublePrecision().default(0).notNull(),
// }, (table) => [
// 	foreignKey({
// 			columns: [table.userId],
// 			foreignColumns: [user.id],
// 			name: "ratings_user_id_fkey"
// 		}),
// 	foreignKey({
// 			columns: [table.applicationId],
// 			foreignColumns: [applications.id],
// 			name: "ratings_application_id_fkey"
// 		}),
// 	check("ratings_score_check", sql`(score >= (0.0)::double precision) AND (score <= (5.0)::double precision)`),
// ]);

// export const userFavorites = pgTable("user_favorites", {
// 	userId: integer("user_id").notNull(),
// 	applicationId: integer("application_id").notNull(),
// }, (table) => [
// 	foreignKey({
// 			columns: [table.userId],
// 			foreignColumns: [user.id],
// 			name: "user_favorites_user_id_fkey"
// 		}),
// 	foreignKey({
// 			columns: [table.applicationId],
// 			foreignColumns: [applications.id],
// 			name: "user_favorites_application_id_fkey"
// 		}),
// 	primaryKey({ columns: [table.userId, table.applicationId], name: "user_favorites_pkey"}),
// ]);
