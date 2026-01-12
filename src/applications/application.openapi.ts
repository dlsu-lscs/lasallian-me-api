import { registry, ErrorResponseSchema } from '@/shared/config/openapi.js';
import { ApplicationsListQuerySchema, ApplicationSlugParamsSchema, ApplicationResponseSchema } from './dto/index.js';
import { 
  ApplicationsListResponseSchema 
} from './dto/application-response.dto.js';

/**
 * Register the GET /api/applications endpoint
 */
registry.registerPath({
  method: 'get',
  path: '/api/applications',
  description: 'Get a paginated list of applications with optional filters and sorting',
  summary: 'List applications',
  tags: ['Applications'],
  request: {
    query: ApplicationsListQuerySchema,
  },
  responses: {
    200: {
      description: 'Successfully retrieved applications list',
      content: {
        'application/json': {
          schema: ApplicationsListResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid query parameters',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

/**
 * Register the GET /api/applications/:slug endpoint
 */
registry.registerPath({
  method: 'get',
  path: '/api/applications/{slug}',
  description: 'Get a single application by slug',
  summary: 'Get application by slug',
  tags: ['Applications'],
  request: {
    params: ApplicationSlugParamsSchema,
  },
  responses: {
    200: {
      description: 'Successfully retrieved application',
      content: {
        'application/json': {
          schema: ApplicationResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid slug parameter - VALIDATION_ERROR',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: 'Application not found - NOT_FOUND',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: 'Internal server error - INTERNAL_ERROR',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});
