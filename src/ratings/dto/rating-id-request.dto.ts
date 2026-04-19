import { z } from "@/shared/config/openapi.js";
import "@/shared/config/openapi.js";

export const RatingIdParamsSchema = z
  .object({
    ratingId: z.coerce.number().int().positive().openapi({ example: 1 }),
  })
  .openapi("RatingIdParams");

export type RatingIdParams = z.infer<typeof RatingIdParamsSchema>;
