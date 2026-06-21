import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_post_category_pages_categories_category" AS ENUM('insight', 'story', 'portfolio', 'solution', 'service', 'origin');
  CREATE TABLE "post_category_pages_categories" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"category" "enum_post_category_pages_categories_category" NOT NULL,
  	"og_image_id" integer
  );
  
  CREATE TABLE "post_category_pages_categories_locales" (
  	"meta_description" varchar,
  	"meta_title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "post_category_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "post_category_pages_categories" ADD CONSTRAINT "post_category_pages_categories_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "post_category_pages_categories" ADD CONSTRAINT "post_category_pages_categories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."post_category_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "post_category_pages_categories_locales" ADD CONSTRAINT "post_category_pages_categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."post_category_pages_categories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "post_category_pages_categories_order_idx" ON "post_category_pages_categories" USING btree ("_order");
  CREATE INDEX "post_category_pages_categories_parent_id_idx" ON "post_category_pages_categories" USING btree ("_parent_id");
  CREATE INDEX "post_category_pages_categories_og_image_idx" ON "post_category_pages_categories" USING btree ("og_image_id");
  CREATE UNIQUE INDEX "post_category_pages_categories_locales_locale_parent_id_uniq" ON "post_category_pages_categories_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "post_category_pages_categories" CASCADE;
  DROP TABLE "post_category_pages_categories_locales" CASCADE;
  DROP TABLE "post_category_pages" CASCADE;
  DROP TYPE "public"."enum_post_category_pages_categories_category";`)
}
