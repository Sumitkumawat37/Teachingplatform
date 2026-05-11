import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Helper to extract YouTube video ID from various URL formats
export function extractYoutubeId(url: string): string {
  if (!url) return "";
  // Already an ID (no slashes or dots)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return url;
}

// Courses
export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (course: {
      title: string; description: string; price: number; category: string;
      instructor: string; thumbnail_url?: string; thumbnail_emoji?: string; color?: string;
    }) => {
      const { data, error } = await supabase.from("courses").insert(course).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
}

export function useUpdateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { error } = await supabase.from("courses").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
}

export function useDeleteCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
}

// Chapters
export function useCreateChapter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (chapter: { course_id: string; title: string; sort_order?: number }) => {
      const { data, error } = await supabase.from("chapters").insert(chapter).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chapters"] }),
  });
}

export function useDeleteChapter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("chapters").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chapters"] });
      qc.invalidateQueries({ queryKey: ["lectures"] });
    },
  });
}

// Lectures
export function useCreateLecture() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (lecture: {
      course_id: string; chapter_id: string; title: string;
      youtube_id: string; duration?: string; free_preview?: boolean; sort_order?: number;
    }) => {
      const { data, error } = await supabase.from("lectures").insert({
        ...lecture,
        youtube_id: extractYoutubeId(lecture.youtube_id),
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lectures"] }),
  });
}

export function useUpdateLecture() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { error } = await supabase.from("lectures").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lectures"] }),
  });
}

export function useDeleteLecture() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lectures").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lectures"] }),
  });
}

// Notes
export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (note: {
      course_id: string; chapter_id: string; title: string;
      description?: string; file_url?: string; file_type?: string; pages?: number;
    }) => {
      const { data, error } = await supabase.from("notes").insert(note).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}

// Quizzes
export function useCreateQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (quiz: {
      course_id: string; chapter_id: string; title: string; duration?: string; status?: string;
    }) => {
      const { data, error } = await supabase.from("quizzes").insert(quiz).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quizzes"] }),
  });
}

export function useDeleteQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("quizzes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quizzes"] }),
  });
}

// Quiz Questions
export function useCreateQuizQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (q: {
      quiz_id: string; question: string; options: string[]; correct_index: number; sort_order?: number;
    }) => {
      const { data, error } = await supabase.from("quiz_questions").insert(q).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quiz_questions"] }),
  });
}

export function useDeleteQuizQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("quiz_questions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quiz_questions"] }),
  });
}

// Live Classes
export function useCreateLiveClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cls: {
      course_id: string; chapter_id: string; title: string;
      scheduled_at: string; meeting_link: string; duration?: string; status?: string;
    }) => {
      const { data, error } = await supabase.from("live_classes").insert(cls).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["live_classes"] }),
  });
}

export function useUpdateLiveClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { error } = await supabase.from("live_classes").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["live_classes"] }),
  });
}

export function useDeleteLiveClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("live_classes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["live_classes"] }),
  });
}

// Attendance
export function useMarkAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ live_class_id, student_name }: { live_class_id: string; student_name: string }) => {
      const { data: userRes } = await supabase.auth.getUser();
      const user_id = userRes.user?.id;
      if (!user_id) return;
      // Avoid duplicate join rows for same user+class
      const { data: existing } = await supabase
        .from("attendance")
        .select("id")
        .eq("live_class_id", live_class_id)
        .eq("user_id", user_id)
        .maybeSingle();
      if (existing) return existing;
      const { data, error } = await supabase
        .from("attendance")
        .insert({ live_class_id, user_id, student_name })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ["attendance", vars.live_class_id] }),
  });
}

// Announcements
export function useDeleteAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  });
}
