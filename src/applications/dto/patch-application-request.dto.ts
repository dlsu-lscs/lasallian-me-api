import { z } from 'zod';
import '@/shared/config/openapi.js';
import { CreateApplicationRequestSchema } from './create-application-request.dto.js';

/**
 * Zod schema for patching an application (all fields optional)
 */
export const PatchApplicationRequestSchema = CreateApplicationRequestSchema.partial().openapi('PatchApplicationRequest');

export type PatchApplicationRequest = z.infer<typeof PatchApplicationRequestSchema>;
