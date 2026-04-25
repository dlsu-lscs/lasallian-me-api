import { z } from '@/shared/config/openapi.js';
import '@/shared/config/openapi.js';
export const ApplicationFavoritesParamsSchema = z
  .object({
    applicationId: z.coerce.number().int().positive().openapi({ example: 1 }),
  })
  .openapi('ApplicationFavoritesParams');

export type ApplicationFavoritesParams = z.infer<typeof ApplicationFavoritesParamsSchema>;
