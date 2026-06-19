-- ============================================
-- PERFORMANCE INDEXES FOR 20K USERS
-- ============================================
-- This migration adds optimized indexes for handling
-- 20K concurrent users with high query performance
-- ============================================

-- ============================================
-- COURSES TABLE INDEXES
-- ============================================

-- Composite index for course listing with pagination
CREATE INDEX IF NOT EXISTS idx_courses_created_pagination 
ON courses(created_at DESC, id);

-- Index for course filtering by category
CREATE INDEX IF NOT EXISTS idx_courses_category 
ON courses(category) WHERE category IS NOT NULL;

-- Index for course search
CREATE INDEX IF NOT EXISTS idx_courses_search 
ON courses USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- ============================================
-- CHAPTERS TABLE INDEXES
-- ============================================

-- Composite index for chapter ordering within courses
CREATE INDEX IF NOT EXISTS idx_chapters_course_order 
ON chapters(course_id, sort_order);

-- ============================================
-- LECTURES TABLE INDEXES
-- ============================================

-- Composite index for lecture ordering within chapters
CREATE INDEX IF NOT EXISTS idx_lectures_chapter_order 
ON lectures(chapter_id, sort_order);

-- Index for free preview lectures
CREATE INDEX IF NOT EXISTS idx_lectures_free_preview 
ON lectures(free_preview) WHERE free_preview = true;

-- ============================================
-- LECTURE PROGRESS INDEXES
-- ============================================

-- Composite index for user's lecture progress
CREATE INDEX IF NOT EXISTS idx_lecture_progress_user_lecture 
ON lecture_progress(user_id, lecture_id);

-- Index for completed lectures
CREATE INDEX IF NOT EXISTS idx_lecture_progress_user_completed 
ON lecture_progress(user_id, completed) WHERE completed = true;

-- Index for recently watched lectures
CREATE INDEX IF NOT EXISTS idx_lecture_progress_user_updated 
ON lecture_progress(user_id, updated_at DESC);

-- ============================================
-- PURCHASES TABLE INDEXES
-- ============================================

-- Composite index for user purchases
CREATE INDEX IF NOT EXISTS idx_purchases_user 
ON purchases(user_id, created_at DESC);

-- Index for course enrollments
CREATE INDEX IF NOT EXISTS idx_purchases_course 
ON purchases(course_id) WHERE course_id IS NOT NULL;

-- ============================================
-- DOUBTS TABLE INDEXES
-- ============================================

-- Composite index for lecture doubts
CREATE INDEX IF NOT EXISTS idx_doubts_lecture_created 
ON doubts(lecture_id, created_at DESC);

-- Index for unanswered doubts
CREATE INDEX IF NOT EXISTS idx_doubts_unanswered 
ON doubts(lecture_id) WHERE reply IS NULL;

-- Index for user's doubts
CREATE INDEX IF NOT EXISTS idx_doubts_user 
ON doubts(user_id, created_at DESC);

-- ============================================
-- ANNOUNCEMENTS TABLE INDEXES
-- ============================================

-- Index for recent announcements
CREATE INDEX IF NOT EXISTS idx_announcements_created 
ON announcements(created_at DESC);

-- Index for announcement type
CREATE INDEX IF NOT EXISTS idx_announcements_type 
ON announcements(type);

-- ============================================
-- LIVE CLASSES INDEXES
-- ============================================

-- Composite index for upcoming live classes
CREATE INDEX IF NOT EXISTS idx_live_classes_scheduled 
ON live_classes(scheduled_at DESC) WHERE status = 'upcoming';

-- Index for live classes by course
CREATE INDEX IF NOT EXISTS idx_live_classes_course 
ON live_classes(course_id) WHERE course_id IS NOT NULL;

-- ============================================
-- ATTENDANCE INDEXES
-- ============================================

-- Composite index for live class attendance
CREATE INDEX IF NOT EXISTS idx_attendance_live_class 
ON attendance(live_class_id, user_id);

-- ============================================
-- MENTORING REQUESTS INDEXES
-- ============================================

-- Composite index for mentoring requests
CREATE INDEX IF NOT EXISTS idx_mentoring_requests_user 
ON mentoring_requests(user_id, created_at DESC);

-- Index for pending mentoring requests
CREATE INDEX IF NOT EXISTS idx_mentoring_requests_pending 
ON mentoring_requests(status) WHERE status = 'pending';

-- ============================================
-- PYQ QUESTIONS INDEXES
-- ============================================

-- Composite index for PYQ filtering
CREATE INDEX IF NOT EXISTS idx_pyq_questions_subject_year 
ON pyq_questions(subject, year DESC);

-- Index for PYQ search
CREATE INDEX IF NOT EXISTS idx_pyq_questions_search 
ON pyq_questions USING gin(to_tsvector('english', question));

-- ============================================
-- PYQ ATTEMPTS INDEXES
-- ============================================

-- Composite index for user PYQ attempts
CREATE INDEX IF NOT EXISTS idx_pyq_attempts_user 
ON pyq_attempts(user_id, question_id, created_at DESC);

-- ============================================
-- NOTES TABLE INDEXES
-- ============================================

-- Composite index for notes by course and chapter
CREATE INDEX IF NOT EXISTS idx_notes_course_chapter 
ON notes(course_id, chapter_id) WHERE course_id IS NOT NULL;

-- Index for notes search
CREATE INDEX IF NOT EXISTS idx_notes_search 
ON notes USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- ============================================
-- CURRENT AFFAIRS INDEXES
-- ============================================

-- Composite index for current affairs by date
CREATE INDEX IF NOT EXISTS idx_current_affairs_date 
ON current_affairs(published_date DESC);

-- Index for current affairs category
CREATE INDEX IF NOT EXISTS idx_current_affairs_category 
ON current_affairs(category);

-- ============================================
-- PERSONAL NOTES INDEXES
-- ============================================

-- Composite index for user personal notes
CREATE INDEX IF NOT EXISTS idx_personal_notes_user 
ON personal_notes(user_id, created_at DESC);

-- ============================================
-- PERFORMANCE TUNING
-- ============================================

-- Update table statistics
ANALYZE courses;
ANALYZE chapters;
ANALYZE lectures;
ANALYZE lecture_progress;
ANALYZE purchases;
ANALYZE doubts;
ANALYZE announcements;
ANALYZE live_classes;
ANALYZE attendance;
ANALYZE mentoring_requests;
ANALYZE pyq_questions;
ANALYZE pyq_attempts;
ANALYZE notes;
ANALYZE current_affairs;
ANALYZE personal_notes;

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify indexes were created
DO $$
DECLARE
  table_name TEXT;
  index_count INTEGER;
BEGIN
  RAISE NOTICE 'Verifying performance indexes...';
  
  FOR table_name IN VALUES 
    ('courses'), ('chapters'), ('lectures'), ('lecture_progress'),
    ('purchases'), ('doubts'), ('announcements'), ('live_classes'),
    ('attendance'), ('mentoring_requests'), ('pyq_questions'),
    ('pyq_attempts'), ('notes'), ('current_affairs'), ('personal_notes')
  LOOP
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE tablename = table_name AND schemaname = 'public';
    
    RAISE NOTICE 'Table % has % indexes', table_name, index_count;
  END LOOP;
  
  RAISE NOTICE 'Performance indexes created successfully';
END $$;
