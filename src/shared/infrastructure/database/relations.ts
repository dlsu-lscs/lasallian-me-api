import { defineRelations } from 'drizzle-orm';
import {
  author,
  application,
  user,
  ratings,
  userFavorite,
  session,
  account,
} from './schema.js';

export const relations = defineRelations(
	{
		application,
		author,
		ratings,
		userFavorite,
		user,
		session,
		account,
	},
	(r) => ({
		application: {
			author: r.one.author({
				from: r.application.authorId,
				to: r.author.id,
			}),
			ratings: r.many.ratings(),
			userFavorite: r.many.userFavorite(),
		},
		author: {
			applications: r.many.application(),
		},
		ratings: {
			user: r.one.user({
				from: r.ratings.userId,
				to: r.user.id,
			}),
			application: r.one.application({
				from: r.ratings.applicationId,
				to: r.application.id,
			}),
		},
		userFavorite: {
			user: r.one.user({
				from: r.userFavorite.userId,
				to: r.user.id,
			}),
			application: r.one.application({
				from: r.userFavorite.applicationId,
				to: r.application.id,
			}),
		},
		user: {
			sessions: r.many.session(),
			accounts: r.many.account(),
			ratings: r.many.ratings(),
			userFavorite: r.many.userFavorite(),
		},
		session: {
			user: r.one.user({
				from: r.session.userId,
				to: r.user.id,
			}),
		},
		account: {
			user: r.one.user({
				from: r.account.userId,
				to: r.user.id,
			}),
		},
	}),
);
