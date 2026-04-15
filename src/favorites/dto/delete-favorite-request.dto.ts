import { z } from "@/shared/config/openapi.js";
import '@/shared/config/openapi.js';
export const DeleteFavoriteParamsSchema = z.object({
  userId: z.string().trim().min(1).openapi({ example: "user_123" }),
  applicationId: z.coerce.number().int().positive().openapi({ example: 1 }),
}).openapi("DeleteFavoriteParams");

export type DeleteFavoriteParams = z.infer<typeof DeleteFavoriteParamsSchema>;
