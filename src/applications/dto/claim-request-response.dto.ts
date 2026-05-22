import { z } from '@/shared/config/openapi.js';

export const ClaimRequestResponseSchema = z
  .object({
    id: z.number().openapi({ example: 1 }),
    applicationId: z.number().openapi({ example: 42 }),
    applicationTitle: z.string().openapi({ example: 'My App' }),
    applicationSlug: z.string().openapi({ example: 'my-app' }),
    userId: z.string().openapi({ example: 'user_abc123' }),
    userName: z.string().openapi({ example: 'Juan dela Cruz' }),
    userEmail: z.email().openapi({ example: 'juan@dlsu.edu.ph' }),
    userImage: z.string().nullable().openapi({ example: 'https://example.com/avatar.jpg' }),
    additionalInfo: z.string().nullable().openapi({ example: 'I built this as my thesis.' }),
    status: z.enum(['PENDING', 'APPROVED', 'DECLINED']).openapi({ example: 'PENDING' }),
    createdAt: z.date().openapi({ example: '2026-01-01T00:00:00.000Z' }),
    updatedAt: z.date().openapi({ example: '2026-01-01T00:00:00.000Z' }),
  })
  .openapi('ClaimRequestResponse');

export const ClaimRequestsListResponseSchema = z
  .object({
    data: z.array(ClaimRequestResponseSchema),
    meta: z.object({
      page: z.number().openapi({ example: 1 }),
      limit: z.number().openapi({ example: 20 }),
      count: z.number().openapi({ example: 5 }),
      total: z.number().openapi({ example: 5 }),
      totalPages: z.number().openapi({ example: 1 }),
    }),
  })
  .openapi('ClaimRequestsListResponse');

export type ClaimRequestResponse = z.infer<typeof ClaimRequestResponseSchema>;
export type ClaimRequestsListResponse = z.infer<typeof ClaimRequestsListResponseSchema>;
