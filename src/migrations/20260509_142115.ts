import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" DROP COLUMN "ai_generated";
  ALTER TABLE "_posts_v" DROP COLUMN "version_ai_generated";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" ADD COLUMN "ai_generated" boolean DEFAULT false;
  ALTER TABLE "_posts_v" ADD COLUMN "version_ai_generated" boolean DEFAULT false;`)
}
