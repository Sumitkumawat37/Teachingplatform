-- Delete dashboard-related data from Supabase
-- This migration removes all dashboard-specific tables and data

-- Drop dashboard-specific tables if they exist
DROP TABLE IF EXISTS dashboard_widgets CASCADE;
DROP TABLE IF EXISTS dashboard_layouts CASCADE;
DROP TABLE IF EXISTS dashboard_preferences CASCADE;
DROP TABLE IF EXISTS user_dashboard_settings CASCADE;

-- Remove dashboard-related columns from existing tables if they exist
ALTER TABLE IF EXISTS profiles DROP COLUMN IF EXISTS dashboard_layout;
ALTER TABLE IF EXISTS profiles DROP COLUMN IF EXISTS dashboard_preferences;
ALTER TABLE IF EXISTS profiles DROP COLUMN IF EXISTS last_dashboard_visit;

-- Delete any dashboard-related records in other tables
DELETE FROM notifications WHERE type = 'dashboard_update';
DELETE FROM announcements WHERE category = 'dashboard';

-- Note: This migration is safe to run multiple times as it uses IF EXISTS
