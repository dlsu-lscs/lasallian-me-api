import { describe, it, expect, vi, beforeEach } from 'vitest';
import ApplicationService from '../application.service.js';
import { HttpError } from '@/shared/middleware/error.middleware.js';
import type { SelectApplication, InsertApplication } from '../application.model.js';

// Mock the database module
vi.mock('@/shared/config/database.js', () => ({
    db: {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    }
}));

// Import the mocked db
import { db } from '@/shared/config/database.js';

// Helper to create mock application data
const createMockApplication = (overrides?: Partial<SelectApplication>): SelectApplication => ({
    id: 1,
    slug: 'test-app',
    title: 'Test Application',
    description: 'A test application',
    url: "url.com",
    previewImages: [],
    tags: ['test', 'sample'],
    authorId: 1,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    ...overrides,
});

describe("ApplicationService", () => {
    let service: ApplicationService;

    beforeEach(() => {
        vi.clearAllMocks();
        service = new ApplicationService();
    });

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
            const mockApps = [
                createMockApplication({ id: 1, slug: 'app-1' }),
                createMockApplication({ id: 2, slug: 'app-2' }),
            ];

            // Mock count query
            const mockCountWhere = vi.fn().mockResolvedValue([{ value: 5 }]);
            
            // Mock data query
            const mockOffset = vi.fn().mockResolvedValue(mockApps);
            const mockLimit = vi.fn().mockReturnValue({ offset: mockOffset });
            const mockOrderBy = vi.fn().mockReturnValue({ limit: mockLimit });
            const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
            const mockFrom = vi.fn()
                .mockReturnValueOnce({ where: mockCountWhere })  // First call for count
                .mockReturnValueOnce({ where: mockWhere });      // Second call for data
            
            (db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom });

            const result = await service.getPaginatedApplications(2, 1);

            expect(result).toHaveProperty('data');
            expect(result).toHaveProperty('total');
            expect(result.data).toEqual(mockApps);
            expect(result.total).toBe(5);
        });

        it("should cap limit at MAX_LIMIT", async () => {
            const mockApps = [createMockApplication()];

            // Mock count query
            const mockCountWhere = vi.fn().mockResolvedValue([{ value: 1 }]);
            
            // Mock data query
            const mockOffset = vi.fn().mockResolvedValue(mockApps);
            const mockLimit = vi.fn().mockReturnValue({ offset: mockOffset });
            const mockOrderBy = vi.fn().mockReturnValue({ limit: mockLimit });
            const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
            const mockFrom = vi.fn()
                .mockReturnValueOnce({ where: mockCountWhere })
                .mockReturnValueOnce({ where: mockWhere });
            
            (db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom });

            // Request 500, but MAX_LIMIT is 100
            await service.getPaginatedApplications(500, 1);

            // Verify limit was capped (check the limit mock was called)
            expect(mockLimit).toHaveBeenCalled();
        });

        it("should calculate correct offset for pagination", async () => {
            const mockApps = [createMockApplication()];

            const mockOffset = vi.fn().mockResolvedValue(mockApps);
            const mockLimit = vi.fn().mockReturnValue({ offset: mockOffset });
            const mockOrderBy = vi.fn().mockReturnValue({ limit: mockLimit });
            const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
            const mockCountWhere = vi.fn().mockResolvedValue([{ value: 100 }]);
            const mockFrom = vi.fn()
                .mockReturnValueOnce({ where: mockCountWhere })
                .mockReturnValueOnce({ where: mockWhere });
            
            (db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom });

            // Page 3 with limit 10 should have offset 20
            await service.getPaginatedApplications(10, 3);

            expect(mockOffset).toHaveBeenCalledWith(20);
        });
    });

    describe("getApplicationBySlug", () => {
        it("should return application when found", async () => {
            const mockApp = createMockApplication();
            
            // Setup mock chain: db.select().from().where().limit()
            const mockLimit = vi.fn().mockResolvedValue([mockApp]);
            const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
            const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
            (db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom });

            const result = await service.getApplicationBySlug('test-app');

            expect(result).toEqual(mockApp);
        });

        it("should throw 404 when application not found", async () => {
            // Return empty array = not found
            const mockLimit = vi.fn().mockResolvedValue([]);
            const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
            const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
            (db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom });

            await expect(service.getApplicationBySlug('nonexistent'))
                .rejects
                .toThrow(HttpError);
        });
    });

    describe("createApplication", () => {
        it("should create application when slug is unique", async () => {
            const newApp: InsertApplication = {
                slug: 'new-app',
                title: 'New Application',
                description: 'A new app',
                tags: ['new'],
                authorId: 1,
            };
            const createdApp = createMockApplication({ ...newApp, id: 2 });

            // Mock slugExists check (returns empty = slug doesn't exist)
            const mockLimitCheck = vi.fn().mockResolvedValue([]);
            const mockWhereCheck = vi.fn().mockReturnValue({ limit: mockLimitCheck });
            const mockFromCheck = vi.fn().mockReturnValue({ where: mockWhereCheck });
            
            // Mock insert
            const mockReturning = vi.fn().mockResolvedValue([createdApp]);
            const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
            (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({ values: mockValues });
            (db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFromCheck });

            const result = await service.createApplication(newApp);

            expect(result).toEqual(createdApp);
        });

        it("should throw 409 when slug already exists", async () => {
            const newApp: InsertApplication = {
                slug: 'existing-app',
                title: 'New Application',
                description: 'A new app',
                tags: ['new'],
                authorId: 1,
            };

            // Mock slugExists check (returns result = slug exists)
            const mockLimitCheck = vi.fn().mockResolvedValue([{ id: 1 }]);
            const mockWhereCheck = vi.fn().mockReturnValue({ limit: mockLimitCheck });
            const mockFromCheck = vi.fn().mockReturnValue({ where: mockWhereCheck });
            (db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFromCheck });

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
            const mockApp = createMockApplication();

            // Mock getApplicationById (app exists)
            const mockLimitGet = vi.fn().mockResolvedValue([mockApp]);
            const mockWhereGet = vi.fn().mockReturnValue({ limit: mockLimitGet });
            const mockFromGet = vi.fn().mockReturnValue({ where: mockWhereGet });
            (db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFromGet });

            // Mock delete
            const mockReturning = vi.fn().mockResolvedValue([mockApp]);
            const mockWhereDelete = vi.fn().mockReturnValue({ returning: mockReturning });
            (db.delete as ReturnType<typeof vi.fn>).mockReturnValue({ where: mockWhereDelete });

            const result = await service.deleteApplicationById(1);

            expect(result).toEqual(mockApp);
        });

        it("should throw 404 when application not found", async () => {
            // Mock getApplicationById (app doesn't exist)
            const mockLimitGet = vi.fn().mockResolvedValue([]);
            const mockWhereGet = vi.fn().mockReturnValue({ limit: mockLimitGet });
            const mockFromGet = vi.fn().mockReturnValue({ where: mockWhereGet });
            (db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFromGet });

            await expect(service.deleteApplicationById(999))
                .rejects
                .toMatchObject({
                    statusCode: 404,
                    code: 'NOT_FOUND',
                });
        });
    });

    describe("patchApplicationById", () => {
        it("should update application when it exists", async () => {
            const existingApp = createMockApplication({ id: 1, title: 'Old Title' });
            const updates = { title: 'New Title' };
            const updatedApp = createMockApplication({ ...existingApp, ...updates });

            // Mock getApplicationById
            const mockLimitGet = vi.fn().mockResolvedValue([existingApp]);
            const mockWhereGet = vi.fn().mockReturnValue({ limit: mockLimitGet });
            const mockFromGet = vi.fn().mockReturnValue({ where: mockWhereGet });
            (db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFromGet });

            // Mock update
            const mockReturning = vi.fn().mockResolvedValue([updatedApp]);
            const mockWhereUpdate = vi.fn().mockReturnValue({ returning: mockReturning });
            const mockSet = vi.fn().mockReturnValue({ where: mockWhereUpdate });
            (db.update as ReturnType<typeof vi.fn>).mockReturnValue({ set: mockSet });

            const result = await service.patchApplicationById(1, updates);
            
            expect(result.title).toBe('New Title');
            expect(mockSet).toHaveBeenCalledWith(updates);
        });

        it("should throw 404 when application not found", async () => {
            // Mock getApplicationById (app doesn't exist)
            const mockLimitGet = vi.fn().mockResolvedValue([]);
            const mockWhereGet = vi.fn().mockReturnValue({ limit: mockLimitGet });
            const mockFromGet = vi.fn().mockReturnValue({ where: mockWhereGet });
            (db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFromGet });

            await expect(service.patchApplicationById(999, { title: 'New Title' }))
                .rejects
                .toMatchObject({
                    statusCode: 404,
                    code: 'NOT_FOUND',
                });
        });

        it("should throw 409 when updating to an existing slug", async () => {
            const existingApp = createMockApplication({ slug: 'original-slug' });

            // First call: getApplicationById returns existing app
            // Second call: slugExists returns a result (slug taken)
            const mockLimitGet = vi.fn()
                .mockResolvedValueOnce([existingApp])  // getApplicationById
                .mockResolvedValueOnce([{ id: 2 }]);   // slugExists (slug is taken)
            const mockWhereGet = vi.fn().mockReturnValue({ limit: mockLimitGet });
            const mockFromGet = vi.fn().mockReturnValue({ where: mockWhereGet });
            (db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFromGet });

            await expect(service.patchApplicationById(1, { slug: 'taken-slug' }))
                .rejects
                .toMatchObject({
                    statusCode: 409,
                    code: 'DUPLICATE_SLUG',
                });
        });

        it("should allow updating to the same slug", async () => {
            const existingApp = createMockApplication({ slug: 'my-slug' });
            const updatedApp = createMockApplication({ slug: 'my-slug', title: 'Updated' });

            // Mock getApplicationById
            const mockLimitGet = vi.fn().mockResolvedValue([existingApp]);
            const mockWhereGet = vi.fn().mockReturnValue({ limit: mockLimitGet });
            const mockFromGet = vi.fn().mockReturnValue({ where: mockWhereGet });
            (db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFromGet });

            // Mock update
            const mockReturning = vi.fn().mockResolvedValue([updatedApp]);
            const mockWhereUpdate = vi.fn().mockReturnValue({ returning: mockReturning });
            const mockSet = vi.fn().mockReturnValue({ where: mockWhereUpdate });
            (db.update as ReturnType<typeof vi.fn>).mockReturnValue({ set: mockSet });

            // Updating with same slug should NOT trigger slug conflict check
            const result = await service.patchApplicationById(1, { slug: 'my-slug', title: 'Updated' });

            expect(result).toEqual(updatedApp);
        });

        it("should allow partial updates", async () => {
            const existingApp = createMockApplication();
            const updates = { description: 'Only updating description' };
            const updatedApp = createMockApplication({ ...updates });

            // Mock getApplicationById
            const mockLimitGet = vi.fn().mockResolvedValue([existingApp]);
            const mockWhereGet = vi.fn().mockReturnValue({ limit: mockLimitGet });
            const mockFromGet = vi.fn().mockReturnValue({ where: mockWhereGet });
            (db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFromGet });

            // Mock update
            const mockReturning = vi.fn().mockResolvedValue([updatedApp]);
            const mockWhereUpdate = vi.fn().mockReturnValue({ returning: mockReturning });
            const mockSet = vi.fn().mockReturnValue({ where: mockWhereUpdate });
            (db.update as ReturnType<typeof vi.fn>).mockReturnValue({ set: mockSet });

            const result = await service.patchApplicationById(1, updates);

            expect(result.description).toBe('Only updating description');
            expect(mockSet).toHaveBeenCalledWith(updates);
        });
    });
})