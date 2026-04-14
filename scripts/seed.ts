import { reset, seed } from 'drizzle-seed';

import { db } from '../src/shared/config/database.js';
import {
  account,
  application,
  author,
  ratings,
  session,
  user,
  userFavorites,
  verification,
} from '../src/shared/infrastructure/database/schema.js';
import { logger } from '../src/shared/utils/logger.js';

const AUTHORS_COUNT = 8;
const APPLICATIONS_COUNT = 24;
const USERS_COUNT = 12;
const SEED_NUMBER = 42;

const resetSchema = {
  account,
  application,
  author,
  ratings,
  session,
  user,
  userFavorites,
  verification,
};

const coreSeedSchema = { author, application, user };

async function seedDatabase() {
  try {
    logger.info('Starting full database seed...');

    logger.info('Resetting existing data...');
    await reset(db, resetSchema);

    logger.info('Generating base entities using drizzle-seed...');
    await seed(db, coreSeedSchema, { seed: SEED_NUMBER }).refine((funcs) => ({
      author: {
        count: AUTHORS_COUNT,
        columns: {
          name: funcs.fullName(),
          email: funcs.uuid(),
          description: funcs.loremIpsum({ sentencesCount: 2 }),
          website: funcs.string(),
          logo: funcs.string(),
        },
      },
      application: {
        count: APPLICATIONS_COUNT,
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
      user: {
        count: USERS_COUNT,
        columns: {
          id: funcs.uuid(),
          name: funcs.fullName(),
          email: funcs.uuid(),
        },
      },
    }));

    const seededUsers = await db.select({ id: user.id, email: user.email }).from(user);
    const seededApplications = await db.select({ id: application.id }).from(application);

    if (seededUsers.length === 0 || seededApplications.length === 0) {
      throw new Error('Missing seeded users or applications needed for related records.');
    }

    const now = Date.now();

    const sessionValues: Array<typeof session.$inferInsert> = seededUsers.map((seededUser, index) => ({
      id: `session-${index + 1}`,
      userId: seededUser.id,
      token: `session-token-${index + 1}`,
      expiresAt: new Date(now + (index + 1) * 24 * 60 * 60 * 1000),
    }));

    await db.insert(session).values(sessionValues);

    const accountValues: Array<typeof account.$inferInsert> = seededUsers.map((seededUser, index) => ({
      id: `account-${index + 1}`,
      accountId: `provider-account-${index + 1}`,
      providerId: index % 2 === 0 ? 'google' : 'github',
      userId: seededUser.id,
    }));

    await db.insert(account).values(accountValues);

    const verificationValues: Array<typeof verification.$inferInsert> = seededUsers
      .slice(0, Math.min(10, seededUsers.length))
      .map((seededUser, index) => ({
        id: `verification-${index + 1}`,
        identifier: seededUser.email,
        value: `verification-value-${index + 1}`,
        expiresAt: new Date(now + (index + 1) * 60 * 60 * 1000),
      }));

    if (verificationValues.length > 0) {
      await db.insert(verification).values(verificationValues);
    }

    const ratingValues: Array<typeof ratings.$inferInsert> = seededUsers.flatMap((seededUser, userIndex) =>
      seededApplications.slice(0, 3).map((seededApplication, applicationIndex) => ({
        userId: seededUser.id,
        applicationId: seededApplication.id,
        score: ((userIndex + applicationIndex) % 5) + 1,
        comment: `Seeded rating ${userIndex + 1}-${applicationIndex + 1}`,
        isAnonymous: (userIndex + applicationIndex) % 2 === 0,
      })),
    );

    if (ratingValues.length > 0) {
      await db.insert(ratings).values(ratingValues);
    }

    const favoriteValues: Array<typeof userFavorites.$inferInsert> = [];

    for (let userIndex = 0; userIndex < seededUsers.length; userIndex += 1) {
      const seededUser = seededUsers[userIndex];
      const firstApplication = seededApplications[userIndex % seededApplications.length];
      const secondApplication = seededApplications[(userIndex + 1) % seededApplications.length];

      favoriteValues.push({ userId: seededUser.id, applicationId: firstApplication.id });

      if (secondApplication.id !== firstApplication.id) {
        favoriteValues.push({ userId: seededUser.id, applicationId: secondApplication.id });
      }
    }

    if (favoriteValues.length > 0) {
      await db.insert(userFavorites).values(favoriteValues);
    }

    logger.info('Full database seeding completed successfully!');
    logger.info(
      `Summary: ${AUTHORS_COUNT} authors, ${APPLICATIONS_COUNT} applications, ${seededUsers.length} users, ${sessionValues.length} sessions, ${accountValues.length} accounts, ${verificationValues.length} verifications, ${ratingValues.length} ratings, ${favoriteValues.length} favorites`,
    );

    process.exit(0);
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
