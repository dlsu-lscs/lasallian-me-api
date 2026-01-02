import { z } from "@/shared/config/openapi.js"

export const AuthorRequestSchema = z.object({
    email: z.email().trim().openapi({example: "example@gmail.com"})
}).openapi('AuthorsRequest')

export type AuthorRequest = z.infer<typeof AuthorRequestSchema>