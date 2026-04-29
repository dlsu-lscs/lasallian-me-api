import { z } from '@/shared/config/openapi.js';
import { ApplicationSlugParamsSchema } from '@/applications/dto/application-slug-request.dto.js';

export const ApplicationRatingParamsSchema = ApplicationSlugParamsSchema;

export type ApplicationRatingParams = z.infer<typeof ApplicationRatingParamsSchema>;
