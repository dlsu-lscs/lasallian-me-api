import { defineRelations } from 'drizzle-orm';
import { application, user, ratings, userFavorite, session, account } from './schema.js';

export const relations = defineRelations(
  {
    application,
    ratings,
    userFavorite,
    user,
    session,
    account,
  },
  (r) => ({
    application: {
      user: r.one.user({
        from: r.application.userId,
        to: r.user.id,
      }),
      ratings: r.many.ratings(),
      userFavorite: r.many.userFavorite(),
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
      applications: r.many.application(),
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
