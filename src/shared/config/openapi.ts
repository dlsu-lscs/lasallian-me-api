import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

// Extend Zod with OpenAPI capabilities FIRST
extendZodWithOpenApi(z);

// Create a new OpenAPI registry
export const registry = new OpenAPIRegistry();

/**
 * Register common components (error responses, etc.)
 */
export const ErrorResponseSchema = z.object({
  error: z.object({
    message: z.string().openapi({ example: 'An error occurred' }),
    code: z.string().optional().openapi({ example: 'ERROR_CODE' }),
    details: z.any().optional(),
  }),
}).openapi('ErrorResponse');

registry.register('ErrorResponse', ErrorResponseSchema);

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;


/**
 * Generate OpenAPI document
 */
export function generateOpenAPIDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'Lasallian.me API',
      description: 'API for managing applications and users in the Lasallian.me platform',
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Development server',
      },
    ],
  });
}
