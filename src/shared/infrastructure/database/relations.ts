import { relations } from "drizzle-orm/relations";
import { author, application, user, ratings, userFavorites } from "./schema.js";

export const applicationsRelations = relations(application, ({one, many}) => ({
	author: one(author, {
		fields: [application.authorId],
		references: [author.id]
	}),
	ratings: many(ratings),
	userFavorites: many(userFavorites),
}));

export const authorsRelations = relations(author, ({many}) => ({
	applications: many(application),
}));

export const ratingsRelations = relations(ratings, ({one}) => ({
	user: one(user, {
		fields: [ratings.userId],
		references: [user.id]
	}),
	application: one(application, {
		fields: [ratings.applicationId],
		references: [application.id]
	}),
}));

export const usersRelations = relations(user, ({many}) => ({
	ratings: many(ratings),
	userFavorites: many(userFavorites),
}));

export const userFavoritesRelations = relations(userFavorites, ({one}) => ({
	user: one(user, {
		fields: [userFavorites.userId],
		references: [user.id]
	}),
	application: one(application, {
		fields: [userFavorites.applicationId],
		references: [application.id]
	}),
}));