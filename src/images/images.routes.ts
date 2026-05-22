import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import type { Request, Response } from 'express';
import { s3 } from '@/shared/infrastructure/s3/client.js';
import { logger } from '@/shared/utils/logger.js';
import { requireAuth } from '@/shared/middleware/auth.middleware.js';
import { S3ImageQuerySchema, S3PresignedUploadQuerySchema } from './dto/index.js';

const router = Router();

const contentTypeToExt: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

router.get('/uploads/presigned', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = S3PresignedUploadQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        error: {
          message: 'Invalid query parameters',
          code: 'VALIDATION_ERROR',
        },
      });
      return;
    }
    const { contentType, type } = parsed.data;

    const bucket = process.env.AWS_S3_BUCKET_NAME;
    if (!bucket) {
      logger.error('Missing AWS_S3_BUCKET_NAME');
      res.status(500).json({
        error: {
          message: 'Server misconfigured',
          code: 'INTERNAL_ERROR',
        },
      });
      return;
    }

    const ext = contentTypeToExt[contentType] ?? 'jpg';
    const prefix = type === 'icon' ? 'icons' : 'preview-images';
    const key = `${prefix}/${Date.now()}-${randomUUID()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    res.status(200).json({ presignedUrl, key });
  } catch (error: unknown) {
    logger.error(error);
    res.status(500).json({
      error: {
        message: 'Error generating URL',
        code: 'INTERNAL_ERROR',
      },
    });
  }
});

router.get('/signed', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = S3ImageQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        error: {
          message: 'Invalid query parameters',
          code: 'VALIDATION_ERROR',
        },
      });
      return;
    }
    const { key } = parsed.data;

    const bucket = process.env.AWS_S3_BUCKET_NAME;
    if (!bucket) {
      logger.error('Missing AWS_S3_BUCKET_NAME');
      res.status(500).json({
        error: {
          message: 'Server misconfigured',
          code: 'INTERNAL_ERROR',
        },
      });
      return;
    }

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    res
      .status(307)
      .set({
        Location: signedUrl,
        'Cache-Control': 'public, max-age=3600',
      })
      .end();
  } catch (error: unknown) {
    logger.error(error);
    res.status(500).json({
      error: {
        message: 'Error generating URL',
        code: 'INTERNAL_ERROR',
      },
    });
  }
});

export default router;
