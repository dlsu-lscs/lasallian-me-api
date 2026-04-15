import { z } from "@/shared/config/openapi.js";

export const AuthorResponseSchema = z.object({
  id: z.number().int().positive().openapi({ example: 1 }),
  name: z.string().openapi({ example: "John Doe" }),
  email: z.email().openapi({ example: "john@example.com" }),
  description: z.string().nullable().openapi({ example: "A brief bio" }),
  website: z.string().nullable().openapi({ example: "https://example.com" }),
  logo: z.string().nullable().openapi({ example: "https://example.com/logo.png" }),
  createdAt: z.date().openapi({ example: "2025-01-01T00:00:00.000Z" }),
  updatedAt: z.date().openapi({ example: "2025-01-01T00:00:00.000Z" }),
}).openapi("AuthorResponse");

export const AuthorsListResponseSchema = z.object({
  data: z.array(AuthorResponseSchema),
  meta: z.object({
    page: z.number().openapi({ example: 1 }),
    limit: z.number().openapi({ example: 10 }),
    total: z.number().openapi({ example: 50 }),
  }),
}).openapi("AuthorsListResponse");

export type AuthorResponse = z.infer<typeof AuthorResponseSchema>;
export type AuthorsListResponse = z.infer<typeof AuthorsListResponseSchema>;