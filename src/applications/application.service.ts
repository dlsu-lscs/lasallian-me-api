import { application } from './application.model.js';
import type { SelectApplication, InsertApplication } from './application.model.js';
import type { ApplicationsListFilters } from './dto/index.js';
import { eq, SQL, gte, lte, between, and, or, ilike, asc, desc, count, arrayOverlaps } from 'drizzle-orm';
import { APPLICATION_CONSTANTS } from './application.constants.js';
import { HttpError } from '@/shared/middleware/error.middleware.js';
import { IApplicationService } from './application.controller.js';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

/**
 * Service result type for paginated applications
 */
export type ApplicationsList = {
    data: SelectApplication[];
    total: number;
};

/**
 * Service layer for application-related business logic
 */
export default class ApplicationService implements IApplicationService {
    constructor(private readonly db: NodePgDatabase) {}

    /**
     * Retrieves a paginated list of applications with optional filters
     * @param limit - Maximum number of items per page
     * @param page - Page number (1-indexed)
     * @param filters - Optional filters for searching and sorting
     * @returns Paginated applications data and total count
     */
    getPaginatedApplications = async(
        limit: number = APPLICATION_CONSTANTS.DEFAULT_LIMIT, 
        page: number = APPLICATION_CONSTANTS.DEFAULT_PAGE, 
        filters?: ApplicationsListFilters
    ): Promise<ApplicationsList> => {

        // Input validation
        if (limit < 1 || page < 1) {
            throw new HttpError(400,'Limit and page must be positive numbers', "VALIDATION_ERROR");
        }

        const safeLimit = Math.min(limit, APPLICATION_CONSTANTS.MAX_LIMIT);
        const offset = (page - 1) * safeLimit;
        
        
        const createdAfter = filters?.createdAfter;
        const createdBefore = filters?.createdBefore;
        const tags = filters?.tags;
        const authorId = filters?.authorId;
        const search = filters?.search;
        const sortBy = filters?.sortBy ?? 'createdAt';
        const sortOrder = filters?.sortOrder ?? 'desc';

        
        const conditions: SQL[] = []

        if(createdAfter !== undefined && createdBefore !== undefined){
            conditions.push(between(application.createdAt, createdAfter, createdBefore))
        } else if (createdAfter !== undefined) {
            conditions.push(gte(application.createdAt, createdAfter))
        } else if (createdBefore !== undefined) {
            conditions.push(lte(application.createdAt, createdBefore))
        }

        if(authorId !== undefined){
            conditions.push(eq(application.authorId, authorId))
        }

        if(tags !== undefined && tags.length > 0){
            conditions.push(arrayOverlaps(application.tags, tags))
        }

        if(search !== undefined && search.trim() !== ''){
            const searchPattern = `%${search}%`;
            conditions.push(
                or(
                    ilike(application.title, searchPattern),
                    ilike(application.description, searchPattern)
                )!
            )
        }

        let orderByColumn;
        switch(sortBy) {
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

        const orderByClause = sortOrder === 'asc' 
            ? asc(orderByColumn) 
            : desc(orderByColumn);

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
        
        // Get total count
        const [{ value: total }] = await this.db
            .select({ value: count() })
            .from(application)
            .where(whereClause);

        // Get paginated data
        const data = await this.db
            .select()
            .from(application)
            .where(whereClause)
            .orderBy(orderByClause)
            .limit(safeLimit)
            .offset(offset);

        return { data, total };
    }

    /**
     * Retrieves a single application by its unique slug
     * @param slug - Application slug
     * @returns The application record
     * @throws HttpError 404 if application not found
     */
    getApplicationBySlug = async (slug: string): Promise<SelectApplication> => {
        const [result] = await this.db
            .select()
            .from(application)
            .where(eq(application.slug, slug))
            .limit(1);

        if (!result) {
            throw new HttpError(404, 'Application not found', 'NOT_FOUND');
        }

        return result;
    }

    /**
     * Checks if an application with the given slug exists
     * @param slug - Application slug to check
     * @returns true if slug exists, false otherwise
     */
    private slugExists = async (slug: string): Promise<boolean> => {
        const [result] = await this.db
            .select({ id: application.id })
            .from(application)
            .where(eq(application.slug, slug))
            .limit(1);
        return !!result;
    }

    /**
     * Creates a single application
     * @param app - Application data to insert
     * @returns The created application
     * @throws HttpError 409 if slug already exists
     */
    createApplication = async(app: InsertApplication): Promise<SelectApplication> => {
        if (await this.slugExists(app.slug)) {
            throw new HttpError(409, "Application with this slug already exists", "DUPLICATE_SLUG")
        }

        const [created] = await this.db.insert(application).values(app).returning()
        return created
    }

    /**
     * Partially updates an application
     * @param id - Application ID
     * @param updates - Partial application data to update
     * @returns The updated application
     * @throws HttpError 404 if application not found
     * @throws HttpError 409 if new slug already exists
     */
    patchApplicationById = async(id: number, updates: Partial<InsertApplication>): 
    Promise<SelectApplication> => 
    {
        const appExists = await this.getApplicationById(id)

        if(!appExists){
            throw new HttpError(404, "Application not found", "NOT_FOUND")
        }

        // Check for slug conflict if updating slug
        if (updates.slug && updates.slug !== appExists.slug) {
            if (await this.slugExists(updates.slug)) {
                throw new HttpError(409, "Application with this slug already exists", "DUPLICATE_SLUG")
            }
        }

        const [patchedApp] = await this.db.update(application).set(updates).where(eq(application.id, id)).returning()
        return patchedApp
    }

    /**
     * Retrieves a single application by its ID
     * @param id - Application ID
     * @access Private 
     * @returns The application record, or undefined if not found
     */
    private getApplicationById = async (id: number): Promise<SelectApplication | undefined> => {
        const [result] = await this.db
            .select()
            .from(application)
            .where(eq(application.id, id))
            .limit(1);

        return result;
    }

    /**
     * Delete an application by its id
     * @param id - application id
     * @returns undefined
     * @throws - HTTPError 404 if application not found
     */
    deleteApplicationById = async(id: number): Promise<SelectApplication> =>
    {
        const appExists = await this.getApplicationById(id)
        if(!appExists){
            throw new HttpError(404, "Application not found", "NOT_FOUND")
        }

        const [deletedApp] = await this.db.delete(application).where(eq(application.id, id)).returning()

        return deletedApp
    }
}