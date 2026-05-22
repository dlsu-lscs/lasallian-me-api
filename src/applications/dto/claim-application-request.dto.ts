import { z } from '@/shared/config/openapi.js';

export const ClaimApplicationRequestSchema = z
  .object({
    additionalInfo: z.string().trim().max(2000).optional().openapi({
      example: 'I built this app as my thesis project. Contact me at myemail@dlsu.edu.ph.',
      description: 'Optional message from the claimant to help admins verify ownership',
    }),
  })
  .openapi('ClaimApplicationRequest');

export type ClaimApplicationRequest = z.infer<typeof ClaimApplicationRequestSchema>;
