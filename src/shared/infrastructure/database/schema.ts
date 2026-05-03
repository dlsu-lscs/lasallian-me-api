import {
  pgTable,
  pgEnum,
  foreignKey,
  serial,
  varchar,
  integer,
  text,
  timestamp,
  boolean,
  doublePrecision,
  primaryKey,
  check,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const applicationApprovalStatus = pgEnum('application_approval_status', [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'REMOVED',
]);

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  website: text('website'),
  logo: text('logo'),
  role: text('role'),
  banned: boolean('banned'),
  banReason: text('ban_reason'),
  banExpires: timestamp('ban_expires', { precision: 6, withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const application = pgTable(
  'application',
  {
    id: serial().primaryKey().notNull(),
    title: varchar({ length: 255 }).notNull(),
    slug: varchar({ length: 255 }).notNull().unique(),
    userId: text('user_id').notNull(),
    description: text(),
    url: text(),
    githubLink: text('github_link').notNull(),
    previewImages: text('preview_images').array(),
    tags: varchar({ length: 50 }).array(),
    isApproved: applicationApprovalStatus('is_approved').default('PENDING').notNull(),
    rejectionReason: text('rejection_reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index('application_user_id_idx').on(table.userId),
    index('application_created_at_idx').on(table.createdAt),
    index('application_updated_at_idx').on(table.updatedAt),
    index('application_title_idx').on(table.title),
    index('application_is_approved_idx').on(table.isApproved),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'applications_user_id_users_id_fk',
    }).onDelete('cascade'),
  ],
);

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    impersonatedBy: text('impersonated_by'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [index('session_user_id_idx').on(table.userId)],
);

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index('account_user_id_idx').on(table.userId),
    unique('account_provider_account_unq').on(table.providerId, table.accountId),
  ],
);

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const rating = pgTable(
  'rating',
  {
    userId: text('user_id').notNull(),
    applicationId: integer('application_id').notNull(),
    comment: varchar({ length: 255 }),
    isAnonymous: boolean('is_anonymous').notNull().default(false),
    score: doublePrecision().default(0).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.applicationId],
      name: 'rating_pkey',
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'rating_user_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.applicationId],
      foreignColumns: [application.id],
      name: 'rating_application_id_fkey',
    }).onDelete('cascade'),
    index('rating_application_id_idx').on(table.applicationId),
    check(
      'rating_score_check',
      sql`(score >= (0.0)::double precision) AND (score <= (5.0)::double precision)`,
    ),
  ],
);

export const userFavorite = pgTable(
  'user_favorite',
  {
    userId: text('user_id').notNull(),
    applicationId: integer('application_id').notNull(),
  },
  (table) => [
    index('user_favorite_application_id_idx').on(table.applicationId),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'user_favorite_user_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.applicationId],
      foreignColumns: [application.id],
      name: 'user_favorite_application_id_fkey',
    }).onDelete('cascade'),
    primaryKey({ columns: [table.userId, table.applicationId], name: 'user_favorite_pkey' }),
  ],
);
