import {z} from 'zod'

export const CreateApplicationRequestSchema = z.object({
    title: z.string().trim().min(1, 'Title is required').openapi({ example: 'My Awesome App' }),
    slug: z.string().trim().toLowerCase().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens').openapi({ example: 'my-awesome-app' }),
    authorId: z.number().openapi({ example: 123 }),
    description: z.string().trim().nullish().openapi({ example: 'A description of the application' }),
    url: z.url('Invalid URL format').trim().nullish().openapi({ example: 'https://example.com' }),
    previewImages: z.array(z.url('Invalid image URL').trim()).nullish().openapi({ example: ['https://example.com/image1.jpg'] }),
    tags: z.array(z.string().trim().min(1)).nullish().openapi({ example: ['web', 'mobile'] }),
}).openapi("CreateApplicationRequest");

export type CreateApplicationRequest = z.infer<typeof CreateApplicationRequestSchema>