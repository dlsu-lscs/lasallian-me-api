import { reset, seed } from 'drizzle-seed';

import { db } from '../src/shared/config/database.js';
import {
  account,
  application,
  author,
  ratings,
  session,
  user,
  userFavorite,
  verification,
} from '../src/shared/infrastructure/database/schema.js';
import { logger } from '../src/shared/utils/logger.js';

const AUTHORS_COUNT = 8;
const APPLICATIONS_COUNT = 24;
const USERS_COUNT = 12;
const APPLICATIONS_PER_AUTHOR = APPLICATIONS_COUNT / AUTHORS_COUNT;
const RATINGS_PER_USER = 3;
const FAVORITES_PER_USER = 1;
const SEED_NUMBER = 42;

const resetSchema = {
  account,
  application,
  author,
  ratings,
  session,
  user,
  userFavorite,
  verification,
};

const contentSeedSchema = { author, application };
const userSeedSchema = { user, session, account, ratings, userFavorite };
const verificationSeedSchema = { verification };

async function seedDatabase() {
  try {
    logger.info('Starting full database seed...');

    logger.info('Resetting existing data...');
    await reset(db, resetSchema);

    if (!Number.isInteger(APPLICATIONS_PER_AUTHOR)) {
      throw new Error('APPLICATIONS_COUNT must be evenly divisible by AUTHORS_COUNT.');
    }

    logger.info('Generating content entities using drizzle-seed with relational seeding...');
    await seed(db, contentSeedSchema, { seed: SEED_NUMBER }).refine((funcs) => ({
      author: {
        count: AUTHORS_COUNT,
        columns: {
          name: funcs.fullName(),
          email: funcs.email(),
          description: funcs.loremIpsum({ sentencesCount: 2 }),
          website: funcs.string(),
          logo: funcs.string(),
        },
        with: {
          application: APPLICATIONS_PER_AUTHOR,
        },
      },
      application: {
        columns: {
          title: funcs.companyName(),
          slug: funcs.uuid(),
          description: funcs.loremIpsum({ sentencesCount: 2 }),
          url: funcs.string(),
          tags: funcs.valuesFromArray({
            values: ['web', 'mobile', 'api', 'ai', 'iot', 'design'],
            arraySize: 3,
          }),
        },
      },
    }));

    const seededApplications = await db.select({ id: application.id }).from(application);
    const seededApplicationIds = seededApplications.map((seededApplication) => seededApplication.id);

    if (seededApplicationIds.length === 0) {
      throw new Error('Missing seeded applications needed for related records.');
    }

    logger.info('Generating users and related entities using drizzle-seed with relational seeding...');
    await seed(db, userSeedSchema, { seed: SEED_NUMBER + 1 }).refine((funcs) => ({
      user: {
        count: USERS_COUNT,
        columns: {
          id: funcs.uuid(),
          name: funcs.fullName(),
          email: funcs.email(),
        },
        with: {
          session: 1,
          account: 1,
          ratings: RATINGS_PER_USER,
          userFavorite: FAVORITES_PER_USER,
        },
      },
      session: {
        columns: {
          id: funcs.uuid(),
          token: funcs.uuid(),
          expiresAt: funcs.timestamp(),
        },
      },
      account: {
        columns: {
          id: funcs.uuid(),
          accountId: funcs.uuid(),
          providerId: funcs.valuesFromArray({ values: ['google', 'github'] }),
        },
      },
      ratings: {
        columns: {
          applicationId: funcs.valuesFromArray({ values: seededApplicationIds }),
          score: funcs.valuesFromArray({ values: [1, 2, 3, 4, 5] }),
          comment: funcs.loremIpsum({ sentencesCount: 1 }),
          isAnonymous: funcs.boolean(),
        },
      },
      userFavorite: {
        columns: {
          applicationId: funcs.valuesFromArray({ values: seededApplicationIds }),
        },
      },
    }));

    const seededUsers = await db.select({ id: user.id, email: user.email }).from(user);
    const verificationIdentifiers = seededUsers
      .slice(0, Math.min(10, seededUsers.length))
      .map((seededUser) => seededUser.email);

    if (verificationIdentifiers.length > 0) {
      await seed(db, verificationSeedSchema, { seed: SEED_NUMBER + 2 }).refine((funcs) => ({
        verification: {
          count: verificationIdentifiers.length,
          columns: {
            id: funcs.uuid(),
            identifier: funcs.valuesFromArray({ values: verificationIdentifiers }),
            value: funcs.uuid(),
            expiresAt: funcs.timestamp(),
          },
        },
      }));
    }

    logger.info('Full database seeding completed successfully!');
    logger.info(
      `Summary: ${AUTHORS_COUNT} authors, ${APPLICATIONS_COUNT} applications, ${seededUsers.length} users, ${seededUsers.length} sessions, ${seededUsers.length} accounts, ${verificationIdentifiers.length} verifications, ${seededUsers.length * RATINGS_PER_USER} ratings, ${seededUsers.length * FAVORITES_PER_USER} favorites`,
    );

    process.exit(0);
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
