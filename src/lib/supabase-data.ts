import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth-context";
import { getSupabasePaginationRange, calculatePagination } from "./pagination";
import { cacheGet, cacheSet, cacheDelete, cacheDeletePattern } from "./redis";

// Courses
export function useCourses(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ["courses", page, limit],
    queryFn: async () => {
      const cacheKey = `courses:page:${page}:limit:${limit}`;
      
      // Try cache first
      const cached = await cacheGet(cacheKey);
      if (cached) {
        return cached;
      }
      
      const { from, to } = getSupabasePaginationRange(page, limit);
      const { data, error, count } = await supabase
        .from("courses")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) throw error;
      
      const result = {
        data: data || [],
        pagination: calculatePagination(page, limit, count || 0),
      };
      
      // Cache for 5 minutes
      await cacheSet(cacheKey, result, 300);
      
      return result;
    },
  });
}

// Chapters for a course
export function useChapters(courseId?: string) {
  return useQuery({
    queryKey: ["chapters", courseId],
    queryFn: async () => {
      const cacheKey = courseId ? `chapters:course:${courseId}` : "chapters:all";
      
      // Try cache first
      const cached = await cacheGet(cacheKey);
      if (cached) {
        return cached;
      }
      
      let q = supabase.from("chapters").select("*").order("sort_order");
      if (courseId) q = q.eq("course_id", courseId);
      const { data, error } = await q;
      if (error) throw error;
      
      // Cache for 10 minutes
      await cacheSet(cacheKey, data, 600);
      
      return data;
    },
  });
}

// Lectures
export function useLectures(courseId?: string) {
  return useQuery({
    queryKey: ["lectures", courseId],
    queryFn: async () => {
      const cacheKey = courseId ? `lectures:course:${courseId}` : "lectures:all";
      
      // Try cache first
      const cached = await cacheGet(cacheKey);
      if (cached) {
        return cached;
      }
      
      let q = supabase
        .from("lectures")
        .select("*, chapters(title, sort_order)")
        .order("sort_order", { ascending: true });
      if (courseId) q = q.eq("course_id", courseId);
      const { data, error } = await q;
      if (error) throw error;
      
      // Sort by chapter sort_order first, then lecture sort_order
      const sortedData = data?.sort((a: any, b: any) => {
        const chapterOrderDiff = (a.chapters?.sort_order || 0) - (b.chapters?.sort_order || 0);
        if (chapterOrderDiff !== 0) return chapterOrderDiff;
        return (a.sort_order || 0) - (b.sort_order || 0);
      });
      
      // Cache for 10 minutes
      await cacheSet(cacheKey, sortedData, 600);
      
      return sortedData;
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
  const { user } = useAuth();
  return useQuery({
    queryKey: ["lecture_progress"],
    queryFn: async () => {
      if (!user) return [];
      
      const cacheKey = `lecture_progress:user:${user.id}`;
      
      // Try cache first
      const cached = await cacheGet(cacheKey);
      if (cached) {
        return cached;
      }
      
      const { data, error } = await supabase.from("lecture_progress").select("*").eq("user_id", user.id);
      if (error) throw error;
      
      // Cache for 5 minutes
      await cacheSet(cacheKey, data, 300);
      
      return data;
    },
    enabled: !!user,
  });
}

export function useUpsertLectureProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (progress: { user_id: string; lecture_id: string; watched_percent: number; completed: boolean }) => {
      const { error } = await supabase.from("lecture_progress").upsert(progress, { onConflict: "user_id,lecture_id" });
      if (error) throw error;
      
      // Invalidate cache for this user's progress
      await cacheDeletePattern(`lecture_progress:user:${progress.user_id}:*`);
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
        .select("*")
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
