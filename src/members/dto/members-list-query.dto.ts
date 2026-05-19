import { z } from '@/shared/config/openapi.js';

export const MEMBER_CONSTANTS = {
  MAX_LIMIT: 100,
  DEFAULT_LIMIT: 20,
  DEFAULT_PAGE: 1,
} as const;

export const MembersListQuerySchema = z
  .object({
    page: z.coerce
      .number()
      .min(1)
      .default(MEMBER_CONSTANTS.DEFAULT_PAGE)
      .openapi({ example: 1, description: 'Page number' }),
    limit: z.coerce
      .number()
      .min(1)
      .max(MEMBER_CONSTANTS.MAX_LIMIT)
      .default(MEMBER_CONSTANTS.DEFAULT_LIMIT)
      .openapi({ example: 20, description: 'Items per page' }),
    search: z
      .string()
      .trim()
      .min(1)
      .max(255)
      .nullish()
      .openapi({ example: 'john', description: 'Search by name or email' }),
    banned: z
      .enum(['true', 'false'])
      .nullish()
      .openapi({ example: 'false', description: 'Filter by banned status' }),
    role: z
      .string()
      .trim()
      .min(1)
      .nullish()
      .openapi({ example: 'admin', description: 'Filter by role' }),
    excludeRole: z
      .string()
      .trim()
      .min(1)
      .nullish()
      .openapi({ example: 'admin', description: 'Exclude users with this role' }),
    hasApps: z
      .enum(['true'])
      .nullish()
      .openapi({ description: 'Filter to users with at least one app' }),
    sortBy: z
      .enum(['lastLogin', 'favoritesCount', 'totalAppCount', 'banned'])
      .default('lastLogin')
      .openapi({ example: 'lastLogin', description: 'Sort field' }),
    sortOrder: z
      .enum(['asc', 'desc'])
      .default('desc')
      .openapi({ example: 'desc', description: 'Sort order' }),
  })
  .openapi('MembersListQuery');

export const MembersListFiltersSchema = MembersListQuerySchema.omit({
  limit: true,
  page: true,
});

export type MembersListQuery = z.infer<typeof MembersListQuerySchema>;
export type MembersListFilters = z.infer<typeof MembersListFiltersSchema>;
