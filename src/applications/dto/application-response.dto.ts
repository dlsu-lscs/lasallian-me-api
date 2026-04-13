import { z } from 'zod';
import '@/shared/config/openapi.js';
/**
 * Response DTO for a single application
 */
export const ApplicationResponseSchema = z.object({
  id: z.number().openapi({ example: 1 }),
  title: z.string().openapi({ example: 'My Awesome App' }),
  slug: z.string().openapi({ example: 'my-awesome-app' }),
  authorId: z.number().openapi({ example: 123 }),
  description: z.string().nullable().openapi({ example: 'A description of the application' }),
  url: z.string().nullable().openapi({ example: 'https://example.com' }),
  previewImages: z.array(z.string()).nullable().openapi({ example: ['https://example.com/image1.jpg'] }),
  tags: z.array(z.string()).nullable().openapi({ example: ['web', 'mobile'] }),
  createdAt: z.date().openapi({ example: '2025-01-01' }),
  updatedAt: z.date().openapi({ example: '2025-01-01' }),
}).openapi('ApplicationResponse');

/**
 * Response DTO for a single application list item
 */
export const ApplicationListItemResponseSchema = ApplicationResponseSchema.extend({
  favoritesCount: z.number().int().nonnegative().openapi({ example: 12 }),
}).openapi('ApplicationListItemResponse');


/**
 * Response DTO for paginated applications list
 */
export const ApplicationsListResponseSchema = z.object({
  data: z.array(ApplicationListItemResponseSchema),
  meta: z.object({
    page: z.number().openapi({ example: 1 }),
    limit: z.number().openapi({ example: 10 }),
    count: z.number().openapi({ example: 10 }),
    total: z.number().openapi({ example: 100 }),
    totalPages: z.number().openapi({ example: 10 }),
  }),
}).openapi('ApplicationsListResponse');

export type ApplicationResponse = z.infer<typeof ApplicationResponseSchema>;
export type ApplicationListItemResponse = z.infer<typeof ApplicationListItemResponseSchema>;
export type ApplicationsListResponse = z.infer<typeof ApplicationsListResponseSchema>;
