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
      let q = supabase
        .from("lectures")
        .select("*, chapters(title, sort_order)")
        .order("sort_order", { ascending: true });
      if (courseId) q = q.eq("course_id", courseId);
      const { data, error } = await q;
      if (error) throw error;
      // Sort by chapter sort_order first, then lecture sort_order
      return data?.sort((a: any, b: any) => {
        const chapterOrderDiff = (a.chapters?.sort_order || 0) - (b.chapters?.sort_order || 0);
        if (chapterOrderDiff !== 0) return chapterOrderDiff;
        return (a.sort_order || 0) - (b.sort_order || 0);
      });
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

// All purchases (admin) - disabled due to database schema issues
export function useAllPurchases() {
  return useQuery({
    queryKey: ["all_purchases"],
    queryFn: async () => [],
  });
}

// Course Feedback
export function useCourseFeedback(courseId?: string) {
  return useQuery({
    queryKey: ["course_feedback", courseId],
    enabled: !!courseId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("course_feedback")
        .select("*, profiles(name, avatar_url)")
        .eq("course_id", courseId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateFeedback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (feedback: {
      course_id: string;
      user_id: string;
      rating: number;
      comment: string;
    }) => {
      const { data, error } = await (supabase as any)
        .from("course_feedback")
        .insert(feedback)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["course_feedback"] }),
  });
}

export function useDeleteFeedback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("course_feedback").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["course_feedback"] }),
  });
}

// Course Review Videos
export function useCourseReviewVideos(courseId?: string) {
  return useQuery({
    queryKey: ["course_review_videos", courseId],
    enabled: !!courseId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("course_review_videos")
        .select("*")
        .eq("course_id", courseId!)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}
