import { z } from '@/shared/config/openapi.js';

export const UserApplicationResponseSchema = z
  .object({
    id: z.number().openapi({ example: 1 }),
    title: z.string().openapi({ example: 'My App' }),
    slug: z.string().openapi({ example: 'my-app' }),
    description: z.string().nullable().openapi({ example: 'A cool app' }),
    url: z.string().openapi({ example: 'https://example.com' }),
    icon: z.string().nullable().openapi({ example: null }),
    previewImages: z.array(z.string()).nullable().openapi({ example: [] }),
    tags: z.array(z.string()).nullable().openapi({ example: ['web'] }),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'REMOVED']).openapi({ example: 'APPROVED' }),
    rejectionReason: z.string().nullable().openapi({ example: null }),
    createdAt: z.date().openapi({ example: '2025-01-01T00:00:00.000Z' }),
  })
  .openapi('UserApplicationResponse');

export const UserApplicationsListResponseSchema = z
  .object({
    data: z.array(UserApplicationResponseSchema),
  })
  .openapi('UserApplicationsListResponse');

export type UserApplicationResponse = z.infer<typeof UserApplicationResponseSchema>;
export type UserApplicationsListResponse = z.infer<typeof UserApplicationsListResponseSchema>;
