import { and, eq, avg } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { HttpError } from '@/shared/middleware/error.middleware.js';
import {
  ApplicationRatingsResponseSchema,
  RatingResponseSchema,
  type ApplicationRatingsResponse,
  type RatingResponse,
} from './dto/index.js';
import {
  application,
  ratings,
  type InsertRating,
  type SelectRating,
  user,
} from './ratings.model.js';

export type RatingWithUserEmail = RatingResponse;
export type ApplicationRatings = ApplicationRatingsResponse;
type RawRatingWithUserEmail = Omit<RatingWithUserEmail, 'isAnonymous'> & {
  isAnonymous: boolean | null;
};

export interface IRatingsService {
  getApplicationRatingsBySlug(slug: string): Promise<ApplicationRatings>;
  createRatingByApplicationSlug(
    slug: string,
    userId: string,
    payload: Required<Pick<InsertRating, 'score'>> & Pick<InsertRating, 'comment' | 'isAnonymous'>,
  ): Promise<RatingWithUserEmail>;
  patchRatingByApplicationSlug(
    slug: string,
    userId: string,
    updates: Partial<Pick<InsertRating, 'score' | 'comment' | 'isAnonymous'>>,
  ): Promise<RatingWithUserEmail>;
  deleteRatingByApplicationSlug(slug: string, userId: string): Promise<RatingWithUserEmail>;
}

export default class RatingsService implements IRatingsService {
  constructor(private readonly db: NodePgDatabase) {}

  private getApplicationBySlug = async (slug: string): Promise<{ id: number; slug: string }> => {
    const [app] = await this.db
      .select({ id: application.id, slug: application.slug })
      .from(application)
      .where(eq(application.slug, slug))
      .limit(1);

    if (!app) {
      throw new HttpError(404, 'Application not found', 'NOT_FOUND');
    }

    return app;
  };

  private getUserById = async (userId: string): Promise<{ id: string; email: string }> => {
    const [foundUser] = await this.db
      .select({ id: user.id, email: user.email })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!foundUser) {
      throw new HttpError(404, 'User not found', 'NOT_FOUND');
    }

    return foundUser;
  };

  private getRatingByUserAndApplication = async (
    userId: string,
    applicationId: number,
  ): Promise<SelectRating | undefined> => {
    const [rating] = await this.db
      .select()
      .from(ratings)
      .where(and(eq(ratings.userId, userId), eq(ratings.applicationId, applicationId)))
      .limit(1);

    return rating;
  };

  private formatRating = (rating: RawRatingWithUserEmail): RatingWithUserEmail => {
    const isAnonymous = rating.isAnonymous ?? false;

    return RatingResponseSchema.parse({
      ...rating,
      isAnonymous,
      userEmail: isAnonymous ? null : rating.userEmail,
    });
  };

  getApplicationRatingsBySlug = async (slug: string): Promise<ApplicationRatings> => {
    const app = await this.getApplicationBySlug(slug);

    const [averageRows, ratingRows] = await Promise.all([
      this.db
        .select({ average: avg(ratings.score) })
        .from(ratings)
        .where(eq(ratings.applicationId, app.id)),
      this.db
        .select({
          applicationId: ratings.applicationId,
          score: ratings.score,
          comment: ratings.comment,
          isAnonymous: ratings.isAnonymous,
          userEmail: user.email,
        })
        .from(ratings)
        .innerJoin(user, eq(ratings.userId, user.id))
        .where(eq(ratings.applicationId, app.id)),
    ]);

    const [average] = averageRows;

    const formattedRatings = ratingRows.map((row) => this.formatRating(row));

    const total = formattedRatings.length;

    return ApplicationRatingsResponseSchema.parse({
      applicationSlug: app.slug,
      ratings: formattedRatings,
      total,
      averageScore: parseFloat(Number(average.average).toFixed(2)),
    });
  };

  createRatingByApplicationSlug = async (
    slug: string,
    userId: string,
    payload: Required<Pick<InsertRating, 'score'>> & Pick<InsertRating, 'comment' | 'isAnonymous'>,
  ): Promise<RatingWithUserEmail> => {
    const [app, foundUser] = await Promise.all([
      this.getApplicationBySlug(slug),
      this.getUserById(userId),
    ]);

    const existing = await this.getRatingByUserAndApplication(foundUser.id, app.id);

    if (existing) {
      throw new HttpError(
        409,
        'Rating already exists for this user and application',
        'DUPLICATE_RATING',
      );
    }

    const insertPayload: InsertRating = {
      userId: foundUser.id,
      applicationId: app.id,
      score: payload.score,
      comment: payload.comment ?? null,
      isAnonymous: payload.isAnonymous ?? false,
    };

    await this.db.insert(ratings).values(insertPayload);

    return this.formatRating({
      applicationId: app.id,
      score: payload.score,
      comment: payload.comment ?? null,
      isAnonymous: payload.isAnonymous ?? false,
      userEmail: foundUser.email,
    });
  };

  patchRatingByApplicationSlug = async (
    slug: string,
    userId: string,
    updates: Partial<Pick<InsertRating, 'score' | 'comment' | 'isAnonymous'>>,
  ): Promise<RatingWithUserEmail> => {
    const app = await this.getApplicationBySlug(slug);
    const existing = await this.getRatingByUserAndApplication(userId, app.id);

    if (!existing) {
      throw new HttpError(404, 'Rating not found', 'NOT_FOUND');
    }

    const [updatedRows, ownerRows] = await Promise.all([
      this.db
        .update(ratings)
        .set({
          score: updates.score,
          comment: updates.comment,
          isAnonymous: updates.isAnonymous,
        })
        .where(
          and(
            eq(ratings.userId, existing.userId),
            eq(ratings.applicationId, existing.applicationId),
          ),
        )
        .returning({
          applicationId: ratings.applicationId,
          score: ratings.score,
          comment: ratings.comment,
          isAnonymous: ratings.isAnonymous,
        }),
      this.db.select({ email: user.email }).from(user).where(eq(user.id, userId)).limit(1),
    ]);

    const [updated] = updatedRows;
    const [owner] = ownerRows;

    if (!updated) {
      throw new HttpError(404, 'Rating not found', 'NOT_FOUND');
    }

    return this.formatRating({
      ...updated,
      userEmail: owner?.email ?? null,
    });
  };

  deleteRatingByApplicationSlug = async (
    slug: string,
    userId: string,
  ): Promise<RatingWithUserEmail> => {
    const app = await this.getApplicationBySlug(slug);
    const existing = await this.getRatingByUserAndApplication(userId, app.id);

    if (!existing) {
      throw new HttpError(404, 'Rating not found', 'NOT_FOUND');
    }

    const [deletedRows, ownerRows] = await Promise.all([
      this.db
        .delete(ratings)
        .where(
          and(
            eq(ratings.userId, existing.userId),
            eq(ratings.applicationId, existing.applicationId),
          ),
        )
        .returning({ applicationId: ratings.applicationId }),
      this.db.select({ email: user.email }).from(user).where(eq(user.id, userId)).limit(1),
    ]);

    const [deleted] = deletedRows;
    const [owner] = ownerRows;

    if (!deleted) {
      throw new HttpError(404, 'Rating not found', 'NOT_FOUND');
    }

    return this.formatRating({
      applicationId: existing.applicationId,
      score: existing.score,
      comment: existing.comment,
      isAnonymous: existing.isAnonymous ?? false,
      userEmail: owner?.email ?? null,
    });
  };
}
