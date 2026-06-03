-- Adds a timestamp column to project_readings and backfills from reading_time if present
ALTER TABLE project_readings
  ADD COLUMN `timestamp` DATETIME NULL;

-- Backfill existing rows from reading_time if present
UPDATE project_readings
  SET `timestamp` = reading_time
  WHERE reading_time IS NOT NULL AND (`timestamp` IS NULL OR `timestamp` = '0000-00-00 00:00:00');

-- Make the timestamp column default to current time for new inserts
ALTER TABLE project_readings
  MODIFY COLUMN `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add index for performant ordering
CREATE INDEX IF NOT EXISTS idx_project_readings_timestamp ON project_readings(`timestamp`);
