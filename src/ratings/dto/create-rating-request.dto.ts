import { z } from "@/shared/config/openapi.js";
import "@/shared/config/openapi.js";

export const CreateRatingRequestSchema = z
  .object({
    score: z.number().min(0).max(5).openapi({ example: 4.5 }),
    comment: z
      .string()
      .trim()
      .max(255)
      .optional()
      .nullable()
      .openapi({ example: "Great app for events!" }),
    isAnonymous: z.boolean().openapi({ example: false }),
  })
  .openapi("CreateRatingRequest");

export type CreateRatingRequest = z.infer<typeof CreateRatingRequestSchema>;
