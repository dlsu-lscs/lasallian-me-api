import { describe, it, expect, beforeAll, afterAll, afterEach} from 'vitest';
import { testdb } from '@/shared/config/testdatabase.js';
import { application } from '../application.model.js';
import ApplicationService from '../application.service.js';
import { HttpError } from '@/shared/middleware/error.middleware.js';
import { eq } from 'drizzle-orm';
import { author } from '@/authors/author.model.js';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

describe("ApplicationService Integration Tests", () => {
    let service: ApplicationService;
    let testAppIds: number[] = []; // Track created apps for cleanup
    let testAuthorId: number;

    beforeAll(async () => {
        // Run migrations first to ensure tables exist before seeding data
        service = new ApplicationService(testdb as NodePgDatabase);
        const [createdAuthor] = await testdb.insert(author).values({name:"test-es", email: "test@gmail.com"}).returning();
        testAuthorId = createdAuthor.id;
    });

    // Clean up test data after each test
    afterEach(async () => {
        for (const id of testAppIds) {
            await testdb.delete(application).where(eq(application.id, id)).catch(() => {});
        }
        testAppIds = [];
    });

    afterAll(
        async () => {
            await testdb.delete(author).where(eq(author.email, "test@gmail.com"))
        }
    )

    // Helper to create test application and track for cleanup
    const createTestApp = async (slug: string, title: string = 'Test App') => {
        const [created] = await testdb.insert(application).values({
            slug,
            title,
            description: 'Test description',
            tags: ['test'],
            authorId: testAuthorId,
        }).returning();
        testAppIds.push(created.id);
        return created;
    };

    describe("getPaginatedApplications - Query Tests", () => {
        it("should correctly paginate results", async () => {
            // Create 5 test applications
            for (let i = 1; i <= 5; i++) {
                await createTestApp(`pagination-test-${i}`, `App ${i}`);
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
            await createTestApp('search-test-unique-xyz', 'Unique XYZ Application');
            await createTestApp('search-test-other', 'Other Application');

            const result = await service.getPaginatedApplications(10, 1, { 
                search: "Unique XYZ"
            });

            expect(result.data.some(app => app.slug === 'search-test-unique-xyz')).toBe(true);
        });

        it("should filter by tags", async () => {
            await createTestApp('tag-test-1', 'Tagged App');
            // Update to add specific tag
            await testdb.update(application)
                .set({ tags: ['special-tag', 'test'] })
                .where(eq(application.slug, 'tag-test-1'));

            const result = await service.getPaginatedApplications(10, 1, { 
                tags: ['special-tag'] 
            });

            expect(result.data.some(app => app.tags?.includes('special-tag'))).toBe(true);
        });

        it("should sort by createdAt descending by default", async () => {
            await createTestApp('sort-test-first', 'First');
            // Small delay to ensure different timestamps
            await new Promise(resolve => setTimeout(resolve, 10));
            await createTestApp('sort-test-second', 'Second');

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
            const testApp = await createTestApp('exact-slug-test');

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
            testAppIds.push(result.id);

            // Verify it's actually in the database
            const [fromDb] = await testdb.select()
                .from(application)
                .where(eq(application.id, result.id));

            expect(fromDb).toBeDefined();
            expect(fromDb.slug).toBe('create-integration-test');
        });

        it("should reject duplicate slugs", async () => {
            await createTestApp('duplicate-slug-test');

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

    describe("deleteApplicationById - Query Tests", () => {
        it("should actually remove from database", async () => {
            const testApp = await createTestApp('delete-test');
            const id = testApp.id;
            
            // Remove from tracking since we're testing deletion
            testAppIds = testAppIds.filter(appId => appId !== id);

            await service.deleteApplicationById(id);

            // Verify it's gone
            const [fromDb] = await testdb.select()
                .from(application)
                .where(eq(application.id, id));

            expect(fromDb).toBeUndefined();
        });

        it("should throw when removing an non-existing application", async () => {
            await expect(service.deleteApplicationById(0)).rejects.toThrow()
        })
    });
});
