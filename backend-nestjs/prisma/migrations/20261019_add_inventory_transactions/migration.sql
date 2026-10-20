
-- Create the transaction type enum.
CREATE TYPE "inventory_transaction_type_enum"
AS ENUM ('INITIAL', 'RESTOCK', 'DISTRIBUTED', 'ADJUSTMENT');

-- Create the inventory transaction history table.
CREATE TABLE "inventory_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "inventory_id" UUID NOT NULL,
    "type" "inventory_transaction_type_enum" NOT NULL,
    "quantity_change" INTEGER NOT NULL,
    "quantity_after" INTEGER NOT NULL,
    "enrollment_id" UUID,
    "performed_by" UUID NOT NULL,
    "remarks" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_transactions_pkey"
        PRIMARY KEY ("id")
);

-- Create transaction history indexes.
CREATE INDEX "idx_inventory_transactions_history"
ON "inventory_transactions" ("inventory_id", "created_at" DESC, "id" DESC);

CREATE INDEX "idx_inventory_transactions_enrollment"
ON "inventory_transactions" ("enrollment_id");

-- Replace the old program index with the program + size index.
CREATE INDEX "idx_inventory_program_size"
ON "inventory" ("program_id", "sizes");

-- Merge duplicate inventory rows before adding the unique constraint.
-- Keep a deterministic row, combine quantities, and repoint checklist references.

WITH ranked_inventory AS (
    SELECT
        "id",
        FIRST_VALUE("id") OVER (
            PARTITION BY "program_id", "item_name", "sizes"
            ORDER BY "id"
        ) AS keeper_id,
        ROW_NUMBER() OVER (
            PARTITION BY "program_id", "item_name", "sizes"
            ORDER BY "id"
        ) AS row_num,
        SUM("quantity") OVER (
            PARTITION BY "program_id", "item_name", "sizes"
        ) AS total_quantity,
        COUNT(*) OVER (
            PARTITION BY "program_id", "item_name", "sizes"
        ) AS group_count
    FROM "inventory"
)
UPDATE "inventory" AS i
SET
    "quantity" = r.total_quantity,
    "updated_at" = CURRENT_TIMESTAMP
FROM ranked_inventory AS r
WHERE i."id" = r.keeper_id
  AND r.row_num = 1
  AND r.group_count > 1;

WITH ranked_inventory AS (
    SELECT
        "id",
        FIRST_VALUE("id") OVER (
            PARTITION BY "program_id", "item_name", "sizes"
            ORDER BY "id"
        ) AS keeper_id,
        ROW_NUMBER() OVER (
            PARTITION BY "program_id", "item_name", "sizes"
            ORDER BY "id"
        ) AS row_num
    FROM "inventory"
)
UPDATE "distribution_checklist" AS dc
SET "inventory_id" = r.keeper_id
FROM ranked_inventory AS r
WHERE dc."inventory_id" = r."id"
  AND r.row_num > 1;

WITH ranked_inventory AS (
    SELECT
        "id",
        ROW_NUMBER() OVER (
            PARTITION BY "program_id", "item_name", "sizes"
            ORDER BY "id"
        ) AS row_num
    FROM "inventory"
)
DELETE FROM "inventory" AS i
USING ranked_inventory AS r
WHERE i."id" = r."id"
  AND r.row_num > 1;
  
-- Enforce one row per program, item, and size.
CREATE UNIQUE INDEX "uq_inventory_program_item_size"
ON "inventory" ("program_id", "item_name", "sizes");

-- Add foreign keys.
ALTER TABLE "inventory_transactions"
ADD CONSTRAINT "inventory_transactions_inventory_id_fkey"
FOREIGN KEY ("inventory_id") REFERENCES "inventory" ("id")
ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "inventory_transactions"
ADD CONSTRAINT "inventory_transactions_enrollment_id_fkey"
FOREIGN KEY ("enrollment_id") REFERENCES "enrollments" ("id")
ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "inventory_transactions"
ADD CONSTRAINT "inventory_transactions_performed_by_fkey"
FOREIGN KEY ("performed_by") REFERENCES "users" ("id")
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Backfill opening balances for existing inventory rows.
INSERT INTO "inventory_transactions" (
    "inventory_id",
    "type",
    "quantity_change",
    "quantity_after",
    "performed_by",
    "remarks"
)
SELECT
    "id",
    'INITIAL'::"inventory_transaction_type_enum",
    "quantity",
    "quantity",
    "updated_by",
    'Opening balance'
FROM "inventory";

-- Drop the old index after creating its replacement.
DROP INDEX "idx_inventory_program";
