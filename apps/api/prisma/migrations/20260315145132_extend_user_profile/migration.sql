-- Add profile columns (nullable first for existing rows)
ALTER TABLE "User" ADD COLUMN "avatarUrl" TEXT;
ALTER TABLE "User" ADD COLUMN "dateOfBirth" DATE;
ALTER TABLE "User" ADD COLUMN "firstName" TEXT;
ALTER TABLE "User" ADD COLUMN "lastName" TEXT;
ALTER TABLE "User" ADD COLUMN "locale" TEXT;
ALTER TABLE "User" ADD COLUMN "nick" TEXT;
ALTER TABLE "User" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill so we can set NOT NULL
UPDATE "User"
SET
  "firstName" = COALESCE("firstName", ''),
  "lastName" = COALESCE("lastName", ''),
  "nick" = COALESCE("nick", "email"),
  "dateOfBirth" = COALESCE("dateOfBirth", '2000-01-01'::date),
  "locale" = COALESCE("locale", 'en')
WHERE "firstName" IS NULL OR "lastName" IS NULL OR "nick" IS NULL OR "dateOfBirth" IS NULL OR "locale" IS NULL;

-- Require profile fields, default locale
ALTER TABLE "User" ALTER COLUMN "firstName" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "lastName" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "nick" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "dateOfBirth" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "locale" SET DEFAULT 'en';
ALTER TABLE "User" ALTER COLUMN "locale" SET NOT NULL;

ALTER TABLE "User" ALTER COLUMN "updatedAt" DROP DEFAULT;
