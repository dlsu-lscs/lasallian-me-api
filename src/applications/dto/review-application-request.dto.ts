import { z } from '@/shared/config/openapi.js';

/**
 * Zod schema for admin moderation of an application
 */
export const ReviewApplicationRequestSchema = z
  .object({
    status: z.enum(['APPROVED', 'REJECTED', 'REMOVED']).openapi({
      example: 'REJECTED',
      description: 'New application moderation state',
    }),
    rejectionReason: z.string().trim().min(1).max(1000).nullable().optional().openapi({
      example: 'Missing screenshots and usage details',
      description: 'Required when rejecting or removing an application',
    }),
  })
  .superRefine((value, ctx) => {
    if (
      (value.status === 'REJECTED' || value.status === 'REMOVED') &&
      !value.rejectionReason
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['rejectionReason'],
        message: 'Rejection reason is required when rejecting or removing an application',
      });
    }

    if (value.status === 'APPROVED' && value.rejectionReason != null) {
      ctx.addIssue({
        code: 'custom',
        path: ['rejectionReason'],
        message: 'Rejection reason must be null when approving an application',
      });
    }
  })
  .openapi('ReviewApplicationRequest');

export type ReviewApplicationRequest = z.infer<typeof ReviewApplicationRequestSchema>;
