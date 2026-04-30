import { ErrorResponseSchema, registry } from '@/shared/config/openapi.js';
import {
  ApplicationRatingParamsSchema,
  ApplicationRatingResponseSchema,
  CreateRatingRequestSchema,
  PatchRatingRequestSchema,
  RatingResponseSchema,
  UserRatingsResponseSchema,
} from './dto/index.js';

const authenticatedUserSecurity: Array<Record<string, string[]>> = [
  { SessionAuth: [], StateAuth: [] },
];

registry.register('ApplicationRatingsParams', ApplicationRatingParamsSchema);
registry.register('CreateRatingRequest', CreateRatingRequestSchema);
registry.register('PatchRatingRequest', PatchRatingRequestSchema);

registry.registerPath({
  method: 'get',
  path: '/api/applications/{slug}/ratings',
  description: 'Get all ratings for an application by slug',
  summary: 'Get application ratings',
  tags: ['Ratings'],
  request: {
    params: ApplicationRatingParamsSchema,
  },
  responses: {
    200: {
      description: 'Successfully retrieved application ratings',
      content: {
        'application/json': {
          schema: ApplicationRatingResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid path parameter - VALIDATION_ERROR',
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

registry.registerPath({
  method: 'get',
  path: '/api/ratings/me',
  description: 'Get all ratings for the authenticated user',
  summary: 'Get my ratings',
  security: authenticatedUserSecurity,
  tags: ['Ratings'],
  responses: {
    200: {
      description: 'Successfully retrieved user ratings',
      content: {
        'application/json': {
          schema: UserRatingsResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid path parameter - VALIDATION_ERROR',
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

registry.registerPath({
  method: 'post',
  path: '/api/applications/{slug}/ratings',
  description: 'Create a rating for an application by slug',
  summary: 'Create rating',
  security: authenticatedUserSecurity,
  tags: ['Ratings'],
  request: {
    params: ApplicationRatingParamsSchema,
    body: {
      content: {
        'application/json': {
          schema: CreateRatingRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Successfully created rating',
      content: {
        'application/json': {
          schema: RatingResponseSchema,
        },
      },
    },
    401: {
      description: 'Unauthorized - UNAUTHORIZED',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
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
      description: 'User or application not found - NOT_FOUND',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    409: {
      description: 'Rating already exists - DUPLICATE_RATING',
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

registry.registerPath({
  method: 'patch',
  path: '/api/applications/{slug}/ratings',
  description: "Update the authenticated user's rating for an application by slug",
  summary: 'Update rating',
  security: authenticatedUserSecurity,
  tags: ['Ratings'],
  request: {
    params: ApplicationRatingParamsSchema,
    body: {
      content: {
        'application/json': {
          schema: PatchRatingRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Successfully updated rating',
      content: {
        'application/json': {
          schema: RatingResponseSchema,
        },
      },
    },
    401: {
      description: 'Unauthorized - UNAUTHORIZED',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
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
      description: 'Application or rating not found - NOT_FOUND',
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

registry.registerPath({
  method: 'delete',
  path: '/api/applications/{slug}/ratings',
  description: "Delete the authenticated user's rating for an application by slug",
  summary: 'Delete rating',
  security: authenticatedUserSecurity,
  tags: ['Ratings'],
  request: {
    params: ApplicationRatingParamsSchema,
  },
  responses: {
    200: {
      description: 'Successfully deleted rating',
      content: {
        'application/json': {
          schema: RatingResponseSchema,
        },
      },
    },
    401: {
      description: 'Unauthorized - UNAUTHORIZED',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
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
      description: 'Application or rating not found - NOT_FOUND',
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
