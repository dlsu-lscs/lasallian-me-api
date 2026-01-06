import { registry, ErrorResponseSchema } from '@/shared/config/openapi.js';
import { 
  AuthorRequestSchema,
  CreateAuthorRequestSchema,
  DeleteAuthorRequestSchema,
  AuthorResponseSchema
} from './dto/index.js';

/**
 * Register the GET /api/authors/:email endpoint
 */
registry.registerPath({
  method: 'get',
  path: '/api/authors/{email}',
  description: 'Get an author by email address',
  summary: 'Get author by email',
  tags: ['Authors'],
  request: {
    params: AuthorRequestSchema,
  },
  responses: {
    200: {
      description: 'Successfully retrieved author',
      content: {
        'application/json': {
          schema: AuthorResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid email parameter - VALIDATION_ERROR',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: 'Author not found - NOT_FOUND',
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

/**
 * Register the POST /api/authors endpoint
 */
registry.registerPath({
  method: 'post',
  path: '/api/authors',
  description: 'Create a new author (requires API key via header x-api-key)',
  summary: 'Create author',
  tags: ['Authors'],
  security: [{ ApiKeyAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateAuthorRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Successfully created author',
      content: {
        'application/json': {
          schema: AuthorResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid request body - VALIDATION_ERROR',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    401: {
      description: 'Unauthorized - Invalid or missing API key (code: UNAUTHORIZED)',
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

/**
 * Register the DELETE /api/authors/:id endpoint
 */
registry.registerPath({
  method: 'delete',
  path: '/api/authors/{id}',
  description: 'Delete an author by ID (requires API key via header x-api-key)',
  summary: 'Delete author',
  tags: ['Authors'],
  security: [{ ApiKeyAuth: [] }],
  request: {
    params: DeleteAuthorRequestSchema,
  },
  responses: {
    200: {
      description: 'Successfully deleted author',
      content: {
        'application/json': {
          schema: AuthorResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid ID parameter - VALIDATION_ERROR',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    401: {
      description: 'Unauthorized - Invalid or missing API key (code: UNAUTHORIZED)',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: 'Author not found - NOT_FOUND',
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
