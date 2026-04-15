import { relations } from "drizzle-orm/relations";
import {
  author,
  application,
  user,
  ratings,
  userFavorite,
  session,
  account,
} from "./schema.js";

export const applicationsRelations = relations(application, ({one, many}) => ({
	author: one(author, {
		fields: [application.authorId],
		references: [author.id]
	}),
	ratings: many(ratings),
	userFavorite: many(userFavorite),
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



export const userFavoriteRelations = relations(userFavorite, ({one}) => ({
	user: one(user, {
		fields: [userFavorite.userId],
		references: [user.id]
	}),
	application: one(application, {
		fields: [userFavorite.applicationId],
		references: [application.id]
	}),
}));

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	ratings: many(ratings),
	userFavorite: many(userFavorite),
	
  }));
  
  export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
	  fields: [session.userId],
	  references: [user.id],
	}),
  }));
  
  export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
	  fields: [account.userId],
	  references: [user.id],
	}),
  }));
