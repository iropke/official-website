import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_posts_category" AS ENUM('insight', 'story', 'portfolio');
  CREATE TYPE "public"."enum__posts_v_version_category" AS ENUM('insight', 'story', 'portfolio');
  ALTER TABLE "posts" ADD COLUMN "category" "enum_posts_category" DEFAULT 'insight' NOT NULL;
  ALTER TABLE "_posts_v" ADD COLUMN "version_category" "enum__posts_v_version_category" DEFAULT 'insight';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" DROP COLUMN "category";
  ALTER TABLE "_posts_v" DROP COLUMN "version_category";
  DROP TYPE "public"."enum_posts_category";
  DROP TYPE "public"."enum__posts_v_version_category";`)
}
