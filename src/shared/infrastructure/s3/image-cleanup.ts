import { DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { s3 } from './client.js';
import { logger } from '@/shared/utils/logger.js';

export async function deleteS3ImageObjects(
  values: Array<string | null | undefined>,
): Promise<void> {
  const keys = values
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  if (keys.length === 0) {
    return;
  }

  const bucket = process.env.S3_BUCKET;
  if (!bucket) {
    logger.error('S3_BUCKET not configured; skipping image cleanup', { keys });
    return;
  }

  try {
    const command = new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: { Objects: keys.map((key) => ({ Key: key })) },
    });

    const result = await s3.send(command);

    if (result.Errors?.length) {
      logger.error('Failed to delete some images from S3', { errors: result.Errors });
    }
  } catch (error) {
    logger.error('Failed to delete images from S3', { error });
  }
}
