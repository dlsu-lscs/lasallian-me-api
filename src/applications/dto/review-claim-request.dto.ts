import { z } from '@/shared/config/openapi.js';

export const ReviewClaimRequestSchema = z
  .object({
    status: z.enum(['APPROVED', 'DECLINED']).openapi({
      example: 'APPROVED',
      description: 'Decision on the claim request',
    }),
    adminNote: z.string().trim().max(1000).optional().openapi({
      example: 'Verified via GitHub contribution history.',
      description: 'Optional note from the admin',
    }),
  })
  .openapi('ReviewClaimRequest');

export type ReviewClaimRequest = z.infer<typeof ReviewClaimRequestSchema>;
