import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { AppLayout } from "@/components/layout/AppLayout";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import StudentDashboard from "./pages/StudentDashboard";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import VideoPlayerPage from "./pages/VideoPlayerPage";
import NotesPage from "./pages/NotesPage";
import QuizzesPage from "./pages/QuizzesPage";
import QuizPlayPage from "./pages/QuizPlayPage";
import ResultsPage from "./pages/ResultsPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import LiveClassesPage from "./pages/LiveClassesPage";
import DoubtsPage from "./pages/DoubtsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminContent from "./pages/admin/AdminContent";
import AdminQuizzes from "./pages/admin/AdminQuizzes";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminLiveClasses from "./pages/admin/AdminLiveClasses";
import AdminDoubts from "./pages/admin/AdminDoubts";
import AdminCourseAccess from "./pages/admin/AdminCourseAccess";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { isLoggedIn, role } = useAuth();

  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <AppLayout>
      <Routes>
        {/* Student Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:courseId" element={<CourseDetailPage />} />
        <Route path="/courses/:courseId/lecture/:lectureId" element={<VideoPlayerPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/quizzes" element={<QuizzesPage />} />
        <Route path="/quiz/:quizId" element={<QuizPlayPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/live-classes" element={<LiveClassesPage />} />
        <Route path="/doubts" element={<DoubtsPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/content" element={<AdminContent />} />
        <Route path="/admin/quizzes" element={<AdminQuizzes />} />
        <Route path="/admin/students" element={<AdminStudents />} />
        <Route path="/admin/announcements" element={<AdminAnnouncements />} />
        <Route path="/admin/live" element={<AdminLiveClasses />} />
        <Route path="/admin/doubts" element={<AdminDoubts />} />
        <Route path="/admin/access" element={<AdminCourseAccess />} />

        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/signup" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
