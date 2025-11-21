import { Application } from './application.model.js';
import { ApplicationFilters } from './dto/index.js';
import { applications } from "@/shared/infrastructure/database/schema.js"
import {db} from "@/shared/config/database.js"
import { eq, SQL, gte, lte, between, and, or, like, asc, desc, count, arrayOverlaps } from 'drizzle-orm';
import { APPLICATION_CONSTANTS } from './application.constants.js';

/**
 * Service result type for paginated applications
 */
export type ApplicationsServiceResult = {
    data: Application[];
    total: number;
};

/**
 * Service layer for application-related business logic
 */
export class ApplicationService {

    /**
     * Retrieves a paginated list of applications with optional filters
     * @param limit - Maximum number of items per page
     * @param page - Page number (1-indexed)
     * @param filters - Optional filters for searching and sorting
     * @returns Paginated applications data and total count
     */
    async getApplications(
        limit: number = APPLICATION_CONSTANTS.DEFAULT_LIMIT, 
        page: number = APPLICATION_CONSTANTS.DEFAULT_PAGE, 
        filters?: ApplicationFilters
    ): Promise<ApplicationsServiceResult> {

        // Input validation
        if (limit < 1 || page < 1) {
            throw new Error('Limit and page must be positive numbers');
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
            conditions.push(between(applications.createdAt, createdAfter, createdBefore))
        } else if (createdAfter !== undefined) {
            conditions.push(gte(applications.createdAt, createdAfter))
        } else if (createdBefore !== undefined) {
            conditions.push(lte(applications.createdAt, createdBefore))
        }

        if(authorId !== undefined){
            conditions.push(eq(applications.authorId, authorId))
        }

        if(tags !== undefined && tags.length > 0){
            conditions.push(arrayOverlaps(applications.tags, tags))
        }

        if(search !== undefined && search.trim() !== ''){
            const searchPattern = `%${search}%`;
            conditions.push(
                or(
                    like(applications.title, searchPattern),
                    like(applications.description, searchPattern)
                )!
            )
        }

        let orderByColumn;
        switch(sortBy) {
            case 'title':
                orderByColumn = applications.title;
                break;
            case 'updatedAt':
                orderByColumn = applications.updatedAt;
                break;
            case 'createdAt':
            default:
                orderByColumn = applications.createdAt;
                break;
        }

        const orderByClause = sortOrder === 'asc' 
            ? asc(orderByColumn) 
            : desc(orderByColumn);

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
        
        // Get total count
        const [{ value: total }] = await db
            .select({ value: count() })
            .from(applications)
            .where(whereClause);

        // Get paginated data
        const data = await db
            .select()
            .from(applications)
            .where(whereClause)
            .orderBy(orderByClause)
            .limit(safeLimit)
            .offset(offset);

        return { data, total };
    }
}