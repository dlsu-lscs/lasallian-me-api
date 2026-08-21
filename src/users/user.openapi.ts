import { registry, ErrorResponseSchema } from '@/shared/config/openapi.js';
import { UserEmailParamsSchema, UserResponseSchema } from './dto/index.js';

registry.register('UserEmailParams', UserEmailParamsSchema);
registry.register('UserResponse', UserResponseSchema);

registry.registerPath({
  method: 'patch',
  path: '/api/users/{email}/tos',
  description: 'Accept terms and conditions for a user (authenticated user or admin)',
  summary: 'Accept terms and conditions',
  security: [{ SessionAuth: [] }],
  tags: ['Users'],
  request: {
    params: UserEmailParamsSchema,
  },
  responses: {
    200: {
      description: 'Successfully accepted terms and conditions',
      content: {
        'application/json': {
          schema: UserResponseSchema,
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
    403: {
      description: 'Forbidden - FORBIDDEN',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: 'User not found - NOT_FOUND',
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
