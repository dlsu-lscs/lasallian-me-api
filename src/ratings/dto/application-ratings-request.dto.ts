import { z } from '@/shared/config/openapi.js';
import '@/shared/config/openapi.js';
import { ApplicationSlugParamsSchema } from '@/applications/dto/application-slug-request.dto.js';

export const ApplicationRatingsParamsSchema = ApplicationSlugParamsSchema;

export type ApplicationRatingsParams = z.infer<typeof ApplicationRatingsParamsSchema>;
