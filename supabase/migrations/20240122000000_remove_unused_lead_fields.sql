-- Remove unused columns from leads table
ALTER TABLE leads
  DROP COLUMN IF EXISTS mobility_type,
  DROP COLUMN IF EXISTS ramp_length,
  DROP COLUMN IF EXISTS rental_duration;

-- Drop unused types if they exist
DROP TYPE IF EXISTS "lead_status" CASCADE;
DROP TYPE IF EXISTS "timeline" CASCADE; 