import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_posts_category" ADD VALUE 'origin';
  ALTER TYPE "public"."enum__posts_v_version_category" ADD VALUE 'origin';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" ALTER COLUMN "category" SET DATA TYPE text;
  ALTER TABLE "posts" ALTER COLUMN "category" SET DEFAULT 'insight'::text;
  DROP TYPE "public"."enum_posts_category";
  CREATE TYPE "public"."enum_posts_category" AS ENUM('insight', 'story', 'portfolio', 'solution', 'service');
  ALTER TABLE "posts" ALTER COLUMN "category" SET DEFAULT 'insight'::"public"."enum_posts_category";
  ALTER TABLE "posts" ALTER COLUMN "category" SET DATA TYPE "public"."enum_posts_category" USING "category"::"public"."enum_posts_category";
  ALTER TABLE "_posts_v" ALTER COLUMN "version_category" SET DATA TYPE text;
  ALTER TABLE "_posts_v" ALTER COLUMN "version_category" SET DEFAULT 'insight'::text;
  DROP TYPE "public"."enum__posts_v_version_category";
  CREATE TYPE "public"."enum__posts_v_version_category" AS ENUM('insight', 'story', 'portfolio', 'solution', 'service');
  ALTER TABLE "_posts_v" ALTER COLUMN "version_category" SET DEFAULT 'insight'::"public"."enum__posts_v_version_category";
  ALTER TABLE "_posts_v" ALTER COLUMN "version_category" SET DATA TYPE "public"."enum__posts_v_version_category" USING "version_category"::"public"."enum__posts_v_version_category";`)
}
