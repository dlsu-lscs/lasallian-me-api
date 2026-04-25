import { z } from '@/shared/config/openapi.js';
import '@/shared/config/openapi.js';

export const RatingResponseSchema = z
  .object({
    applicationId: z.coerce.number().int().positive().openapi({ example: 42 }),
    score: z.coerce.number().min(0).max(5).openapi({ example: 4.5 }),
    comment: z.string().nullable().openapi({ example: 'Highly recommended' }),
    isAnonymous: z.coerce.boolean().openapi({ example: false }),
    userEmail: z.email().nullable().openapi({ example: 'user@example.com' }),
  })
  .openapi('RatingResponse');

export const ApplicationRatingsResponseSchema = z
  .object({
    applicationSlug: z.string().openapi({ example: 'my-awesome-app' }),
    ratings: z.array(RatingResponseSchema),
    total: z.coerce.number().int().nonnegative().openapi({ example: 2 }),
    averageScore: z.coerce.number().min(0).max(5).openapi({ example: 4.25 }),
  })
  .openapi('ApplicationRatingsResponse');

export type RatingResponse = z.infer<typeof RatingResponseSchema>;
export type ApplicationRatingsResponse = z.infer<typeof ApplicationRatingsResponseSchema>;
