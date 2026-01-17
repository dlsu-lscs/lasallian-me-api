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

        // TODO: Add more tests for filtering, sorting, pagination
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

    // TODO: Add tests for patchApplicationById
})