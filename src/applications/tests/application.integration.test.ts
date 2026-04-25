import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { application, user } from '../application.model.js';
import type { InsertApplication } from '../application.model.js';
import ApplicationService from '../application.service.js';
import { HttpError } from '@/shared/middleware/error.middleware.js';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { createTestDatabase } from '@/shared/config/test-database.js';
import { PgliteDatabase } from 'drizzle-orm/pglite';
import { PGlite } from '@electric-sql/pglite';

describe('ApplicationService Integration Tests', () => {
  let service: ApplicationService;
  let testUserId: string;
  let db: PgliteDatabase;
  let client: PGlite;

  beforeAll(async () => {
    const testDb = await createTestDatabase();
    db = testDb.db;
    client = testDb.client;

    service = new ApplicationService(db as unknown as NodePgDatabase);

    testUserId = 'integration-test-user';

    await db.insert(user).values({
      id: testUserId,
      name: 'Integration User',
      email: 'test@gmail.com',
      emailVerified: true,
    });
  });

  // Clean up test data after each test
  afterEach(async () => {
    await db.delete(application);
  });

  afterAll(async () => {
    await db.delete(user).where(eq(user.id, testUserId));
    await client.close();
  });

  // Helper to create test application and track for cleanup
  const createTestApp = async (overrides: Partial<InsertApplication> = {}) => {
    const [created] = await db
      .insert(application)
      .values({
        slug: `test-app-${Math.random().toString(36).substring(7)}`,
        title: 'Test App',
        description: 'Test description',
        tags: ['test'],
        userId: testUserId,
        isApproved: 'APPROVED',
        rejectionReason: null,
        ...overrides,
      })
      .returning();
    return created;
  };

  describe('getPaginatedApplications - Query Tests', () => {
    it('should correctly paginate results', async () => {
      // Create 5 test applications
      for (let i = 1; i <= 5; i++) {
        await createTestApp({ slug: `pagination-test-${i}`, title: `App ${i}` });
      }

      // Get first page (2 items)
      const page1 = await service.getPaginatedApplications(2, 1);
      expect(page1.data.length).toBe(2);
      expect(page1.total).toBeGreaterThanOrEqual(5);

      // Get second page
      const page2 = await service.getPaginatedApplications(2, 2);
      expect(page2.data.length).toBe(2);

      // Ensure different results
      expect(page1.data[0].id).not.toBe(page2.data[0].id);
    });

    it('should filter by search term in title', async () => {
      await createTestApp({ slug: 'search-test-unique-xyz', title: 'Unique XYZ Application' });
      await createTestApp({ slug: 'search-test-other', title: 'Other Application' });

      const result = await service.getPaginatedApplications(10, 1, {
        search: 'Unique XYZ',
      });

      expect(result.data.some((app) => app.slug === 'search-test-unique-xyz')).toBe(true);
    });

    it('should filter by tags', async () => {
      await createTestApp({
        slug: 'tag-test-1',
        title: 'Tagged App',
        tags: ['special-tag', 'test'],
      });

      const result = await service.getPaginatedApplications(10, 1, {
        tags: ['special-tag'],
      });

      expect(result.data.some((app) => app.tags?.includes('special-tag'))).toBe(true);
    });

    it('should filter by userId', async () => {
      await createTestApp({ slug: 'user-1-app', userId: testUserId });

      const result = await service.getPaginatedApplications(10, 1, {
        userId: testUserId,
      });

      expect(result.total).toBe(1);
      expect(result.data[0].userId).toBe(testUserId);
    });

    it('should filter by date range', async () => {
      const oldDate = new Date('2020-01-01');
      const newDate = new Date('2024-01-01');

      await createTestApp({ slug: 'old-app', createdAt: oldDate });
      await createTestApp({ slug: 'new-app', createdAt: newDate });

      const result = await service.getPaginatedApplications(10, 1, {
        createdAfter: new Date('2023-01-01'),
        createdBefore: new Date('2025-01-01'),
      });

      expect(result.total).toBe(1);
      expect(result.data[0].slug).toBe('new-app');
    });

    it('should sort by createdAt descending by default', async () => {
      const now = new Date();
      const earlier = new Date(now.getTime() - 1000);

      await createTestApp({ slug: 'sort-test-first', title: 'First', createdAt: earlier });
      await createTestApp({ slug: 'sort-test-second', title: 'Second', createdAt: now });

      const result = await service.getPaginatedApplications(10, 1);

      // Most recent should be first (Second)
      expect(result.data[0].slug).toBe('sort-test-second');
      expect(result.data[1].slug).toBe('sort-test-first');
    });
  });

  describe('getApplicationBySlug - Query Tests', () => {
    it('should find application by exact slug', async () => {
      const testApp = await createTestApp({ slug: 'exact-slug-test' });

      const result = await service.getApplicationBySlug('exact-slug-test');

      expect(result.slug).toBe('exact-slug-test');
      expect(result.id).toBe(testApp.id);
    });

    it('should throw 404 for non-existent slug', async () => {
      await expect(service.getApplicationBySlug('does-not-exist-12345')).rejects.toThrow(HttpError);
    });
  });

  describe('createApplication - Query Tests', () => {
    it('should insert application into database', async () => {
      const result = await service.createApplication(
        {
          slug: 'create-integration-test',
          title: 'Integration Test App',
          description: 'Created via integration test',
          tags: ['integration'],
        },
        testUserId,
      );

      // Verify it's actually in the database
      const [fromDb] = await db.select().from(application).where(eq(application.id, result.id));

      expect(fromDb).toBeDefined();
      expect(fromDb.slug).toBe('create-integration-test');
    });

    it('should reject duplicate slugs', async () => {
      await createTestApp({ slug: 'duplicate-slug-test' });

      await expect(
        service.createApplication(
          {
            slug: 'duplicate-slug-test', // Same slug!
            title: 'Duplicate',
            description: 'Should fail',
            tags: [],
          },
          testUserId,
        ),
      ).rejects.toMatchObject({
        statusCode: 409,
        code: 'DUPLICATE_SLUG',
      });
    });
  });

  describe('patchApplicationById - Query Tests', () => {
    it('should update application fields in database', async () => {
      const app = await createTestApp({ title: 'Old Title', description: 'Old Desc' });

      const updated = await service.patchApplicationById(
        app.id,
        {
          title: 'New Title',
        },
        testUserId,
      );

      expect(updated.title).toBe('New Title');
      expect(updated.description).toBe('Old Desc'); // Should remain unchanged

      // Verify in DB
      const [inDb] = await db.select().from(application).where(eq(application.id, app.id));
      expect(inDb.title).toBe('New Title');
    });

    it('should fail when updating to existing slug', async () => {
      await createTestApp({ slug: 'taken-slug' });
      const app = await createTestApp({ slug: 'original-slug' });

      await expect(
        service.patchApplicationById(
          app.id,
          {
            slug: 'taken-slug',
          },
          testUserId,
        ),
      ).rejects.toMatchObject({
        statusCode: 409,
        code: 'DUPLICATE_SLUG',
      });
    });

    it('should throw 404 for non-existent application', async () => {
      await expect(
        service.patchApplicationById(0, { title: 'New' }, testUserId),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('deleteApplicationById - Query Tests', () => {
    it('should actually remove from database', async () => {
      const testApp = await createTestApp({ slug: 'delete-test' });
      const id = testApp.id;

      await service.deleteApplicationById(id, testUserId);

      // Verify it's gone
      const [fromDb] = await db.select().from(application).where(eq(application.id, id));

      expect(fromDb).toBeUndefined();
    });

    it('should throw when removing an non-existing application', async () => {
      await expect(service.deleteApplicationById(0, testUserId)).rejects.toMatchObject({
        statusCode: 404,
        code: 'NOT_FOUND',
      });
    });
  });
});
