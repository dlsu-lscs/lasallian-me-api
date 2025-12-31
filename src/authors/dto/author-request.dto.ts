import {z} from "zod"

export const AuthorRequestSchema = z.object({
    email: z.email().openapi({example: "example@gmail.com"})
}).openapi('AuthorsRequest')




export type AuthorRequest = z.infer<typeof AuthorRequestSchema>