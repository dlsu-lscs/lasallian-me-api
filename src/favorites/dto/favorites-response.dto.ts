import { z } from "@/shared/config/openapi.js";
import '@/shared/config/openapi.js';
export const FavoriteResponseSchema = z.object({
  userId: z.string().openapi({ example: "user_123" }),
  applicationId: z.number().int().positive().openapi({ example: 1 }),
}).openapi("FavoriteResponse");

export const UserFavoritesResponseSchema = z.object({
  userId: z.string().openapi({ example: "user_123" }),
  applicationIds: z.array(z.number().int().positive()).openapi({ example: [1, 2, 3] }),
}).openapi("UserFavoritesResponse");

export const ApplicationFavoritesResponseSchema = z.object({
  applicationId: z.number().int().positive().openapi({ example: 1 }),
  userIds: z.array(z.string()).openapi({ example: ["user_123", "user_456"] }),
  total: z.number().int().nonnegative().openapi({ example: 2 }),
}).openapi("ApplicationFavoritesResponse");

export const ApplicationFavoritesCountResponseSchema = z.object({
  applicationId: z.number().int().positive().openapi({ example: 1 }),
  count: z.number().int().nonnegative().openapi({ example: 2 }),
}).openapi("ApplicationFavoritesCountResponse");

export type FavoriteResponse = z.infer<typeof FavoriteResponseSchema>;
export type UserFavoritesResponse = z.infer<typeof UserFavoritesResponseSchema>;
export type ApplicationFavoritesResponse = z.infer<typeof ApplicationFavoritesResponseSchema>;
export type ApplicationFavoritesCountResponse = z.infer<typeof ApplicationFavoritesCountResponseSchema>;
