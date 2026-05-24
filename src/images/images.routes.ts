import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import type { Request, Response } from 'express';
import { s3 } from '@/shared/infrastructure/s3/client.js';
import { requireAuth } from '@/shared/middleware/auth.middleware.js';
import { HttpError } from '@/shared/middleware/error.middleware.js';
import { S3ImageQuerySchema, S3PresignedUploadQuerySchema } from './dto/index.js';

const router = Router();

const contentTypeToExt: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

router.get(
  '/uploads/presigned',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const { contentType, type } = S3PresignedUploadQuerySchema.parse(req.query);

    const bucket = process.env.S3_BUCKET;
    if (!bucket) {
      throw new HttpError(500, 'Server misconfigured', 'INTERNAL_ERROR');
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
  },
);

router.get('/signed', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { key } = S3ImageQuerySchema.parse(req.query);

  const bucket = process.env.S3_BUCKET;
  if (!bucket) {
    throw new HttpError(500, 'Server misconfigured', 'INTERNAL_ERROR');
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
});

export default router;
