-- Beneficiary details must not be unique across all trainees: siblings can
-- name the same parent as beneficiary. Uniqueness belongs to the trainee
-- instead (one beneficiary record per trainee).

-- The live database has these as table constraints, while 0_init created
-- them as plain unique indexes, so drop whichever form exists.
ALTER TABLE "public"."trainee_beneficiaries"
DROP CONSTRAINT IF EXISTS "trainee_beneficiaries_contact_number_key";

DROP INDEX IF EXISTS "public"."trainee_beneficiaries_contact_number_key";

ALTER TABLE "public"."trainee_beneficiaries"
DROP CONSTRAINT IF EXISTS "trainee_beneficiaries_id_number_key";

DROP INDEX IF EXISTS "public"."trainee_beneficiaries_id_number_key";

-- The unique index on trainee_id also serves lookups, replacing the plain one.
DROP INDEX IF EXISTS "public"."idx_beneficiaries_trainee";

CREATE UNIQUE INDEX "trainee_beneficiaries_trainee_id_key" ON "public"."trainee_beneficiaries"("trainee_id");

-- One trainee record per user: re-enrollment reuses the trainee row instead
-- of creating a new one. NULLs stay allowed (Postgres treats them as distinct).
CREATE UNIQUE INDEX "trainee_users_id_key" ON "public"."trainee"("users_id");

-- A trainee can be enrolled in a given batch only once.
CREATE UNIQUE INDEX "enrollments_trainee_id_batch_id_key" ON "public"."enrollments"("trainee_id", "batch_id");

-- Usernames keep the full last name (first3.lastname_mcctest), which can
-- exceed 30 characters. Widening a VARCHAR does not rewrite existing rows.
ALTER TABLE "public"."users" ALTER COLUMN "system_id" SET DATA TYPE VARCHAR(100);
