import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import ApplicationService from '../application.service.js';
import { HttpError } from '@/shared/middleware/error.middleware.js';
import { application } from '../application.model.js';
import type { InsertApplication } from '../application.model.js';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { createTestDatabase } from '@/shared/config/test-database.js';
import { PgliteDatabase } from 'drizzle-orm/pglite';
import { PGlite } from '@electric-sql/pglite';
import { author } from '@/authors/author.model.js';
import { eq } from 'drizzle-orm';
import { userFavorites } from '@/favorites/favorites.model.js';
import { user } from '@/users/user.model.js';

describe("ApplicationService", () => {
    let service: ApplicationService;
    let db: PgliteDatabase;
    let client: PGlite;
    let testAuthorId: number;
    const testUserId = 'app-favorites-user';

    beforeAll(async () => {
        const testDb = await createTestDatabase();
        db = testDb.db as unknown as PgliteDatabase;
        client = testDb.client;

        service = new ApplicationService(db as NodePgDatabase);

        // Create a test author
        const [createdAuthor] = await db.insert(author).values({
            name: "Test Author",
            email: "test@example.com"
        }).returning();
        testAuthorId = createdAuthor.id;

        await db.insert(user).values({
            id: testUserId,
            name: 'Application Favorites User',
            email: 'application-favorites-user@example.com',
        });
    });

    afterEach(async () => {
        await db.delete(userFavorites);
        await db.delete(application);
    });

    afterAll(async () => {
        await db.delete(user).where(eq(user.id, testUserId));
        await db.delete(author).where(eq(author.id, testAuthorId));
        await client.close();
    });

    // Helper to create an app
    const createTestApp = async (overrides: Partial<InsertApplication> = {}) => {
        const [created] = await db.insert(application).values({
            slug: `test-app-${Math.random().toString(36).substring(7)}`,
            title: 'Test Application',
            description: 'A test application',
            tags: ['test'],
            authorId: testAuthorId,
            ...overrides,
        }).returning();
        return created;
    };

    describe("getPaginatedApplications", () => {
        it("should throw error when limit is less than 1", async () => {
            await expect(service.getPaginatedApplications(0, 1))
                .rejects
                .toThrow(HttpError);
        });

        it("should throw error when page is less than 1", async () => {
            await expect(service.getPaginatedApplications(10, 0))
                .rejects
                .toThrow(HttpError);
        });

        it("should return paginated applications with correct structure", async () => {
            await createTestApp({ slug: 'app-1' });
            await createTestApp({ slug: 'app-2' });

            const result = await service.getPaginatedApplications(2, 1);

            expect(result).toHaveProperty('data');
            expect(result).toHaveProperty('total');
            expect(result.data).toHaveLength(2);
            expect(result.total).toBe(2);
        });

        it("should include favoritesCount for each application", async () => {
            const firstApp = await createTestApp({ slug: 'favorite-count-app-1' });
            const secondApp = await createTestApp({ slug: 'favorite-count-app-2' });

            await db.insert(userFavorites).values({
                userId: testUserId,
                applicationId: firstApp.id,
            });

            const result = await service.getPaginatedApplications(10, 1);

            const first = result.data.find((app) => app.id === firstApp.id);
            const second = result.data.find((app) => app.id === secondApp.id);

            expect(first?.favoritesCount).toBe(1);
            expect(second?.favoritesCount).toBe(0);
        });

        it("should cap limit at MAX_LIMIT", async () => {
            // Insert 105 apps
            const apps = Array.from({ length: 105 }).map((_, i) => ({
                slug: `limit-test-${i}`,
                title: `App ${i}`,
                description: 'desc',
                tags: [],
                authorId: testAuthorId
            }));
            await db.insert(application).values(apps);

            // Request 500, but MAX_LIMIT is 100
            const result = await service.getPaginatedApplications(500, 1);

            expect(result.data).toHaveLength(100);
            expect(result.total).toBe(105);
        });

        it("should calculate correct offset for pagination", async () => {
            for(let i=0; i<15; i++) {
                await createTestApp({ 
                    slug: `offset-test-${i}`, 
                    title: `App ${i.toString().padStart(2, '0')}` 
                });
            }

            // Sort by title ASC to be deterministic: App 00, App 01, ... App 14
            // Page 2 with limit 5 should give App 05 to App 09
            const result = await service.getPaginatedApplications(5, 2, { sortBy: 'title', sortOrder: 'asc' });

            expect(result.data).toHaveLength(5);
            expect(result.data[0].title).toBe('App 05');
            expect(result.data[4].title).toBe('App 09');
        });
    });

    describe("getApplicationBySlug", () => {
        it("should return application when found", async () => {
            const created = await createTestApp({ slug: 'test-slug' });
            const result = await service.getApplicationBySlug('test-slug');
            expect(result.id).toBe(created.id);
        });

        it("should throw 404 when application not found", async () => {
            await expect(service.getApplicationBySlug('nonexistent'))
                .rejects
                .toThrow(HttpError);
        });
    });

    describe("createApplication", () => {
        it("should create application when slug is unique", async () => {
            const newApp: InsertApplication = {
                slug: 'new-unique-app',
                title: 'New Application',
                description: 'A new app',
                tags: ['new'],
                authorId: testAuthorId,
            };

            const result = await service.createApplication(newApp);

            expect(result.slug).toBe('new-unique-app');
            
            // Verify in DB
            const [inDb] = await db.select().from(application).where(eq(application.id, result.id));
            expect(inDb).toBeDefined();
        });

        it("should throw 409 when slug already exists", async () => {
            await createTestApp({ slug: 'existing-slug' });

            const newApp: InsertApplication = {
                slug: 'existing-slug',
                title: 'Duplicate',
                description: 'A new app',
                tags: [],
                authorId: testAuthorId,
            };

            await expect(service.createApplication(newApp))
                .rejects
                .toMatchObject({
                    statusCode: 409,
                    code: 'DUPLICATE_SLUG',
                });
        });
    });

    describe("deleteApplicationById", () => {
        it("should delete application when it exists", async () => {
            const app = await createTestApp();
            
            const result = await service.deleteApplicationById(app.id);
            expect(result.id).toBe(app.id);

            // Verify in DB
            const inDb = await db.select().from(application).where(eq(application.id, app.id));
            expect(inDb).toHaveLength(0);
        });

        it("should throw 404 when application not found", async () => {
            await expect(service.deleteApplicationById(99999))
                .rejects
                .toMatchObject({
                    statusCode: 404,
                    code: 'NOT_FOUND',
                });
        });
    });

    describe("patchApplicationById", () => {
        it("should update application when it exists", async () => {
            const app = await createTestApp({ title: 'Old Title' });
            
            const result = await service.patchApplicationById(app.id, { title: 'New Title' });
            
            expect(result.title).toBe('New Title');
            
            // Verify in DB
            const [inDb] = await db.select().from(application).where(eq(application.id, app.id));
            expect(inDb.title).toBe('New Title');
        });

        it("should throw 404 when application not found", async () => {
            await expect(service.patchApplicationById(99999, { title: 'New Title' }))
                .rejects
                .toMatchObject({
                    statusCode: 404,
                    code: 'NOT_FOUND',
                });
        });

        it("should throw 409 when updating to an existing slug", async () => {
            await createTestApp({ slug: 'slug-a' });
            const appB = await createTestApp({ slug: 'slug-b' });

            await expect(service.patchApplicationById(appB.id, { slug: 'slug-a' }))
                .rejects
                .toMatchObject({
                    statusCode: 409,
                    code: 'DUPLICATE_SLUG',
                });
        });

        it("should allow updating to the same slug", async () => {
            const app = await createTestApp({ slug: 'my-slug', title: 'Old' });

            const result = await service.patchApplicationById(app.id, { slug: 'my-slug', title: 'New' });

            expect(result.title).toBe('New');
            expect(result.slug).toBe('my-slug');
        });

        it("should allow partial updates", async () => {
            const app = await createTestApp({ title: 'Title', description: 'Desc' });

            const result = await service.patchApplicationById(app.id, { description: 'New Desc' });

            expect(result.description).toBe('New Desc');
            expect(result.title).toBe('Title');
        });
    });
})