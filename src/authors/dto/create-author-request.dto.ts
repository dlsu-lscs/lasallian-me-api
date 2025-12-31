import {z} from "zod"

export const CreateAuthorRequestSchema = z.object({
    name: z.string().min(1).max(150),
    email: z.email().max(150),
    description: z.string().optional(),
    website: z.url().optional(),
    logo: z.string().optional(),
})

export type CreateAuthorRequest = z.infer<typeof CreateAuthorRequestSchema>
