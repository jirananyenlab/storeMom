-- Postgres migration for StoreMomWebApp Product model drift
-- Use this when DATABASE_URL points to PostgreSQL.

ALTER TABLE "product"
  ADD COLUMN IF NOT EXISTS "sellPrice" NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "product"
  ALTER COLUMN "volume" DROP NOT NULL;

ALTER TABLE "product"
  DROP COLUMN IF EXISTS "description";

CREATE INDEX IF NOT EXISTS "product_productName_idx" ON "product"("productName");
