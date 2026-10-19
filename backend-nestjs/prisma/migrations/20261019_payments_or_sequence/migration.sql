-- Add idempotency key and OR sequence table for external payment receipts.
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE TABLE IF NOT EXISTS "public"."or_number_seq" (
  "year" SMALLINT NOT NULL,
  "last_sequence" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "or_number_seq_pkey" PRIMARY KEY ("year")
);

ALTER TABLE "public"."official_receipts"
  ADD COLUMN IF NOT EXISTS "idempotency_key" VARCHAR(255);

CREATE UNIQUE INDEX IF NOT EXISTS "official_receipts_idempotency_key_key"
  ON "public"."official_receipts"("idempotency_key");

CREATE INDEX IF NOT EXISTS "idx_official_receipts_payment_date"
  ON "public"."official_receipts"("payment_date" DESC);

CREATE INDEX IF NOT EXISTS "idx_official_receipts_created_at"
  ON "public"."official_receipts"("created_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_official_receipts_amount"
  ON "public"."official_receipts"("amount");

CREATE INDEX IF NOT EXISTS "idx_official_receipts_or_number_trgm"
  ON "public"."official_receipts" USING GIN ("or_number" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "idx_official_receipts_reason"
  ON "public"."official_receipts"("reason_of_dues");

CREATE INDEX IF NOT EXISTS "idx_official_receipts_method"
  ON "public"."official_receipts"("payment_method");

CREATE INDEX IF NOT EXISTS "idx_official_receipts_confirmed_by"
  ON "public"."official_receipts"("confirmed_by");

CREATE INDEX IF NOT EXISTS "idx_users_first_name_trgm"
  ON "public"."users" USING GIN ("first_name" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "idx_users_last_name_trgm"
  ON "public"."users" USING GIN ("last_name" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "idx_users_system_id_trgm"
  ON "public"."users" USING GIN ("system_id" gin_trgm_ops);
