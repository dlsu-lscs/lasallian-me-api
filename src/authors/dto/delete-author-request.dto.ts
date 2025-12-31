import {z} from "zod"

export const DeleteAuthorRequestSchema = z.object({
    id: z.coerce.number().openapi({example: "1"})
}).openapi('AuthorsRequest')




export type DeleteAuthorRequest = z.infer<typeof DeleteAuthorRequestSchema>