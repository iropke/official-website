import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "site_settings_enabled_locales" CASCADE;
  DROP TABLE "site_settings_rtl_locales" CASCADE;
  ALTER TABLE "site_settings" DROP COLUMN "default_locale";
  ALTER TABLE "site_settings" DROP COLUMN "ai_api_provider";
  ALTER TABLE "site_settings" DROP COLUMN "contact_email";
  ALTER TABLE "site_settings" DROP COLUMN "no_reply_email";
  ALTER TABLE "site_settings" DROP COLUMN "recaptcha_site_key";
  DROP TYPE "public"."enum_site_settings_enabled_locales";
  DROP TYPE "public"."enum_site_settings_rtl_locales";
  DROP TYPE "public"."enum_site_settings_default_locale";
  DROP TYPE "public"."enum_site_settings_ai_api_provider";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_settings_enabled_locales" AS ENUM('en', 'zh', 'ja', 'de', 'fr', 'es', 'ko', 'pt', 'hi', 'ru', 'nl', 'it', 'ar', 'sv', 'th', 'pl', 'id', 'ms', 'da', 'tr');
  CREATE TYPE "public"."enum_site_settings_rtl_locales" AS ENUM('ar');
  CREATE TYPE "public"."enum_site_settings_default_locale" AS ENUM('en', 'zh', 'ja', 'de', 'fr', 'es', 'ko', 'pt', 'hi', 'ru', 'nl', 'it', 'ar', 'sv', 'th', 'pl', 'id', 'ms', 'da', 'tr');
  CREATE TYPE "public"."enum_site_settings_ai_api_provider" AS ENUM('claude', 'openai');
  CREATE TABLE "site_settings_enabled_locales" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_site_settings_enabled_locales",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "site_settings_rtl_locales" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_site_settings_rtl_locales",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  ALTER TABLE "site_settings" ADD COLUMN "default_locale" "enum_site_settings_default_locale" DEFAULT 'en';
  ALTER TABLE "site_settings" ADD COLUMN "ai_api_provider" "enum_site_settings_ai_api_provider" DEFAULT 'claude';
  ALTER TABLE "site_settings" ADD COLUMN "contact_email" varchar DEFAULT 'hello@iropke.com';
  ALTER TABLE "site_settings" ADD COLUMN "no_reply_email" varchar DEFAULT 'noreply@iropke.com';
  ALTER TABLE "site_settings" ADD COLUMN "recaptcha_site_key" varchar;
  ALTER TABLE "site_settings_enabled_locales" ADD CONSTRAINT "site_settings_enabled_locales_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_rtl_locales" ADD CONSTRAINT "site_settings_rtl_locales_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_enabled_locales_order_idx" ON "site_settings_enabled_locales" USING btree ("order");
  CREATE INDEX "site_settings_enabled_locales_parent_idx" ON "site_settings_enabled_locales" USING btree ("parent_id");
  CREATE INDEX "site_settings_rtl_locales_order_idx" ON "site_settings_rtl_locales" USING btree ("order");
  CREATE INDEX "site_settings_rtl_locales_parent_idx" ON "site_settings_rtl_locales" USING btree ("parent_id");`)
}
