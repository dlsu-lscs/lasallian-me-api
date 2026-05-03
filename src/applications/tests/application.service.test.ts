import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import ApplicationService from '../application.service.js';
import { HttpError } from '@/shared/middleware/error.middleware.js';
import { application, user } from '../application.model.js';
import type { InsertApplication } from '../application.model.js';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { createTestDatabase } from '@/shared/config/test-database.js';
import { PgliteDatabase } from 'drizzle-orm/pglite';
import { PGlite } from '@electric-sql/pglite';
import { eq } from 'drizzle-orm';
import { userFavorite } from '@/favorites/favorites.model.js';

describe('ApplicationService', () => {
  let service: ApplicationService;
  let db: PgliteDatabase;
  let client: PGlite;
  const testUserId = 'app-favorites-user';
  const otherUserId = 'app-other-user';

  beforeAll(async () => {
    const testDb = await createTestDatabase();
    db = testDb.db as unknown as PgliteDatabase;
    client = testDb.client;

    service = new ApplicationService(db as NodePgDatabase);

    await db.insert(user).values([
      {
        id: testUserId,
        name: 'Application Favorites User',
        email: 'application-favorites-user@example.com',
        emailVerified: true,
      },
      {
        id: otherUserId,
        name: 'Other Application User',
        email: 'other-application-user@example.com',
        emailVerified: true,
      },
    ]);
  });

  afterEach(async () => {
    await db.delete(userFavorite);
    await db.delete(application);
  });

  afterAll(async () => {
    await db.delete(userFavorite);
    await db.delete(application);
    await db.delete(user).where(eq(user.id, testUserId));
    await db.delete(user).where(eq(user.id, otherUserId));
    await client.close();
  });

  const createTestApp = async (overrides: Partial<InsertApplication> = {}) => {
    const [created] = await db
      .insert(application)
      .values({
        slug: `test-app-${Math.random().toString(36).substring(7)}`,
        title: 'Test Application',
        description: 'A test application',
        githubLink: 'https://github.com/test/test-app',
        tags: ['test'],
        userId: testUserId,
        isApproved: 'APPROVED',
        rejectionReason: null,
        ...overrides,
      })
      .returning();
    return created;
  };

  describe('getPaginatedApplications', () => {
    it('should throw error when limit is less than 1', async () => {
      await expect(service.getPaginatedApplications(0, 1)).rejects.toThrow(HttpError);
    });

    it('should throw error when page is less than 1', async () => {
      await expect(service.getPaginatedApplications(10, 0)).rejects.toThrow(HttpError);
    });

    it('should return paginated applications with correct structure', async () => {
      await createTestApp({ slug: 'app-1' });
      await createTestApp({ slug: 'app-2' });

      const result = await service.getPaginatedApplications(2, 1);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.data[0]).toHaveProperty('userEmail');
    });

    it('should include favoritesCount for each application', async () => {
      const firstApp = await createTestApp({ slug: 'favorite-count-app-1' });
      const secondApp = await createTestApp({ slug: 'favorite-count-app-2' });

      await db.insert(userFavorite).values({
        userId: testUserId,
        applicationId: firstApp.id,
      });

      const result = await service.getPaginatedApplications(10, 1);

      const first = result.data.find((app) => app.id === firstApp.id);
      const second = result.data.find((app) => app.id === secondApp.id);

      expect(first?.favoritesCount).toBe(1);
      expect(second?.favoritesCount).toBe(0);
    });

    it('should filter by createdAfter only', async () => {
      await createTestApp({ slug: 'created-after-old', createdAt: new Date('2020-01-01') });
      await createTestApp({ slug: 'created-after-new', createdAt: new Date('2024-01-01') });

      const result = await service.getPaginatedApplications(10, 1, {
        createdAfter: new Date('2023-01-01'),
      });

      expect(result.meta.total).toBe(1);
      expect(result.data[0].slug).toBe('created-after-new');
    });

    it('should filter by createdBefore only', async () => {
      await createTestApp({ slug: 'created-before-old', createdAt: new Date('2020-01-01') });
      await createTestApp({ slug: 'created-before-new', createdAt: new Date('2024-01-01') });

      const result = await service.getPaginatedApplications(10, 1, {
        createdBefore: new Date('2021-01-01'),
      });

      expect(result.meta.total).toBe(1);
      expect(result.data[0].slug).toBe('created-before-old');
    });

    it('should filter by search and tags together', async () => {
      await createTestApp({
        slug: 'combo-match',
        title: 'Combo Match App',
        tags: ['combo'],
      });
      await createTestApp({
        slug: 'combo-title-only',
        title: 'Combo Match App',
        tags: ['other'],
      });
      await createTestApp({
        slug: 'combo-tag-only',
        title: 'Other Title',
        tags: ['combo'],
      });

      const result = await service.getPaginatedApplications(10, 1, {
        search: 'Combo Match',
        tags: ['combo'],
      });

      expect(result.meta.total).toBe(1);
      expect(result.data[0].slug).toBe('combo-match');
    });

    it('should cap limit at MAX_LIMIT', async () => {
      // Insert 105 apps
      const apps = Array.from({ length: 105 }).map((_, i) => ({
        slug: `limit-test-${i}`,
        title: `App ${i}`,
        description: 'desc',
        githubLink: 'https://github.com/test/test-app',
        tags: [],
        userId: testUserId,
        isApproved: 'APPROVED' as const,
        rejectionReason: null,
      }));
      await db.insert(application).values(apps);

      // Request 500, but MAX_LIMIT is 100
      const result = await service.getPaginatedApplications(500, 1);

      expect(result.data).toHaveLength(100);
      expect(result.meta.total).toBe(105);
    });

    it('should calculate correct offset for pagination', async () => {
      for (let i = 0; i < 15; i++) {
        await createTestApp({
          slug: `offset-test-${i}`,
          title: `App ${i.toString().padStart(2, '0')}`,
        });
      }

      // Sort by title ASC to be deterministic: App 00, App 01, ... App 14
      // Page 2 with limit 5 should give App 05 to App 09
      const result = await service.getPaginatedApplications(5, 2, {
        sortBy: 'title',
        sortOrder: 'asc',
      });

      expect(result.data).toHaveLength(5);
      expect(result.data[0].title).toBe('App 05');
      expect(result.data[4].title).toBe('App 09');
    });

    it('should only return approved applications', async () => {
      await createTestApp({ slug: 'approved-app', isApproved: 'APPROVED' });
      await createTestApp({ slug: 'pending-app', isApproved: 'PENDING' });

      const result = await service.getPaginatedApplications(10, 1);

      expect(result.data.some((app) => app.slug === 'approved-app')).toBe(true);
      expect(result.data.some((app) => app.slug === 'pending-app')).toBe(false);
    });
  });

  describe('getApplicationBySlug', () => {
    it('should return application when found', async () => {
      const created = await createTestApp({ slug: 'test-slug' });
      const result = await service.getApplicationBySlug('test-slug');
      expect(result.id).toBe(created.id);
    });

    it('should throw 404 when slug exists but application is not approved', async () => {
      await createTestApp({ slug: 'pending-slug', isApproved: 'PENDING' });

      await expect(service.getApplicationBySlug('pending-slug')).rejects.toThrow(HttpError);
    });

    it('should throw 404 when application not found', async () => {
      await expect(service.getApplicationBySlug('nonexistent')).rejects.toThrow(HttpError);
    });
  });

  describe('createApplication', () => {
    it('should create application when slug is unique', async () => {
      const newApp = {
        slug: 'new-unique-app',
        title: 'New Application',
        description: 'A new app',
        githubLink: 'https://github.com/test/test-app',
        tags: ['new'],
      };

      expect(await service.createApplication(newApp, testUserId)).toBeUndefined();

      // Verify in DB
      const [inDb] = await db.select().from(application).where(eq(application.slug, newApp.slug));
      expect(inDb).toBeDefined();
    });

    it('should throw 409 when slug already exists', async () => {
      await createTestApp({ slug: 'existing-slug' });

      const newApp = {
        slug: 'existing-slug',
        title: 'Duplicate',
        description: 'A new app',
        githubLink: 'https://github.com/test/test-app',
        tags: [],
      };

      await expect(service.createApplication(newApp, testUserId)).rejects.toMatchObject({
        statusCode: 409,
        code: 'DUPLICATE_SLUG',
      });
    });

    it('should throw 404 when authenticated user does not exist', async () => {
      const newApp = {
        slug: 'missing-user-app',
        title: 'Missing User',
        description: 'Should fail because authenticated user does not exist',
        githubLink: 'https://github.com/test/test-app',
        tags: [],
      };

      await expect(service.createApplication(newApp, 'missing-user-id')).rejects.toMatchObject({
        statusCode: 404,
        code: 'NOT_FOUND',
      });
    });
  });

  describe('deleteApplicationById', () => {
    it('should delete application when it exists', async () => {
      const app = await createTestApp();

      expect(await service.deleteApplicationById(app.id, testUserId)).toBeUndefined();

      // Verify in DB
      const inDb = await db.select().from(application).where(eq(application.id, app.id));
      expect(inDb).toHaveLength(0);
    });

    it('should throw 404 when application not found', async () => {
      await expect(service.deleteApplicationById(99999, testUserId)).rejects.toMatchObject({
        statusCode: 404,
        code: 'NOT_FOUND',
      });
    });

    it("should throw 403 when deleting another user's application", async () => {
      const app = await createTestApp({ userId: otherUserId });

      await expect(service.deleteApplicationById(app.id, testUserId)).rejects.toMatchObject({
        statusCode: 403,
        code: 'FORBIDDEN',
      });
    });
  });

  describe('reviewAdminApplicationById', () => {
    it('should approve a pending application and clear rejection reason', async () => {
      const app = await createTestApp({
        isApproved: 'PENDING',
        rejectionReason: 'legacy reason',
      });

      await service.reviewAdminApplicationById(app.id, {
        isApproved: 'APPROVED',
        rejectionReason: null,
      });

      const [reviewed] = await db.select().from(application).where(eq(application.id, app.id));

      expect(reviewed.isApproved).toBe('APPROVED');
      expect(reviewed.rejectionReason).toBeNull();
    });

    it('should reject a pending application with rejection reason', async () => {
      const app = await createTestApp({ isApproved: 'PENDING' });

      await service.reviewAdminApplicationById(app.id, {
        isApproved: 'REJECTED',
        rejectionReason: 'Missing details',
      });

      const [reviewed] = await db.select().from(application).where(eq(application.id, app.id));

      expect(reviewed.isApproved).toBe('REJECTED');
      expect(reviewed.rejectionReason).toBe('Missing details');
    });

    it('should approve a rejected application when admin changes mind', async () => {
      const app = await createTestApp({
        isApproved: 'REJECTED',
        rejectionReason: 'Initial rejection',
      });

      await service.reviewAdminApplicationById(app.id, {
        isApproved: 'APPROVED',
        rejectionReason: null,
      });

      const [reviewed] = await db.select().from(application).where(eq(application.id, app.id));

      expect(reviewed.isApproved).toBe('APPROVED');
      expect(reviewed.rejectionReason).toBeNull();
    });

    it('should remove an approved application during admin review', async () => {
      const app = await createTestApp({
        isApproved: 'APPROVED',
        rejectionReason: null,
      });

      await service.reviewAdminApplicationById(app.id, {
        isApproved: 'REMOVED',
        rejectionReason: 'Removed after admin review',
      });

      const [reviewed] = await db.select().from(application).where(eq(application.id, app.id));

      expect(reviewed.isApproved).toBe('REMOVED');
      expect(reviewed.rejectionReason).toBe('Removed after admin review');
    });

    it('should throw 400 when rejecting without rejection reason', async () => {
      const app = await createTestApp({ isApproved: 'PENDING' });

      await expect(
        service.reviewAdminApplicationById(app.id, {
          isApproved: 'REJECTED',
          rejectionReason: null,
        }),
      ).rejects.toMatchObject({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
      });
    });

    it('should throw 400 when removing without rejection reason', async () => {
      const app = await createTestApp({ isApproved: 'APPROVED' });

      await expect(
        service.reviewAdminApplicationById(app.id, {
          isApproved: 'REMOVED',
          rejectionReason: null,
        }),
      ).rejects.toMatchObject({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
      });
    });

    it('should throw 400 when approving with non-null rejection reason', async () => {
      const app = await createTestApp({ isApproved: 'PENDING' });

      await expect(
        service.reviewAdminApplicationById(app.id, {
          isApproved: 'APPROVED',
          rejectionReason: 'should be null',
        }),
      ).rejects.toMatchObject({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
      });
    });

    it('should throw 409 when approved application is reviewed to non-removed status', async () => {
      const app = await createTestApp({ isApproved: 'APPROVED' });

      await expect(
        service.reviewAdminApplicationById(app.id, {
          isApproved: 'REJECTED',
          rejectionReason: 'late rejection',
        }),
      ).rejects.toMatchObject({
        statusCode: 409,
        code: 'INVALID_APPLICATION_STATE',
      });
    });

    it('should throw 404 when application is not found', async () => {
      await expect(
        service.reviewAdminApplicationById(99999, {
          isApproved: 'APPROVED',
          rejectionReason: null,
        }),
      ).rejects.toMatchObject({
        statusCode: 404,
        code: 'NOT_FOUND',
      });
    });
  });

  describe('patchApplicationById', () => {
    it('should update application when it exists', async () => {
      const app = await createTestApp({ title: 'Old Title' });

      await service.patchApplicationById(app.id, { title: 'New Title' }, testUserId);

      const result = await service.getApplicationBySlug(app.slug);

      expect(result.title).toBe('New Title');

      // Verify in DB
      const [inDb] = await db.select().from(application).where(eq(application.id, app.id));
      expect(inDb.title).toBe('New Title');
    });

    it('should throw 404 when application not found', async () => {
      await expect(
        service.patchApplicationById(99999, { title: 'New Title' }, testUserId),
      ).rejects.toMatchObject({
        statusCode: 404,
        code: 'NOT_FOUND',
      });
    });

    it('should throw 409 when updating to an existing slug', async () => {
      await createTestApp({ slug: 'slug-a' });
      const appB = await createTestApp({ slug: 'slug-b' });

      await expect(
        service.patchApplicationById(appB.id, { slug: 'slug-a' }, testUserId),
      ).rejects.toMatchObject({
        statusCode: 409,
        code: 'DUPLICATE_SLUG',
      });
    });

    it('should allow updating to the same slug', async () => {
      const app = await createTestApp({ slug: 'my-slug', title: 'Old' });

      await service.patchApplicationById(app.id, { slug: 'my-slug', title: 'New' }, testUserId);

      const result = await service.getApplicationBySlug('my-slug');

      expect(result.title).toBe('New');
      expect(result.slug).toBe('my-slug');
    });

    it('should allow partial updates', async () => {
      const app = await createTestApp({ title: 'Title', description: 'Desc' });

      await service.patchApplicationById(app.id, { description: 'New Desc' }, testUserId);

      const result = await service.getApplicationBySlug(app.slug);

      expect(result.description).toBe('New Desc');
      expect(result.title).toBe('Title');
    });

    it("should throw 403 when updating another user's application", async () => {
      const app = await createTestApp({ title: 'Title', userId: otherUserId });

      await expect(
        service.patchApplicationById(app.id, { title: 'New Title' }, testUserId),
      ).rejects.toMatchObject({
        statusCode: 403,
        code: 'FORBIDDEN',
      });
    });

    it('should return current application for empty patch', async () => {
      const app = await createTestApp({ title: 'Title' });

      await service.patchApplicationById(app.id, {}, testUserId);

      const result = await service.getApplicationBySlug(app.slug);

      expect(result.id).toBe(app.id);
      expect(result.title).toBe('Title');
    });
  });
});
