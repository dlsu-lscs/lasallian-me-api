import { z } from '@/shared/config/openapi.js';

export const S3AllowedContentTypeSchema = z
  .enum(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
  .openapi('S3AllowedContentType');

export const S3PresignedUploadQuerySchema = z
  .object({
    contentType: S3AllowedContentTypeSchema.openapi({ example: 'image/png' }),
    type: z.string().openapi({
      example: 'icon',
      description: 'Use "icon" for icons; any other value maps to preview-images.',
    }),
  })
  .openapi('S3PresignedUploadQuery');

export const S3ImageQuerySchema = z
  .object({
    key: z.string().min(1).openapi({ example: 'preview-images/1716190812345-uuid.png' }),
  })
  .openapi('S3ImageQuery');

export const S3PresignedUploadResponseSchema = z
  .object({
    presignedUrl: z
      .url()
      .openapi({ example: 'https://example-bucket.s3.amazonaws.com/presigned-url' }),
    key: z.string().openapi({ example: 'preview-images/1716190812345-uuid.png' }),
  })
  .openapi('S3PresignedUploadResponse');

export type S3PresignedUploadQuery = z.infer<typeof S3PresignedUploadQuerySchema>;
export type S3ImageQuery = z.infer<typeof S3ImageQuerySchema>;
export type S3PresignedUploadResponse = z.infer<typeof S3PresignedUploadResponseSchema>;
