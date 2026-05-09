import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_posts_cluster_role" AS ENUM('pillar', 'spoke');
  CREATE TYPE "public"."enum__posts_v_version_cluster_role" AS ENUM('pillar', 'spoke');
  CREATE TABLE "posts_references" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"content" varchar,
  	"link" varchar
  );
  
  CREATE TABLE "_posts_v_version_references" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"content" varchar,
  	"link" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "posts" ADD COLUMN "cluster" varchar;
  ALTER TABLE "posts" ADD COLUMN "cluster_role" "enum_posts_cluster_role";
  ALTER TABLE "_posts_v" ADD COLUMN "version_cluster" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_cluster_role" "enum__posts_v_version_cluster_role";
  ALTER TABLE "posts_references" ADD CONSTRAINT "posts_references_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_version_references" ADD CONSTRAINT "_posts_v_version_references_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "posts_references_order_idx" ON "posts_references" USING btree ("_order");
  CREATE INDEX "posts_references_parent_id_idx" ON "posts_references" USING btree ("_parent_id");
  CREATE INDEX "posts_references_locale_idx" ON "posts_references" USING btree ("_locale");
  CREATE INDEX "_posts_v_version_references_order_idx" ON "_posts_v_version_references" USING btree ("_order");
  CREATE INDEX "_posts_v_version_references_parent_id_idx" ON "_posts_v_version_references" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_version_references_locale_idx" ON "_posts_v_version_references" USING btree ("_locale");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "posts_references" CASCADE;
  DROP TABLE "_posts_v_version_references" CASCADE;
  ALTER TABLE "posts" DROP COLUMN "cluster";
  ALTER TABLE "posts" DROP COLUMN "cluster_role";
  ALTER TABLE "_posts_v" DROP COLUMN "version_cluster";
  ALTER TABLE "_posts_v" DROP COLUMN "version_cluster_role";
  DROP TYPE "public"."enum_posts_cluster_role";
  DROP TYPE "public"."enum__posts_v_version_cluster_role";`)
}
