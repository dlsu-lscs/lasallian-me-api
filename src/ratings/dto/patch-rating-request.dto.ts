import { z } from "@/shared/config/openapi.js";
import "@/shared/config/openapi.js";

export const PatchRatingRequestSchema = z
  .object({
    score: z.number().min(0).max(5).optional().openapi({ example: 3.5 }),
    comment: z
      .string()
      .trim()
      .max(255)
      .optional()
      .nullable()
      .openapi({ example: "Updated review after more usage." }),
    isAnonymous: z.boolean().optional().openapi({ example: true }),
  })
  .refine(
    (data) =>
      data.score !== undefined || data.comment !== undefined || data.isAnonymous !== undefined,
    {
      message: "At least one updatable field must be provided",
      path: ["body"],
    },
  )
  .openapi("PatchRatingRequest");

export type PatchRatingRequest = z.infer<typeof PatchRatingRequestSchema>;
