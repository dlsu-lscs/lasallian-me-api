import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { application } from '../application.model.js';
import type { InsertApplication } from '../application.model.js';
import ApplicationService from '../application.service.js';
import { HttpError } from '@/shared/middleware/error.middleware.js';
import { eq } from 'drizzle-orm';
import { author } from '@/authors/author.model.js';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { createTestDatabase } from '@/shared/config/test-database.js';
import { PgliteDatabase } from 'drizzle-orm/pglite';
import { PGlite } from '@electric-sql/pglite';
  
describe("ApplicationService Integration Tests", () => {
    let service: ApplicationService;
    let testAuthorId: number;
    let db: PgliteDatabase;
    let client: PGlite;

    beforeAll(async () => {
        const testDb = await createTestDatabase();
        db = testDb.db as unknown as PgliteDatabase;
        client = testDb.client;

        service = new ApplicationService(db as unknown as NodePgDatabase);
        const [createdAuthor] = await db.insert(author).values({name:"test-es", email: "test@gmail.com"}).returning();
        testAuthorId = createdAuthor.id;
    });

    // Clean up test data after each test
    afterEach(async () => {
        await db.delete(application);
    });

    afterAll(
        async () => {
            await db.delete(author).where(eq(author.email, "test@gmail.com"))
            await client.close();
        }
        
    )

    // Helper to create test application and track for cleanup
    const createTestApp = async (overrides: Partial<InsertApplication> = {}) => {
        const [created] = await db.insert(application).values({
            slug: `test-app-${Math.random().toString(36).substring(7)}`,
            title: 'Test App',
            description: 'Test description',
            tags: ['test'],
            authorId: testAuthorId,
            ...overrides,
        }).returning();
        return created;
    };

    describe("getPaginatedApplications - Query Tests", () => {
        it("should correctly paginate results", async () => {
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

        it("should filter by search term in title", async () => {
            await createTestApp({ slug: 'search-test-unique-xyz', title: 'Unique XYZ Application' });
            await createTestApp({ slug: 'search-test-other', title: 'Other Application' });

            const result = await service.getPaginatedApplications(10, 1, { 
                search: "Unique XYZ"
            });

            expect(result.data.some(app => app.slug === 'search-test-unique-xyz')).toBe(true);
        });

        it("should filter by tags", async () => {
            await createTestApp({ 
                slug: 'tag-test-1', 
                title: 'Tagged App',
                tags: ['special-tag', 'test']
            });

            const result = await service.getPaginatedApplications(10, 1, { 
                tags: ['special-tag'] 
            });

            expect(result.data.some(app => app.tags?.includes('special-tag'))).toBe(true);
        });

        it("should sort by createdAt descending by default", async () => {
            await createTestApp({ slug: 'sort-test-first', title: 'First' });
            // Small delay to ensure different timestamps
            await new Promise(resolve => setTimeout(resolve, 10));
            await createTestApp({ slug: 'sort-test-second', title: 'Second' });

            const result = await service.getPaginatedApplications(10, 1);
            
            // Most recent should be first
            const firstIndex = result.data.findIndex(app => app.slug === 'sort-test-first');
            const secondIndex = result.data.findIndex(app => app.slug === 'sort-test-second');
            
            if (firstIndex !== -1 && secondIndex !== -1) {
                expect(secondIndex).toBeLessThan(firstIndex);
            }
        });
    });

    describe("getApplicationBySlug - Query Tests", () => {
        it("should find application by exact slug", async () => {
            const testApp = await createTestApp({ slug: 'exact-slug-test' });

            const result = await service.getApplicationBySlug('exact-slug-test');

            expect(result.slug).toBe('exact-slug-test');
            expect(result.id).toBe(testApp.id);
        });

        it("should throw 404 for non-existent slug", async () => {
            await expect(service.getApplicationBySlug('does-not-exist-12345'))
                .rejects
                .toThrow(HttpError);
        });
    });

    describe("createApplication - Query Tests", () => {
        it("should insert application into database", async () => {
            const result = await service.createApplication({
                slug: 'create-integration-test',
                title: 'Integration Test App',
                description: 'Created via integration test',
                tags: ['integration'],
                authorId: testAuthorId,
            });

            // Verify it's actually in the database
            const [fromDb] = await db.select()
                .from(application)
                .where(eq(application.id, result.id));

            expect(fromDb).toBeDefined();
            expect(fromDb.slug).toBe('create-integration-test');
        });

        it("should reject duplicate slugs", async () => {
            await createTestApp({ slug: 'duplicate-slug-test' });

            await expect(service.createApplication({
                slug: 'duplicate-slug-test', // Same slug!
                title: 'Duplicate',
                description: 'Should fail',
                tags: [],
                authorId: testAuthorId,
            })).rejects.toMatchObject({
                statusCode: 409,
                code: 'DUPLICATE_SLUG',
            });
        });
    });

    describe("patchApplicationById - Query Tests", () => {
        it("should update application fields in database", async () => {
            const app = await createTestApp({ title: 'Old Title', description: 'Old Desc' });
            
            const updated = await service.patchApplicationById(app.id, { 
                title: 'New Title' 
            });

            expect(updated.title).toBe('New Title');
            expect(updated.description).toBe('Old Desc'); // Should remain unchanged

            // Verify in DB
            const [inDb] = await db.select()
                .from(application)
                .where(eq(application.id, app.id));
            expect(inDb.title).toBe('New Title');
        });

        it("should fail when updating to existing slug", async () => {
            await createTestApp({ slug: 'taken-slug' });
            const app = await createTestApp({ slug: 'original-slug' });

            await expect(service.patchApplicationById(app.id, { 
                slug: 'taken-slug' 
            })).rejects.toMatchObject({
                statusCode: 409,
                code: 'DUPLICATE_SLUG'
            });
        });

        it("should throw 404 for non-existent application", async () => {
            await expect(service.patchApplicationById(0, { title: 'New' }))
                .rejects.toMatchObject({ statusCode: 404 });
        });
    });

    describe("deleteApplicationById - Query Tests", () => {
        it("should actually remove from database", async () => {
            const testApp = await createTestApp({ slug: 'delete-test' });
            const id = testApp.id;

            await service.deleteApplicationById(id);

            // Verify it's gone
            const [fromDb] = await db.select()
                .from(application)
                .where(eq(application.id, id));

            expect(fromDb).toBeUndefined();
        });

        it("should throw when removing an non-existing application", async () => {
            await expect(service.deleteApplicationById(0)).rejects.toMatchObject({
                statusCode: 404,
                code: 'NOT_FOUND'
            });
        })
    });
});
