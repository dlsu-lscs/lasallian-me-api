import { registry, ErrorResponseSchema } from '@/shared/config/openapi.js';
import {
  MembersListQuerySchema,
  MembersListResponseSchema,
  BanMemberRequestSchema,
  MemberUserIdParamsSchema,
  UserApplicationsListResponseSchema,
} from './dto/index.js';

registry.registerPath({
  method: 'get',
  path: '/api/members',
  description: 'Get a paginated list of members with optional filters and sorting (Admin only)',
  summary: 'List members',
  security: [{ SessionAuth: [] }],
  tags: ['Members'],
  request: { query: MembersListQuerySchema },
  responses: {
    200: {
      description: 'Successfully retrieved members',
      content: { 'application/json': { schema: MembersListResponseSchema } },
    },
    401: {
      description: 'Unauthorized - UNAUTHORIZED',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    403: {
      description: 'Forbidden - FORBIDDEN',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    500: {
      description: 'Internal server error - INTERNAL_ERROR',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/members/{userId}/applications',
  description: "Get all applications for a specific user (Admin only)",
  summary: "Get user's applications",
  security: [{ SessionAuth: [] }],
  tags: ['Members'],
  request: { params: MemberUserIdParamsSchema },
  responses: {
    200: {
      description: "Successfully retrieved user's applications",
      content: { 'application/json': { schema: UserApplicationsListResponseSchema } },
    },
    404: {
      description: 'User not found - NOT_FOUND',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/members/{userId}/ban',
  description: 'Ban a member with a reason (Admin only)',
  summary: 'Ban member',
  security: [{ SessionAuth: [] }],
  tags: ['Members'],
  request: {
    params: MemberUserIdParamsSchema,
    body: { content: { 'application/json': { schema: BanMemberRequestSchema } } },
  },
  responses: {
    204: { description: 'Member banned successfully' },
    403: {
      description: 'Forbidden - FORBIDDEN',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    404: {
      description: 'User not found - NOT_FOUND',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/members/{userId}/unban',
  description: 'Unban a member (Admin only)',
  summary: 'Unban member',
  security: [{ SessionAuth: [] }],
  tags: ['Members'],
  request: { params: MemberUserIdParamsSchema },
  responses: {
    204: { description: 'Member unbanned successfully' },
    403: {
      description: 'Forbidden - FORBIDDEN',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    404: {
      description: 'User not found - NOT_FOUND',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/members/{userId}/promote',
  description: 'Promote a member to admin (Admin only)',
  summary: 'Promote member',
  security: [{ SessionAuth: [] }],
  tags: ['Members'],
  request: { params: MemberUserIdParamsSchema },
  responses: {
    204: { description: 'Member promoted to admin successfully' },
    403: {
      description: 'Forbidden - FORBIDDEN',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    404: {
      description: 'User not found - NOT_FOUND',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/members/{userId}/demote',
  description: 'Demote an admin back to member (Admin only)',
  summary: 'Demote member',
  security: [{ SessionAuth: [] }],
  tags: ['Members'],
  request: { params: MemberUserIdParamsSchema },
  responses: {
    204: { description: 'Admin demoted successfully' },
    403: {
      description: 'Forbidden - FORBIDDEN',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    404: {
      description: 'User not found - NOT_FOUND',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});
