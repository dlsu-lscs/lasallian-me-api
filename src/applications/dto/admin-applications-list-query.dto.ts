import { z } from 'zod';
import '@/shared/config/openapi.js';
import { ApplicationsListQuerySchema } from './applications-list-query.dto.js';

/**
 * Zod schema for admin applications moderation queue query parameters
 */
export const AdminApplicationsListQuerySchema = ApplicationsListQuerySchema.extend({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'REMOVED']).nullish().openapi({
    example: 'PENDING',
    description: 'Filter admin applications list by a single status',
  }),
}).openapi('AdminApplicationsListQuery');

export const AdminApplicationsListFiltersSchema = AdminApplicationsListQuerySchema.omit({
  limit: true,
  page: true,
});

export type AdminApplicationsListQuery = z.infer<typeof AdminApplicationsListQuerySchema>;
export type AdminApplicationsListFilters = z.infer<typeof AdminApplicationsListFiltersSchema>;
