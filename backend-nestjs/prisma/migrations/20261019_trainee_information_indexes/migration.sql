-- Trainee Information module (MP-24): indexes for the trainee list search,
-- filters and sorting.

-- Trigram indexes let ILIKE '%term%' (partial, case-insensitive) searches on
-- names and contact numbers use an index instead of a full table scan.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_users_first_name_trgm" ON "public"."users" USING GIN ("first_name" gin_trgm_ops);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_users_last_name_trgm" ON "public"."users" USING GIN ("last_name" gin_trgm_ops);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_trainee_contact_number_trgm" ON "public"."trainee" USING GIN ("contact_number" gin_trgm_ops);

-- Enrolled-date sorting and date range filtering.
-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_enrollments_enrolled_at" ON "public"."enrollments"("enrolled_at");

-- Active insurance lookups per trainee (the foreign key had no index).
-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_insurance_coverage_trainee" ON "public"."insurance_coverage"("trainee_id");
