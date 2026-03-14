-- AlterTable
-- Existing users get placeholder hash; they must re-register to use auth.
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT NOT NULL DEFAULT '$2b$12$htUcoZQTjIrvwrBIohDjLu1zAZ8LTk9aYhf1i00x9KX5Ukn/at/gS';
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP DEFAULT;
