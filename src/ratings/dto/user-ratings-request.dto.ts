import { z } from '@/shared/config/openapi.js';
import '@/shared/config/openapi.js';

export const UserRatingsParamsSchema = z
  .object({
    userId: z.string().trim().min(1).openapi({ example: 'user_123' }),
  })
  .openapi('UserRatingsParams');

export type UserRatingsParams = z.infer<typeof UserRatingsParamsSchema>;
