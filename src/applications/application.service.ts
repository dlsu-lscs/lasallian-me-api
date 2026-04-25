import type { SelectApplication } from './application.model.js';
import type { ApplicationsListFilters } from './dto/index.js';
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
import type { CreateApplicationInput, PatchApplicationInput } from './application.controller.js';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { userFavorite, application, user } from './application.model.js';
import type { ReviewApplicationRequest } from './dto/review-application-request.dto.js';

export type ApplicationListItem = SelectApplication & {
  favoritesCount: number;
  userEmail: string;
};

export type ApplicationsList = {
  data: ApplicationListItem[];
  total: number;
};

export interface IApplicationService {
  getPaginatedApplications(
    limit: number,
    page: number,
    filters?: ApplicationsListFilters,
  ): Promise<ApplicationsList>;
  getAdminApplications(
    limit: number,
    page: number,
    filters?: AdminApplicationsListFilters,
  ): Promise<ApplicationsList>;
  getApplicationBySlug(slug: string): Promise<ApplicationListItem>;
  createApplication(app: CreateApplicationInput, actorUserId: string): Promise<SelectApplication>;
  patchApplicationById(
    id: number,
    updates: PatchApplicationInput,
    actorUserId: string,
  ): Promise<SelectApplication>;
  reviewAdminApplicationById(
    id: number,
    input: ReviewApplicationRequest,
  ): Promise<SelectApplication>;
  deleteApplicationById(id: number, actorUserId: string): Promise<SelectApplication>;
}

export default class ApplicationService implements IApplicationService {
  constructor(private readonly db: NodePgDatabase) {}

  getPaginatedApplications = async (
    limit: number = APPLICATION_CONSTANTS.DEFAULT_LIMIT,
    page: number = APPLICATION_CONSTANTS.DEFAULT_PAGE,
    filters?: ApplicationsListFilters,
  ): Promise<ApplicationsList> => {
    return this.getFilteredApplications(
      limit,
      page,
      filters,
      eq(application.isApproved, 'APPROVED'),
    );
  };

  getAdminApplications = async (
    limit: number = APPLICATION_CONSTANTS.DEFAULT_LIMIT,
    page: number = APPLICATION_CONSTANTS.DEFAULT_PAGE,
    filters?: AdminApplicationsListFilters,
  ): Promise<ApplicationsList> => {
    const statusCondition = filters?.status
      ? eq(application.isApproved, filters.status)
      : or(
          eq(application.isApproved, 'PENDING'),
          eq(application.isApproved, 'REJECTED'),
          eq(application.isApproved, 'REMOVED'),
        )!;

    return this.getFilteredApplications(limit, page, filters, statusCondition);
  };

  private getFilteredApplications = async (
    limit: number,
    page: number,
    filters: ApplicationsListFilters | AdminApplicationsListFilters | undefined,
    statusCondition: SQL,
  ): Promise<ApplicationsList> => {
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

    const [{ value: total }] = await this.db
      .select({ value: count() })
      .from(application)
      .where(whereClause);

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

    return { data, total };
  };

  getApplicationBySlug = async (slug: string): Promise<ApplicationListItem> => {
    const [result] = await this.db
      .select({
        ...getColumns(application),
        userEmail: user.email,
        favoritesCount: sql<number>`count(${userFavorite.userId})::int`,
      })
      .from(application)
      .innerJoin(user, eq(application.userId, user.id))
      .leftJoin(userFavorite, eq(application.id, userFavorite.applicationId))
      .where(and(eq(application.slug, slug), eq(application.isApproved, 'APPROVED')))
      .groupBy(application.id, user.email)
      .limit(1);

    if (!result) {
      throw new HttpError(404, 'Application not found', 'NOT_FOUND');
    }

    return result;
  };

  createApplication = async (
    app: CreateApplicationInput,
    actorUserId: string,
  ): Promise<SelectApplication> => {
    if (!(await this.userExists(actorUserId))) {
      throw new HttpError(404, 'User not found', 'NOT_FOUND');
    }

    if (await this.slugExists(app.slug)) {
      throw new HttpError(409, 'Application with this slug already exists', 'DUPLICATE_SLUG');
    }

    const [created] = await this.db
      .insert(application)
      .values({
        ...app,
        userId: actorUserId,
        isApproved: 'PENDING',
        rejectionReason: null,
      })
      .returning();

    return created;
  };

  patchApplicationById = async (
    id: number,
    updates: PatchApplicationInput,
    actorUserId: string,
  ): Promise<SelectApplication> => {
    if (Object.keys(updates).length === 0) {
      return this.assertOwnership(id, actorUserId);
    }

    if (updates.slug) {
      const [existingWithSlug] = await this.db
        .select({ id: application.id })
        .from(application)
        .where(eq(application.slug, updates.slug))
        .limit(1);

      if (existingWithSlug && existingWithSlug.id !== id) {
        throw new HttpError(409, 'Application with this slug already exists', 'DUPLICATE_SLUG');
      }
    }

    const [patched] = await this.db
      .update(application)
      .set(updates)
      .where(and(eq(application.id, id), eq(application.userId, actorUserId)))
      .returning();

    if (!patched) {
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

    return patched;
  };

  /**
   * Approve or reject an application (admin action)
   */
  reviewAdminApplicationById = async (
    id: number,
    input: ReviewApplicationRequest,
  ): Promise<SelectApplication> => {
    const [existing] = await this.db
      .select()
      .from(application)
      .where(eq(application.id, id))
      .limit(1);

    if (!existing) {
      throw new HttpError(404, 'Application not found', 'NOT_FOUND');
    }

    if (existing.isApproved === 'APPROVED' && input.isApproved !== 'REMOVED') {
      throw new HttpError(
        409,
        'Approved applications can only transition to REMOVED',
        'INVALID_APPLICATION_STATE',
      );
    }

    if (
      (input.isApproved === 'REJECTED' || input.isApproved === 'REMOVED') &&
      !input.rejectionReason
    ) {
      throw new HttpError(
        400,
        'Rejection reason is required when rejecting or removing an application',
        'VALIDATION_ERROR',
      );
    }

    if (input.isApproved === 'APPROVED' && input.rejectionReason != null) {
      throw new HttpError(
        400,
        'Rejection reason must be null when approving an application',
        'VALIDATION_ERROR',
      );
    }

    const [reviewed] = await this.db
      .update(application)
      .set({
        isApproved: input.isApproved,
        rejectionReason:
          input.isApproved === 'REJECTED' || input.isApproved === 'REMOVED'
            ? input.rejectionReason
            : null,
      })
      .where(eq(application.id, id))
      .returning();

    return reviewed;
  };

  /**
   * Delete an application owned by the authenticated user
   */
  deleteApplicationById = async (id: number, actorUserId: string): Promise<SelectApplication> => {
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

    return deleted;
  };

  private slugExists = async (slug: string): Promise<boolean> => {
    const [result] = await this.db
      .select({ id: application.id })
      .from(application)
      .where(eq(application.slug, slug))
      .limit(1);

    return !!result;
  };

  private userExists = async (userId: string): Promise<boolean> => {
    const [result] = await this.db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    return !!result;
  };

  private assertOwnership = async (
    applicationId: number,
    actorUserId: string,
  ): Promise<SelectApplication> => {
    const [app] = await this.db
      .select()
      .from(application)
      .where(eq(application.id, applicationId))
      .limit(1);

    if (!app) {
      throw new HttpError(404, 'Application not found', 'NOT_FOUND');
    }

    if (app.userId !== actorUserId) {
      throw new HttpError(403, 'Forbidden', 'FORBIDDEN');
    }

    return app;
  };
}
