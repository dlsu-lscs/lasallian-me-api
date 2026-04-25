import { z } from '@/shared/config/openapi.js';
import '@/shared/config/openapi.js';
export const DeleteFavoriteParamsSchema = z
  .object({
    applicationId: z.coerce.number().int().positive().openapi({ example: 1 }),
  })
  .openapi('DeleteFavoriteParams');

export type DeleteFavoriteParams = z.infer<typeof DeleteFavoriteParamsSchema>;
