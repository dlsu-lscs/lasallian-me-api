import { relations } from "drizzle-orm/relations";
import { authors, applications, users, ratings, userFavorites } from "./schema";

export const applicationsRelations = relations(applications, ({one, many}) => ({
	author: one(authors, {
		fields: [applications.authorId],
		references: [authors.id]
	}),
	ratings: many(ratings),
	userFavorites: many(userFavorites),
}));

export const authorsRelations = relations(authors, ({many}) => ({
	applications: many(applications),
}));

export const ratingsRelations = relations(ratings, ({one}) => ({
	user: one(users, {
		fields: [ratings.userId],
		references: [users.id]
	}),
	application: one(applications, {
		fields: [ratings.applicationId],
		references: [applications.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	ratings: many(ratings),
	userFavorites: many(userFavorites),
}));

export const userFavoritesRelations = relations(userFavorites, ({one}) => ({
	user: one(users, {
		fields: [userFavorites.userId],
		references: [users.id]
	}),
	application: one(applications, {
		fields: [userFavorites.applicationId],
		references: [applications.id]
	}),
}));