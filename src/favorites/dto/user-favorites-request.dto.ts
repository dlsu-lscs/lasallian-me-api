import { z } from '@/shared/config/openapi.js';
import '@/shared/config/openapi.js';
export const UserFavoritesParamsSchema = z
  .object({
    userId: z.string().trim().min(1).openapi({ example: 'user_123' }),
  })
  .openapi('UserFavoritesParams');

export type UserFavoritesParams = z.infer<typeof UserFavoritesParamsSchema>;
