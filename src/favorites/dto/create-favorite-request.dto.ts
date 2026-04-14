import { z } from "@/shared/config/openapi.js";
import '@/shared/config/openapi.js';
export const CreateFavoriteRequestSchema = z.object({
  userId: z.string().trim().min(1).openapi({ example: "user_123" }),
  applicationId: z.number().int().positive().openapi({ example: 1 }),
}).openapi("CreateFavoriteRequest");

export type CreateFavoriteRequest = z.infer<typeof CreateFavoriteRequestSchema>;
