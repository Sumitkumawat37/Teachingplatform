import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth-context";

// Courses
export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });
}

// Chapters for a course
export function useChapters(courseId?: string) {
  return useQuery({
    queryKey: ["chapters", courseId],
    queryFn: async () => {
      let q = supabase.from("chapters").select("*").order("sort_order");
      if (courseId) q = q.eq("course_id", courseId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

// Lectures
export function useLectures(courseId?: string) {
  return useQuery({
    queryKey: ["lectures", courseId],
    queryFn: async () => {
      let q = supabase.from("lectures").select("*, chapters(title)").order("sort_order");
      if (courseId) q = q.eq("course_id", courseId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useLecture(lectureId?: string) {
  return useQuery({
    queryKey: ["lecture", lectureId],
    enabled: !!lectureId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lectures")
        .select("*, chapters(title)")
        .eq("id", lectureId!)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

// Notes
export function useNotes(courseId?: string) {
  return useQuery({
    queryKey: ["notes", courseId],
    queryFn: async () => {
      let q = supabase.from("notes").select("*, chapters(title), courses(title)").order("created_at");
      if (courseId && courseId !== "all") q = q.eq("course_id", courseId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

// Quizzes
export function useQuizzes() {
  return useQuery({
    queryKey: ["quizzes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("quizzes").select("*, courses(title), chapters(title)").order("created_at");
      if (error) throw error;
      return data;
    },
  });
}

// Quiz questions
export function useQuizQuestions(quizId?: string) {
  return useQuery({
    queryKey: ["quiz_questions", quizId],
    enabled: !!quizId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quizId!)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });
}

// Quiz attempts
export function useQuizAttempts() {
  return useQuery({
    queryKey: ["quiz_attempts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("quiz_attempts").select("*, quizzes(title, course_id)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useSubmitQuizAttempt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (attempt: { quiz_id: string; user_id: string; score: number; total: number; answers: number[] }) => {
      const { error } = await supabase.from("quiz_attempts").insert(attempt);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quiz_attempts"] }),
  });
}

// Purchases
export function usePurchases() {
  return useQuery({
    queryKey: ["purchases"],
    queryFn: async () => {
      const { data, error } = await supabase.from("purchases").select("*");
      if (error) throw error;
      return data;
    },
  });
}

// Lecture progress
export function useLectureProgress() {
  return useQuery({
    queryKey: ["lecture_progress"],
    queryFn: async () => {
      const { data, error } = await supabase.from("lecture_progress").select("*");
      if (error) throw error;
      return data;
    },
  });
}

export function useUpsertLectureProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (progress: { user_id: string; lecture_id: string; watched_percent: number; completed: boolean }) => {
      const { error } = await supabase.from("lecture_progress").upsert(progress, { onConflict: "user_id,lecture_id" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lecture_progress"] }),
  });
}

// Doubts
export function useDoubts(lectureId?: string) {
  return useQuery({
    queryKey: ["doubts", lectureId],
    queryFn: async () => {
      let q = supabase.from("doubts").select("*").order("created_at", { ascending: false });
      if (lectureId) q = q.eq("lecture_id", lectureId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateDoubt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (doubt: { lecture_id: string; course_id: string; user_id: string; student_name: string; question: string }) => {
      const { error } = await supabase.from("doubts").insert(doubt);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["doubts"] }),
  });
}

export function useReplyDoubt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ doubtId, reply }: { doubtId: string; reply: string }) => {
      const { error } = await supabase.from("doubts").update({ reply, replied_at: new Date().toISOString() }).eq("id", doubtId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["doubts"] }),
  });
}

// Announcements
export function useAnnouncements() {
  return useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data, error } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (announcement: { title: string; message: string; type: string }) => {
      const { error } = await supabase.from("announcements").insert(announcement);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  });
}

// Live classes
export function useLiveClasses() {
  return useQuery({
    queryKey: ["live_classes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("live_classes").select("*, courses(title), chapters(title)").order("scheduled_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// Attendance
export function useAttendance(liveClassId?: string) {
  return useQuery({
    queryKey: ["attendance", liveClassId],
    enabled: !!liveClassId,
    queryFn: async () => {
      const { data, error } = await supabase.from("attendance").select("*").eq("live_class_id", liveClassId!);
      if (error) throw error;
      return data;
    },
  });
}

// User roles (for super admin)
export function useUserRoles() {
  return useQuery({
    queryKey: ["user_roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*");
      if (error) throw error;
      return data;
    },
  });
}

// Profiles (for admin)
export function useProfiles() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// All purchases (admin)
export function useAllPurchases() {
  return useQuery({
    queryKey: ["all_purchases"],
    queryFn: async () => {
      const { data, error } = await supabase.from("purchases").select("*, courses(title), profiles!user_id(name, email)");
      if (error) throw error;
      return data;
    },
  });
}
