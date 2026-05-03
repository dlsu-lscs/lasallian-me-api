import type {
  ApplicationResponse,
  ApplicationsListFilters,
  ApplicationsListResponse,
  CreateApplicationRequest,
  PatchApplicationRequest,
} from './dto/index.js';
import type { AdminApplicationsListFilters } from './dto/admin-applications-list-query.dto.js';
import {
  eq,
  SQL,
  gte,
  lte,
  between,
  and,
  or,
  ilike,
  asc,
  desc,
  count,
  arrayOverlaps,
  sql,
  getColumns,
} from 'drizzle-orm';
import { APPLICATION_CONSTANTS } from './application.constants.js';
import { HttpError } from '@/shared/middleware/error.middleware.js';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { userFavorite, application, user } from './application.model.js';
import type { ReviewApplicationRequest } from './dto/review-application-request.dto.js';
import { getDbErrorMessage } from '@/shared/utils/dbErrorUtils.js';

export interface IApplicationService {
  getPaginatedApplications(
    limit: number,
    page: number,
    filters?: ApplicationsListFilters,
  ): Promise<ApplicationsListResponse>;
  getAdminApplications(
    limit: number,
    page: number,
    filters?: AdminApplicationsListFilters,
  ): Promise<ApplicationsListResponse>;
  getApplicationBySlug(slug: string): Promise<ApplicationResponse>;
  createApplication(app: CreateApplicationRequest, actorUserId: string): Promise<void>;
  patchApplicationById(
    id: number,
    updates: PatchApplicationRequest,
    actorUserId: string,
  ): Promise<string>;
  reviewAdminApplicationById(id: number, input: ReviewApplicationRequest): Promise<void>;
  deleteApplicationById(id: number, actorUserId: string): Promise<void>;
  getUserByApplicationId(appId: number): Promise<{ id: string; email: string }>;
}

export default class ApplicationService implements IApplicationService {
  constructor(private readonly db: NodePgDatabase) {}

  getPaginatedApplications = async (
    limit: number = APPLICATION_CONSTANTS.DEFAULT_LIMIT,
    page: number = APPLICATION_CONSTANTS.DEFAULT_PAGE,
    filters?: ApplicationsListFilters,
  ): Promise<ApplicationsListResponse> => {
    return this.getFilteredApplications(
      limit,
      page,
      filters,
      eq(application.status, 'APPROVED'),
    );
  };

  getAdminApplications = async (
    limit: number = APPLICATION_CONSTANTS.DEFAULT_LIMIT,
    page: number = APPLICATION_CONSTANTS.DEFAULT_PAGE,
    filters?: AdminApplicationsListFilters,
  ): Promise<ApplicationsListResponse> => {
    const statusCondition = filters?.status
      ? eq(application.status, filters.status)
      : or(
          eq(application.status, 'PENDING'),
          eq(application.status, 'REJECTED'),
          eq(application.status, 'REMOVED'),
        )!;

    return this.getFilteredApplications(limit, page, filters, statusCondition);
  };

