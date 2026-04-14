import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { APPLICATION_CONSTANTS } from '../application.constants.js';

// Extend Zod with OpenAPI capabilities
extendZodWithOpenApi(z);

/**
 * Zod schema for all query parameters (pagination + filters)
 */
export const ApplicationsRequestSchema = z.object({
    // Pagination
    limit: z.coerce.number().min(1).max(APPLICATION_CONSTANTS.MAX_LIMIT).default(APPLICATION_CONSTANTS.DEFAULT_LIMIT)
        .openapi({ example: 10, description: 'Number of items per page' }),
    page: z.coerce.number().min(1).default(APPLICATION_CONSTANTS.DEFAULT_PAGE)
        .openapi({ example: 1, description: 'Page number' }),
    
    // Date range filters
    createdAfter: z.coerce.date().optional()
        .openapi({ example: '2025-01-01', description: 'Filter applications created after this date' }),
    createdBefore: z.coerce.date().optional()
        .openapi({ example: '2025-12-31', description: 'Filter applications created before this date' }),
    
    // Search filters
    search: z.string().min(1).max(255).optional()
        .openapi({ example: 'web app', description: 'Search in title and description' }),
    tags: z.string().transform(s => s.split(',')).pipe(z.array(z.string()))
        .or(z.array(z.string()))
        .optional()
        .openapi({ example: 'web,mobile', description: 'Comma-separated list of tags' }),
    authorId: z.coerce.number().int().positive().optional()
        .openapi({ example: 123, description: 'Filter by author ID' }),
    
    // Sorting options
    sortBy: z.enum(['createdAt', 'updatedAt', 'title']).default(APPLICATION_CONSTANTS.DEFAULT_SORT_BY)
        .openapi({ example: 'createdAt', description: 'Field to sort by' }),
    sortOrder: z.enum(['asc', 'desc']).default(APPLICATION_CONSTANTS.DEFAULT_SORT_ORDER)
        .openapi({ example: 'desc', description: 'Sort order' }),
}).openapi('ApplicationsRequest');

/**
 * Schema for just the filters (without pagination)
 */
export const ApplicationFiltersSchema = ApplicationsRequestSchema.omit({ limit: true, page: true });

/**
 * Infer TypeScript types from Zod schemas
 */
export type ApplicationQuery = z.infer<typeof ApplicationsRequestSchema>;
export type ApplicationFilters = z.infer<typeof ApplicationFiltersSchema>;
