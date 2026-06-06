import { db, pool } from '../src/shared/config/database.js';
import { application, SelectApplication } from '../src/applications/application.model.js';
import { eq } from 'drizzle-orm';
const idRange = 100;

const main = async (): Promise<void> => {
  for (let i = 1; i <= idRange; i++) {
    const [app] = await db.select().from(application).where(eq(application.id, i)).limit(1);

    if (!app) {
      continue;
    }

    const stripped = stripApp(app);
    await db
      .update(application)
      .set({ icon: stripped.icon, previewImages: stripped.previewImages })
      .where(eq(application.id, app.id));
  }

  await pool.end();
};

const stripApp = (app: SelectApplication): SelectApplication => {
  return {
    ...app,
    icon: app.icon != null ? stripKey(app.icon) : null,
    previewImages: app.previewImages != null ? stripKeyFromArray(app.previewImages) : null,
  };
};

const stripKeyFromArray = (arr: string[]): string[] => {
  if (!arr.length) {
    return [];
  }

  return arr.map((key) => stripKey(key));
};

const stripKey = (iconString: string): string => {
  const url = new URL(iconString)

  const params = url.searchParams

  console.log(params.get("key"))
  return params.get("key")!
};

main().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exitCode = 1;
});
