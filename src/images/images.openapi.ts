import { ErrorResponseSchema, registry } from '@/shared/config/openapi.js';
import {
  S3ImageQuerySchema,
  S3PresignedUploadQuerySchema,
  S3PresignedUploadResponseSchema,
} from './dto/index.js';

const authenticatedUserSecurity: Array<Record<string, string[]>> = [
  { SessionAuth: [], StateAuth: [] },
];

registry.registerPath({
  method: 'get',
  path: '/api/images/uploads/presigned',
  description: 'Generate a presigned URL for uploading an image',
  summary: 'Generate presigned upload URL',
  security: authenticatedUserSecurity,
  tags: ['Images'],
  request: {
    query: S3PresignedUploadQuerySchema,
  },
  responses: {
    200: {
      description: 'Successfully generated presigned upload URL',
      content: {
        'application/json': {
          schema: S3PresignedUploadResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid query parameters - VALIDATION_ERROR',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
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
  path: '/api/images/signed',
  description: 'Redirect to a signed URL for an image key',
  summary: 'Get signed image URL',
  security: authenticatedUserSecurity,
  tags: ['Images'],
  request: {
    query: S3ImageQuerySchema,
  },
  responses: {
    307: {
      description: 'Redirect to signed URL',
      headers: {
        Location: {
          schema: {
            type: 'string',
            format: 'uri',
          },
          example: 'https://garage.example.com/your-bucket/presigned-url',
        },
        'Cache-Control': {
          schema: {
            type: 'string',
          },
          example: 'public, max-age=3600',
        },
      },
    },
    400: {
      description: 'Invalid query parameters - VALIDATION_ERROR',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
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
