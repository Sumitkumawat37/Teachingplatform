import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { PurchaseProvider } from "@/lib/purchase-context";
import { AppLayout } from "@/components/layout/AppLayout";
import { GoogleAuthProvider } from "@/lib/google-oauth-context";
import ErrorBoundary from "@/components/ErrorBoundary";
import ToonHubCarousel from "@/components/ToonHubCarousel";
import { lazy, Suspense } from "react";

// Lazy load all pages for better performance
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const CoursesPage = lazy(() => import("./pages/CoursesPage"));
const CourseDetailPage = lazy(() => import("./pages/CourseDetailPage"));
const VideoPlayerPage = lazy(() => import("./pages/VideoPlayerPage"));
const LecturePage = lazy(() => import("./pages/LecturePage"));
const NotesPage = lazy(() => import("./pages/NotesPage"));
const PersonalNotesPage = lazy(() => import("./pages/PersonalNotesPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const LiveClassesPage = lazy(() => import("./pages/LiveClassesPage"));
const DoubtsPage = lazy(() => import("./pages/DoubtsPage"));
const PYQsPage = lazy(() => import("./pages/PYQsPage"));
const CurrentAffairsPage = lazy(() => import("./pages/CurrentAffairsPage"));
const MainsWritingPage = lazy(() => import("./pages/MainsWritingPage"));
const StudyPlannerPage = lazy(() => import("./pages/StudyPlannerPage"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProfile = lazy(() => import("./pages/admin/AdminProfile"));
const AdminContent = lazy(() => import("./pages/admin/AdminContent"));
const AdminStudents = lazy(() => import("./pages/admin/AdminStudents"));
const AdminAnnouncements = lazy(() => import("./pages/admin/AdminAnnouncements"));
const AdminLiveClasses = lazy(() => import("./pages/admin/AdminLiveClasses"));
const AdminDoubts = lazy(() => import("./pages/admin/AdminDoubts"));
const AdminCourseAccess = lazy(() => import("./pages/admin/AdminCourseAccess"));
const AdminEmailCenter = lazy(() => import("./pages/admin/AdminEmailCenter"));
const SuperAdminDashboard = lazy(() => import("./pages/superadmin/SuperAdminDashboard"));
const SuperAdminUsers = lazy(() => import("./pages/superadmin/SuperAdminUsers"));
const CheckEmailPage = lazy(() => import("./pages/CheckEmailPage"));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const ReviewVideosPage = lazy(() => import("./pages/ReviewVideosPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading component for lazy loaded routes
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#F7F7FA]">
    <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const queryClient = new QueryClient();

function AppRoutes() {
  const { isLoggedIn, role, loading, isProcessingOAuth } = useAuth();

  // Show loading screen while initializing or processing OAuth callback
  if (loading || isProcessingOAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F7F7FA]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">
            {isProcessingOAuth ? "Completing sign-in..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <Routes>
        {/* ToonHub Carousel - Public route, no auth required */}
        <Route path="/toonhub" element={<ToonHubCarousel />} />
        
        <Route path="/login" element={<Suspense fallback={<PageLoader />}><LoginPage /></Suspense>} />
        <Route path="/signup" element={<Suspense fallback={<PageLoader />}><SignupPage /></Suspense>} />
        <Route path="/check-email" element={<Suspense fallback={<PageLoader />}><CheckEmailPage /></Suspense>} />
        <Route path="/verify-email" element={<Suspense fallback={<PageLoader />}><VerifyEmailPage /></Suspense>} />
        <Route path="/forgot-password" element={<Suspense fallback={<PageLoader />}><ForgotPasswordPage /></Suspense>} />
        <Route path="/reset-password" element={<Suspense fallback={<PageLoader />}><ResetPasswordPage /></Suspense>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Role-based root redirect
  const rootRedirect = role === "super_admin"
    ? "/superadmin"
    : (role === "admin" || role === "teacher")
    ? "/admin"
    : "/";

  return (
    <AppLayout>
      <Routes>
        {/* ToonHub Carousel - Public route, no auth required */}
        <Route path="/toonhub" element={<ToonHubCarousel />} />

        {/* Role-based root redirect */}
        <Route path="/" element={
          role === "super_admin" 
            ? <Navigate to="/superadmin" replace /> 
            : (role === "admin" || role === "teacher")
            ? <Navigate to="/admin" replace />
            : <Suspense fallback={<PageLoader />}><HomePage /></Suspense>
        } />
        
        {/* Student Routes */}
        <Route path="/dashboard" element={<Suspense fallback={<PageLoader />}><StudentDashboard /></Suspense>} />
        <Route path="/courses" element={<Suspense fallback={<PageLoader />}><CoursesPage /></Suspense>} />
        <Route path="/courses/:courseId" element={<Suspense fallback={<PageLoader />}><CourseDetailPage /></Suspense>} />
        <Route path="/courses/:courseId/lecture/:lectureId" element={<Suspense fallback={<PageLoader />}><LecturePage /></Suspense>} />
        <Route path="/notes" element={<Suspense fallback={<PageLoader />}><NotesPage /></Suspense>} />
        <Route path="/personal-notes" element={<Suspense fallback={<PageLoader />}><PersonalNotesPage /></Suspense>} />
        <Route path="/notifications" element={<Suspense fallback={<PageLoader />}><NotificationsPage /></Suspense>} />
        <Route path="/profile" element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>} />
        <Route path="/live-classes" element={<Suspense fallback={<PageLoader />}><LiveClassesPage /></Suspense>} />
        <Route path="/doubts" element={<Suspense fallback={<PageLoader />}><DoubtsPage /></Suspense>} />
        <Route path="/pyqs" element={<Suspense fallback={<PageLoader />}><PYQsPage /></Suspense>} />
        <Route path="/current-affairs" element={<Suspense fallback={<PageLoader />}><CurrentAffairsPage /></Suspense>} />
        <Route path="/mains-writing" element={<Suspense fallback={<PageLoader />}><MainsWritingPage /></Suspense>} />
        <Route path="/study-planner" element={<Suspense fallback={<PageLoader />}><StudyPlannerPage /></Suspense>} />
        <Route path="/review-videos" element={<Suspense fallback={<PageLoader />}><ReviewVideosPage /></Suspense>} />

        {/* Admin (Teacher) Routes */}
        <Route path="/admin" element={<Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>} />
        <Route path="/admin/profile" element={<Suspense fallback={<PageLoader />}><AdminProfile /></Suspense>} />
        <Route path="/admin/content" element={<Suspense fallback={<PageLoader />}><AdminContent /></Suspense>} />
        <Route path="/admin/students" element={<Suspense fallback={<PageLoader />}><AdminStudents /></Suspense>} />
        <Route path="/admin/announcements" element={<Suspense fallback={<PageLoader />}><AdminAnnouncements /></Suspense>} />
        <Route path="/admin/live" element={<Suspense fallback={<PageLoader />}><AdminLiveClasses /></Suspense>} />
        <Route path="/admin/doubts" element={<Suspense fallback={<PageLoader />}><AdminDoubts /></Suspense>} />
        <Route path="/admin/access" element={<Suspense fallback={<PageLoader />}><AdminCourseAccess /></Suspense>} />
        <Route path="/admin/email-center" element={<Suspense fallback={<PageLoader />}><AdminEmailCenter /></Suspense>} />

        {/* Super Admin Routes */}
        <Route path="/superadmin" element={<Suspense fallback={<PageLoader />}><SuperAdminDashboard /></Suspense>} />
        <Route path="/superadmin/users" element={<Suspense fallback={<PageLoader />}><SuperAdminUsers /></Suspense>} />

        {/* Auth pages accessible even when logged in (e.g. recovery session) */}
        <Route path="/reset-password" element={<Suspense fallback={<PageLoader />}><ResetPasswordPage /></Suspense>} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/signup" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
      </Routes>
    </AppLayout>
  );
}

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <PurchaseProvider>
              <GoogleAuthProvider>
                <BrowserRouter>
                  <AppRoutes />
                </BrowserRouter>
              </GoogleAuthProvider>
            </PurchaseProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
