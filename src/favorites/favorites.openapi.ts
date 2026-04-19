import { ErrorResponseSchema, registry } from "@/shared/config/openapi.js";
import {
  ApplicationFavoritesCountResponseSchema,
  ApplicationFavoritesParamsSchema,
  ApplicationFavoritesResponseSchema,
  CreateFavoriteRequestSchema,
  DeleteFavoriteParamsSchema,
  FavoriteResponseSchema,
  UserFavoritesParamsSchema,
  UserFavoritesResponseSchema,
} from "./dto/index.js";

const authenticatedUserSecurity: Array<Record<string, string[]>> = [{ SessionAuth: [], StateAuth: [] }];

registry.registerPath({
  method: "get",
  path: "/api/favorites/users/{userId}",
  description: "Get all favorited application IDs for a user",
  summary: "Get user favorites",
  tags: ["Favorites"],
  request: {
    params: UserFavoritesParamsSchema,
  },
  responses: {
    200: {
      description: "Successfully retrieved user favorites",
      content: {
        "application/json": {
          schema: UserFavoritesResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid path parameter - VALIDATION_ERROR",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error - INTERNAL_ERROR",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/favorites/applications/{applicationId}",
  description: "Get all user IDs who favorited an application",
  summary: "Get application favorites",
  tags: ["Favorites"],
  request: {
    params: ApplicationFavoritesParamsSchema,
  },
  responses: {
    200: {
      description: "Successfully retrieved application favorites",
      content: {
        "application/json": {
          schema: ApplicationFavoritesResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid path parameter - VALIDATION_ERROR",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error - INTERNAL_ERROR",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/favorites/applications/{applicationId}/count",
  description: "Get total number of users who favorited an application",
  summary: "Get application favorites count",
  tags: ["Favorites"],
  request: {
    params: ApplicationFavoritesParamsSchema,
  },
  responses: {
    200: {
      description: "Successfully retrieved application favorites count",
      content: {
        "application/json": {
          schema: ApplicationFavoritesCountResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid path parameter - VALIDATION_ERROR",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error - INTERNAL_ERROR",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/favorites",
  description: "Create a favorite relation between a user and an application",
  summary: "Create favorite",
  security: authenticatedUserSecurity,
  tags: ["Favorites"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateFavoriteRequestSchema,
        },
      },
    },
  },
  responses: {
    204: {
      description: "Successfully created favorite",
    },
    401: {
      description: "Unauthorized - UNAUTHORIZED",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid request body - VALIDATION_ERROR",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    409: {
      description: "Favorite already exists - DUPLICATE_FAVORITE",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error - INTERNAL_ERROR",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/favorites/{applicationId}",
  description: "Delete a favorite relation for the authenticated user and application ID",
  summary: "Delete favorite",
  security: authenticatedUserSecurity,
  tags: ["Favorites"],
  request: {
    params: DeleteFavoriteParamsSchema,
  },
  responses: {
    200: {
      description: "Successfully deleted favorite",
      content: {
        "application/json": {
          schema: FavoriteResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized - UNAUTHORIZED",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid path parameters - VALIDATION_ERROR",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: "Favorite not found - NOT_FOUND",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error - INTERNAL_ERROR",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});
