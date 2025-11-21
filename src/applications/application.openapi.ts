import { registry, ErrorResponseSchema } from '@/shared/config/openapi.js';
import { ApplicationsRequestSchema } from './dto/index.js';
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
    query: ApplicationsRequestSchema,
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
