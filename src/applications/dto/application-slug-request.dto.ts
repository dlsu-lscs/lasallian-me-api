import { z } from '@/shared/config/openapi.js';

/**
 * Zod schema for the application slug path parameter
 */
export const ApplicationSlugParamsSchema = z
  .object({
    slug: z.string().trim().toLowerCase().min(1).max(255).openapi({ example: 'my-awesome-app' }),
  })
  .openapi('ApplicationSlugParams');

export type ApplicationSlugParams = z.infer<typeof ApplicationSlugParamsSchema>;
