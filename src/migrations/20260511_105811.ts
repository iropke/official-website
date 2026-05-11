import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_inquiries_submitted_locale" AS ENUM('en', 'zh', 'ja', 'de', 'fr', 'es', 'ko', 'pt', 'hi', 'ru', 'nl', 'it', 'ar', 'sv', 'th', 'pl', 'id', 'ms', 'da', 'tr');
  ALTER TABLE "inquiries" ALTER COLUMN "submitted_locale" SET DATA TYPE "public"."enum_inquiries_submitted_locale" USING "submitted_locale"::"public"."enum_inquiries_submitted_locale";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "inquiries" ALTER COLUMN "submitted_locale" SET DATA TYPE varchar;
  DROP TYPE "public"."enum_inquiries_submitted_locale";`)
}
