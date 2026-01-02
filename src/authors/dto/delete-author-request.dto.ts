import { z } from "@/shared/config/openapi.js"

export const DeleteAuthorRequestSchema = z.object({
    id: z.coerce.number().int().positive().openapi({example: "1"})
}).openapi('DeleteAuthorRequest')

export type DeleteAuthorRequest = z.infer<typeof DeleteAuthorRequestSchema>