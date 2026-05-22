import { z } from '@/shared/config/openapi.js';

export const AdminClaimsListQuerySchema = z
  .object({
    status: z.enum(['PENDING', 'APPROVED', 'DECLINED']).optional().openapi({
      example: 'PENDING',
      description: 'Filter claim requests by status',
    }),
    page: z.coerce.number().int().positive().default(1).openapi({ example: 1 }),
    limit: z.coerce.number().int().positive().max(100).default(20).openapi({ example: 20 }),
  })
  .openapi('AdminClaimsListQuery');

export type AdminClaimsListQuery = z.infer<typeof AdminClaimsListQuerySchema>;
