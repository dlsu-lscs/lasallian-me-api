import {z} from 'zod'

export const CreateApplicationRequestSchema = z.object({
    title: z.string().openapi({ example: 'My Awesome App' }),
    slug: z.string().openapi({ example: 'my-awesome-app' }),
    authorId: z.number().openapi({ example: 123 }),
    description: z.string().nullable().openapi({ example: 'A description of the application' }),
    url: z.string().nullable().openapi({ example: 'https://example.com' }),
    previewImages: z.array(z.string()).nullable().openapi({ example: ['https://example.com/image1.jpg'] }),
    tags: z.array(z.string()).nullable().openapi({ example: ['web', 'mobile'] }),
}).openapi("CreateApplicationRequest");

export type CreateApplicationRequest = z.infer<typeof CreateApplicationRequestSchema>