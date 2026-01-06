import { z } from "@/shared/config/openapi.js"

export const CreateAuthorRequestSchema = z.object({
    name: z.string().min(1).max(150).openapi({ example: "John Doe" }),
    email: z.email().max(150).openapi({ example: "john@example.com" }),
    description: z.string().optional().openapi({ example: "A brief bio" }),
    website: z.url().optional().openapi({ example: "https://example.com" }),
    logo: z.string().optional().openapi({ example: "https://example.com/logo.png" }),
}).openapi('CreateAuthorRequest')

export type CreateAuthorRequest = z.infer<typeof CreateAuthorRequestSchema>
