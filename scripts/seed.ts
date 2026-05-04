import { reset, seed } from 'drizzle-seed';

import { db } from '../src/shared/config/database.js';
import {
  account,
  application,
  rating,
  session,
  user,
  userFavorite,
  verification,
} from '../src/shared/infrastructure/database/schema.js';
import { logger } from '../src/shared/utils/logger.js';

const USERS_COUNT = 12;
const APPLICATIONS_COUNT = 24;
const RATINGS_PER_USER = 3;
const FAVORITES_PER_USER = 5;
const SEED_NUMBER = 42;

const resetSchema = {
  account,
  application,
  rating,
  session,
  user,
  userFavorite,
  verification,
};

const userSeedSchema = { user };
const applicationSeedSchema = { application };

async function seedDatabase() {
  try {
    logger.info('Starting full database seed...');

    logger.info('Resetting existing data...');
    await reset(db, resetSchema);

    logger.info('Generating users...');
    await seed(db, userSeedSchema, { seed: SEED_NUMBER }).refine((funcs) => ({
      user: {
        count: USERS_COUNT,
        columns: {
          id: funcs.uuid(),
          name: funcs.fullName(),
          email: funcs.email(),
          role: funcs.default({
            defaultValue: "user"
          })
        },
      },
    }));

    const seededUsers = await db.select({ id: user.id, email: user.email }).from(user);
    const seededUserIds = seededUsers.map((seededUser) => seededUser.id);

    if (seededUserIds.length === 0) {
      throw new Error('Missing seeded users needed for related records.');
    }

    logger.info('Generating applications...');
    await seed(db, applicationSeedSchema, { seed: SEED_NUMBER + 1 }).refine((funcs) => ({
      application: {
        count: APPLICATIONS_COUNT,
        columns: {
          title: funcs.companyName(),
          slug: funcs.uuid(),
          userId: funcs.valuesFromArray({ values: seededUserIds }),
          description: funcs.loremIpsum({ sentencesCount: 2 }),
          url: funcs.string(),
          githubLink: funcs.string(),
          tags: funcs.valuesFromArray({
            values: ['web', 'mobile', 'api', 'ai', 'iot', 'design'],
            arraySize: 3,
          }),
          status: funcs.valuesFromArray({
            values: ['APPROVED', 'PENDING', 'REJECTED', 'REMOVED'],
          }),
          rejectionReason: funcs.valuesFromArray({
            values: [null, null, null, 'Needs better screenshots', 'Insufficient description'],
          }),
        },
      },
    }));

    const seededApplications = await db.select({ id: application.id }).from(application);
    const seededApplicationIds = seededApplications.map(
      (seededApplication) => seededApplication.id,
    );

    if (seededApplicationIds.length === 0) {
      throw new Error('Missing seeded applications needed for related records.');
    }

    if (RATINGS_PER_USER > seededApplicationIds.length) {
      throw new Error('RATINGS_PER_USER cannot exceed the number of seeded applications.');
    }

    if (FAVORITES_PER_USER > seededApplicationIds.length) {
      throw new Error('FAVORITES_PER_USER cannot exceed the number of seeded applications.');
    }

    logger.info('Generating rating with unique application assignments per user...');
    const cycledApplicationIdsForRatings = [...seededApplicationIds, ...seededApplicationIds];
    const ratingRows = seededUsers.flatMap((seededUser, userIndex) => {
      const startIndex = (userIndex * RATINGS_PER_USER) % seededApplicationIds.length;
      const selectedApplicationIds = cycledApplicationIdsForRatings.slice(
        startIndex,
        startIndex + RATINGS_PER_USER,
      );

      return selectedApplicationIds.map((applicationId, ratingIndex) => ({
        userId: seededUser.id,
        applicationId,
        score: ((userIndex + ratingIndex) % 5) + 1,
        comment: `Sample rating ${ratingIndex + 1}`,
        isAnonymous: (userIndex + ratingIndex) % 2 === 0,
      }));
    });

    if (ratingRows.length > 0) {
      await db.insert(rating).values(ratingRows);
    }

    logger.info('Generating user favorites with unique application assignments per user...');
    const cycledApplicationIds = [
      ...seededApplicationIds,
      ...seededApplicationIds,
      ...seededApplicationIds,
    ];
    const favoriteRows = seededUsers.flatMap((seededUser, userIndex) => {
      const startIndex = (userIndex * FAVORITES_PER_USER) % seededApplicationIds.length;
      const selectedApplicationIds = cycledApplicationIds.slice(
        startIndex,
        startIndex + FAVORITES_PER_USER,
      );

      return selectedApplicationIds.map((applicationId) => ({
        userId: seededUser.id,
        applicationId,
      }));
    });

    if (favoriteRows.length > 0) {
      await db.insert(userFavorite).values(favoriteRows);
    }

    logger.info('Full database seeding completed successfully!');
    logger.info(
      `Summary: ${seededUsers.length} users, ${seededApplicationIds.length} applications, ${seededUsers.length * RATINGS_PER_USER} rating, ${seededUsers.length * FAVORITES_PER_USER} favorites`,
    );

    process.exit(0);
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