  private getFilteredApplications = async (
    limit: number,
    page: number,
    filters: ApplicationsListFilters | AdminApplicationsListFilters | undefined,
    statusCondition: SQL,
  ): Promise<ApplicationsListResponse> => {
    if (limit < 1 || page < 1) {
      throw new HttpError(400, 'Limit and page must be positive numbers', 'VALIDATION_ERROR');
    }

    const safeLimit = Math.min(limit, APPLICATION_CONSTANTS.MAX_LIMIT);
    const offset = (page - 1) * safeLimit;

    const createdAfter = filters?.createdAfter ? new Date(filters.createdAfter) : undefined;
    const createdBefore = filters?.createdBefore ? new Date(filters.createdBefore) : undefined;
    const tags = filters?.tags;
    const userId = filters?.userId;
    const search = filters?.search;
    const sortBy = filters?.sortBy ?? 'createdAt';
    const sortOrder = filters?.sortOrder ?? 'desc';

    const conditions: SQL[] = [statusCondition];

    if (createdAfter !== undefined && createdBefore !== undefined) {
      conditions.push(between(application.createdAt, createdAfter, createdBefore));
    } else if (createdAfter !== undefined) {
      conditions.push(gte(application.createdAt, createdAfter));
    } else if (createdBefore !== undefined) {
      conditions.push(lte(application.createdAt, createdBefore));
    }

    if (userId != null) {
      conditions.push(eq(application.userId, userId));
    }

    if (tags != null && tags.length > 0) {
      conditions.push(arrayOverlaps(application.tags, tags));
    }

    if (search != null && search.trim() !== '') {
      const searchPattern = `%${search}%`;
      conditions.push(
        or(ilike(application.title, searchPattern), ilike(application.description, searchPattern))!,
      );
    }

    let orderByColumn:
      | typeof application.createdAt
      | typeof application.updatedAt
      | typeof application.title;
    switch (sortBy) {
      case 'title':
        orderByColumn = application.title;
        break;
      case 'updatedAt':
        orderByColumn = application.updatedAt;
        break;
      case 'createdAt':
      default:
        orderByColumn = application.createdAt;
        break;
    }

    const orderByClause = sortOrder === 'asc' ? asc(orderByColumn) : desc(orderByColumn);

    const whereClause = and(...conditions);

    const [value] = await this.db.select({ value: count() }).from(application).where(whereClause);

    const total = value.value;

    const data = await this.db
      .select({
        ...getColumns(application),
        userEmail: user.email,
        favoritesCount: count(userFavorite.userId),
      })
      .from(application)
      .innerJoin(user, eq(application.userId, user.id))
      .leftJoin(userFavorite, eq(application.id, userFavorite.applicationId))
      .where(whereClause)
      .groupBy(application.id, user.email)
      .orderBy(orderByClause)
      .limit(safeLimit)
      .offset(offset);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        page,
        limit: limit,
        count: data.length,
        total,
        totalPages,
      },
    };
  };

  getApplicationBySlug = async (slug: string): Promise<ApplicationResponse> => {
    const [result] = await this.db
      .select({
        ...getColumns(application),
        userEmail: user.email,
        favoritesCount: sql<number>`count(${userFavorite.userId})::int`,
      })
      .from(application)
      .innerJoin(user, eq(application.userId, user.id))
      .leftJoin(userFavorite, eq(application.id, userFavorite.applicationId))
      .where(and(eq(application.slug, slug), eq(application.status, 'APPROVED')))
      .groupBy(application.id, user.email)
      .limit(1);

    if (!result) {
      throw new HttpError(404, 'Application not found', 'NOT_FOUND');
    }

    return result;
  };

  createApplication = async (app: CreateApplicationRequest, actorUserId: string): Promise<void> => {
    if (!(await this.userExists(actorUserId))) {
      throw new HttpError(404, 'User not found', 'NOT_FOUND');
    }

    if (await this.slugExists(app.slug)) {
      throw new HttpError(409, 'Application with this slug already exists', 'DUPLICATE_SLUG');
    }

    await this.db.insert(application).values({
      ...app,
      userId: actorUserId,
      status: 'PENDING',
      rejectionReason: null,
    });

    return;
  };

  patchApplicationById = async (
    id: number,
    updates: PatchApplicationRequest,
    actorUserId: string,
  ): Promise<string> => {
    if (Object.keys(updates).length === 0) {
      await this.assertOwnership(id, actorUserId);
      return this.getApplicationSlugById(id);
    }
    let patched: { slug: string } | undefined;

    try {
      [patched] = await this.db
        .update(application)
        .set(updates)
        .where(and(eq(application.id, id), eq(application.userId, actorUserId)))
        .returning({ slug: application.slug });
    } catch (error) {
      const { message, constraint } = getDbErrorMessage(error);

      console.error('Database operation failed:', { message, constraint, originalError: error });

      throw new HttpError(409, 'Application with this slug already exists', 'DUPLICATE_SLUG');
    }

    if (!patched) {
      await this.assertOwnership(id, actorUserId);
      return this.getApplicationSlugById(id);
    }

    return patched.slug;
  };

  /**
   * Approve or reject an application (admin action)
   */
  reviewAdminApplicationById = async (
    id: number,
    input: ReviewApplicationRequest,
  ): Promise<void> => {
    const [existing] = await this.db
      .select()
      .from(application)
      .where(eq(application.id, id))
      .limit(1);

    if (!existing) {
      throw new HttpError(404, 'Application not found', 'NOT_FOUND');
    }

    if (existing.status === 'APPROVED' && input.status !== 'REMOVED') {
      throw new HttpError(
        409,
        'Approved applications can only transition to REMOVED',
        'INVALID_APPLICATION_STATE',
      );
    }

    if (
      (input.status === 'REJECTED' || input.status === 'REMOVED') &&
      !input.rejectionReason
    ) {
      throw new HttpError(
        400,
        'Rejection reason is required when rejecting or removing an application',
        'VALIDATION_ERROR',
      );
    }

    if (input.status === 'APPROVED' && input.rejectionReason != null) {
      throw new HttpError(
        400,
        'Rejection reason must be null when approving an application',
        'VALIDATION_ERROR',
      );
    }

    await this.db
      .update(application)
      .set({
        status: input.status,
        rejectionReason:
          input.status === 'REJECTED' || input.status === 'REMOVED'
            ? input.rejectionReason
            : null,
      })
      .where(eq(application.id, id))
      .returning();

    return;
  };

  deleteApplicationById = async (id: number, actorUserId: string): Promise<void> => {
    const [deleted] = await this.db
      .delete(application)
      .where(and(eq(application.id, id), eq(application.userId, actorUserId)))
      .returning();

    if (!deleted) {
      const [exists] = await this.db
        .select({ id: application.id })
        .from(application)
        .where(eq(application.id, id))
        .limit(1);

      if (exists) {
        throw new HttpError(403, 'Forbidden', 'FORBIDDEN');
      }
      throw new HttpError(404, 'Application not found', 'NOT_FOUND');
    }

    return;
  };

  getUserByApplicationId = async (appId: number): Promise<{ id: string; email: string }> => {
    const [result] = await this.db
      .select({ id: user.id, email: user.email })
      .from(application)
      .innerJoin(user, eq(application.userId, user.id))
      .where(eq(application.id, appId))
      .limit(1);
    return result;
  }

  private slugExists = async (slug: string): Promise<boolean> => {
    const [result] = await this.db
      .select({ id: application.id })
      .from(application)
      .where(eq(application.slug, slug))
      .limit(1);

    return !!result;
  };

  private getApplicationSlugById = async (applicationId: number): Promise<string> => {
    const [result] = await this.db
      .select({ slug: application.slug })
      .from(application)
      .where(eq(application.id, applicationId))
      .limit(1);

    if (!result) {
      throw new HttpError(404, 'Application not found', 'NOT_FOUND');
    }

    return result.slug;
  };

  private userExists = async (userId: string): Promise<boolean> => {
    const [result] = await this.db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    return !!result;
  };

  private assertOwnership = async (applicationId: number, actorUserId: string): Promise<void> => {
    const [app] = await this.db
      .select()
      .from(application)
      .where(eq(application.id, applicationId));

    if (!app) {
      throw new HttpError(404, 'Application not found', 'NOT_FOUND');
    }

    if (app.userId !== actorUserId) {
      throw new HttpError(403, 'Forbidden', 'FORBIDDEN');
    }

    return;
  };
}
