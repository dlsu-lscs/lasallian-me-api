import { db, pool } from '../src/shared/config/database.js';
import { application } from '../src/shared/infrastructure/database/schema.js';
import { deleteS3ImageObjects } from '../src/shared/infrastructure/s3/image-cleanup.js';
import { eq, inArray } from 'drizzle-orm';
import { logger } from '../src/shared/utils/logger.js';

const main = async (): Promise<void> => {
  logger.info('Starting cleanup of applications with status REMOVED...');

  // Fetch all apps with REMOVED status
  const removedApps = await db
    .select({
      id: application.id,
      title: application.title,
      icon: application.icon,
      previewImages: application.previewImages,
    })
    .from(application)
    .where(eq(application.status, 'REMOVED'));

  if (removedApps.length === 0) {
    logger.info('No applications with status REMOVED found.');
    await pool.end();
    return;
  }

  logger.info(`Found ${removedApps.length} application(s) with status REMOVED.`);

  // Collect associated S3 keys
  const keysToDelete: string[] = [];
  for (const app of removedApps) {
    if (app.icon) {
      keysToDelete.push(app.icon);
    }
    if (app.previewImages && Array.isArray(app.previewImages)) {
      keysToDelete.push(...app.previewImages);
    }
  }

  // Delete from S3
  if (keysToDelete.length > 0) {
    logger.info(`Deleting ${keysToDelete.length} image(s) from S3 bucket...`);
    await deleteS3ImageObjects(keysToDelete);
    logger.info('S3 image deletion request complete.');
  } else {
    logger.info('No associated images to delete from S3.');
  }

  // Hard delete application records from database
  const appIds = removedApps.map((app) => app.id);
  logger.info(`Hard-deleting application records from database: ${appIds.join(', ')}`);
  
  await db
    .delete(application)
    .where(inArray(application.id, appIds));

  logger.info('Database deletion complete. Cleanup successful.');
  await pool.end();
};

main().catch(async (error) => {
  logger.error('Cleanup script encountered an error:', { error });
  await pool.end();
  process.exitCode = 1;
});
