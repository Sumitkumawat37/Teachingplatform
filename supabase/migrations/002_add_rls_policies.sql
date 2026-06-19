-- Enable RLS on all tables
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecture_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE doubts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE current_affairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE current_affair_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_failures ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PURCHASES RLS POLICIES
-- ============================================

-- Users can view their own purchases
CREATE POLICY "Users can view own purchases" ON purchases
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own purchases (via payment webhooks)
CREATE POLICY "Users can insert own purchases" ON purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role can do everything (for webhooks)
CREATE POLICY "Service role full access purchases" ON purchases
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- COURSES RLS POLICIES
-- ============================================

-- Everyone can view published courses
CREATE POLICY "Everyone can view courses" ON courses
  FOR SELECT USING (true);

-- Only admins can insert/update/delete courses
CREATE POLICY "Admins can manage courses" ON courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- CHAPTERS RLS POLICIES
-- ============================================

-- Everyone can view chapters
CREATE POLICY "Everyone can view chapters" ON chapters
  FOR SELECT USING (true);

-- Only admins can manage chapters
CREATE POLICY "Admins can manage chapters" ON chapters
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- LECTURES RLS POLICIES
-- ============================================

-- Everyone can view lectures
CREATE POLICY "Everyone can view lectures" ON lectures
  FOR SELECT USING (true);

-- Only admins can manage lectures
CREATE POLICY "Admins can manage lectures" ON lectures
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- LECTURE PROGRESS RLS POLICIES
-- ============================================

-- Users can view their own progress
CREATE POLICY "Users can view own progress" ON lecture_progress
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert/update their own progress
CREATE POLICY "Users can manage own progress" ON lecture_progress
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- DOUBTS RLS POLICIES
-- ============================================

-- Users can view doubts they asked or are part of their course
CREATE POLICY "Users can view relevant doubts" ON doubts
  FOR SELECT USING (
    auth.uid() = student_id OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'super_admin')
    )
  );

-- Users can insert their own doubts
CREATE POLICY "Users can insert own doubts" ON doubts
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Admins can reply to doubts
CREATE POLICY "Admins can reply to doubts" ON doubts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- QUIZ ATTEMPTS RLS POLICIES
-- ============================================

-- Users can view their own quiz attempts
CREATE POLICY "Users can view own quiz attempts" ON quiz_attempts
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own quiz attempts
CREATE POLICY "Users can insert own quiz attempts" ON quiz_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- NOTES RLS POLICIES
-- ============================================

-- Users can view their own notes
CREATE POLICY "Users can view own notes" ON notes
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert/update/delete their own notes
CREATE POLICY "Users can manage own notes" ON notes
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- CURRENT AFFAIRS RLS POLICIES
-- ============================================

-- Everyone can view current affairs
CREATE POLICY "Everyone can view current affairs" ON current_affairs
  FOR SELECT USING (true);

-- Only admins can manage current affairs
CREATE POLICY "Admins can manage current affairs" ON current_affairs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- CURRENT AFFAIR BOOKMARKS RLS POLICIES
-- ============================================

-- Users can view their own bookmarks
CREATE POLICY "Users can view own bookmarks" ON current_affair_bookmarks
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert/delete their own bookmarks
CREATE POLICY "Users can manage own bookmarks" ON current_affair_bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- LIVE CLASSES RLS POLICIES
-- ============================================

-- Everyone can view live classes
CREATE POLICY "Everyone can view live classes" ON live_classes
  FOR SELECT USING (true);

-- Only admins can manage live classes
CREATE POLICY "Admins can manage live classes" ON live_classes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- REVIEW VIDEOS RLS POLICIES
-- ============================================

-- Everyone can view review videos
CREATE POLICY "Everyone can view review videos" ON review_videos
  FOR SELECT USING (true);

-- Only admins can manage review videos
CREATE POLICY "Admins can manage review videos" ON review_videos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- MENTORING SESSIONS RLS POLICIES
-- ============================================

-- Users can view their own mentoring sessions
CREATE POLICY "Users can view own mentoring sessions" ON mentoring_sessions
  FOR SELECT USING (auth.uid() = student_id);

-- Users can insert their own mentoring session requests
CREATE POLICY "Users can insert own mentoring sessions" ON mentoring_sessions
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Admins can view and update all mentoring sessions
CREATE POLICY "Admins can manage mentoring sessions" ON mentoring_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- STUDY PLANS RLS POLICIES
-- ============================================

-- Users can view their own study plans
CREATE POLICY "Users can view own study plans" ON study_plans
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert/update/delete their own study plans
CREATE POLICY "Users can manage own study plans" ON study_plans
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- STUDY TASKS RLS POLICIES
-- ============================================

-- Users can view their own study tasks
CREATE POLICY "Users can view own study tasks" ON study_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM study_plans
      WHERE study_plans.id = study_tasks.study_plan_id
      AND study_plans.user_id = auth.uid()
    )
  );

-- Users can insert/update/delete their own study tasks
CREATE POLICY "Users can manage own study tasks" ON study_tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM study_plans
      WHERE study_plans.id = study_tasks.study_plan_id
      AND study_plans.user_id = auth.uid()
    )
  );

-- ============================================
-- PAYMENT FAILURES RLS POLICIES
-- ============================================

-- Only service role can access payment failures
CREATE POLICY "Service role only payment failures" ON payment_failures
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- AUDIT LOGS RLS POLICIES
-- ============================================

-- Users can view their own audit logs
CREATE POLICY "Users can view own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Super admins can view all audit logs
CREATE POLICY "Super admins can view all audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'super_admin'
    )
  );

-- Service role can insert audit logs
CREATE POLICY "Service role can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- ANALYTICS EVENTS RLS POLICIES
-- ============================================

-- Users can view their own analytics events
CREATE POLICY "Users can view own analytics events" ON analytics_events
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can insert analytics events
CREATE POLICY "Service role can insert analytics events" ON analytics_events
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Super admins can view all analytics events
CREATE POLICY "Super admins can view all analytics events" ON analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'super_admin'
    )
  );
