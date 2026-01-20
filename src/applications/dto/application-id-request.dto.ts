import { z } from 'zod';
import '@/shared/config/openapi.js';

/**
 * Zod schema for the application ID path parameter
 */
export const ApplicationIdParamsSchema = z.object({
  id: z.coerce.number().int().positive().openapi({ example: 1 }),
}).openapi('ApplicationIdParams');

export type ApplicationIdParams = z.infer<typeof ApplicationIdParamsSchema>;
