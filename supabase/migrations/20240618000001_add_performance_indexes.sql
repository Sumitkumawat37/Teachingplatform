-- Performance Optimization Migration
-- Add indexes for frequently queried columns

-- Indexes on user_id for all user-related tables
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_lecture_progress_user_id ON lecture_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_doubts_user_id ON doubts(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);

-- Indexes on course_id for course-related tables
CREATE INDEX IF NOT EXISTS idx_lectures_course_id ON lectures(course_id);
CREATE INDEX IF NOT EXISTS idx_chapters_course_id ON chapters(course_id);
CREATE INDEX IF NOT EXISTS idx_purchases_course_id ON purchases(course_id);
CREATE INDEX IF NOT EXISTS idx_notes_course_id ON notes(course_id);

-- Indexes on lecture_id for lecture-related tables
CREATE INDEX IF NOT EXISTS idx_lecture_progress_lecture_id ON lecture_progress(lecture_id);
CREATE INDEX IF NOT EXISTS idx_notes_lecture_id ON notes(lecture_id);

-- Indexes on enrollment_id (if exists)
CREATE INDEX IF NOT EXISTS idx_purchases_enrollment_id ON purchases(enrollment_id);

-- Indexes on created_at for sorting and filtering
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at);
CREATE INDEX IF NOT EXISTS idx_lectures_created_at ON lectures(created_at);
CREATE INDEX IF NOT EXISTS idx_chapters_created_at ON chapters(created_at);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at);
CREATE INDEX IF NOT EXISTS idx_doubts_created_at ON doubts(created_at);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at);

-- Indexes on updated_at for sorting and filtering
CREATE INDEX IF NOT EXISTS idx_courses_updated_at ON courses(updated_at);
CREATE INDEX IF NOT EXISTS idx_lectures_updated_at ON lectures(updated_at);
CREATE INDEX IF NOT EXISTS idx_chapters_updated_at ON chapters(updated_at);
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles(updated_at);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_purchases_user_course ON purchases(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_lecture_progress_user_lecture ON lecture_progress(user_id, lecture_id);
CREATE INDEX IF NOT EXISTS idx_lectures_course_sort ON lectures(course_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_chapters_course_sort ON chapters(course_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_doubts_user_status ON doubts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);

-- Indexes for course visibility and status
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(published);
CREATE INDEX IF NOT EXISTS idx_lectures_published ON lectures(published);
CREATE INDEX IF NOT EXISTS idx_chapters_published ON chapters(published);

-- Indexes for role-based queries
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_role ON user_roles(user_id, role);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Index for course category filtering
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);

-- Index for course price sorting
CREATE INDEX IF NOT EXISTS idx_courses_price ON courses(price);
