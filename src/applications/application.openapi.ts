import { registry, ErrorResponseSchema } from '@/shared/config/openapi.js';
import { 
  ApplicationsListQuerySchema, 
  ApplicationSlugParamsSchema, 
  ApplicationResponseSchema, 
  CreateApplicationRequestSchema,
  ApplicationIdParamsSchema,
  PatchApplicationRequestSchema,
  ApplicationsListResponseSchema
} from './dto/index.js';

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

/**
 * Register the POST /api/applications
 */
registry.registerPath({
  method: 'post',
  path: '/api/applications',
  description: 'Create application, api key protected',
  summary: 'Create application',
  security: [{ ApiKeyAuth: [] }],
  tags: ['Applications'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateApplicationRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Successfully created application',
      content: {
        'application/json': {
          schema: ApplicationResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid body request - VALIDATION_ERROR',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    409: {
      description: 'Conflict - DUPLICATE_SLUG',
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
 * Register the PATCH /api/applications/:id endpoint
 */
registry.registerPath({
  method: 'patch',
  path: '/api/applications/{id}',
  description: 'Partially update an application by ID, api key protected',
  summary: 'Update application',
  security: [{ ApiKeyAuth: [] }],
  tags: ['Applications'],
  request: {
    params: ApplicationIdParamsSchema,
    body: {
      content: {
        'application/json': {
          schema: PatchApplicationRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Successfully updated application',
      content: {
        'application/json': {
          schema: ApplicationResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid request data - VALIDATION_ERROR',
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
    409: {
      description: 'Conflict - DUPLICATE_SLUG',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

/**
 * Register the DELETE /api/applications/:id endpoint
 */
registry.registerPath({
  method: 'delete',
  path: '/api/applications/{id}',
  description: 'Delete an application by ID, api key protected',
  summary: 'Delete application',
  security: [{ ApiKeyAuth: [] }],
  tags: ['Applications'],
  request: {
    params: ApplicationIdParamsSchema,
  },
  responses: {
    200: {
      description: 'Successfully deleted application',
      content: {
        'application/json': {
          schema: ApplicationResponseSchema,
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
  },
});
