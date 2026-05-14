import React, { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth-context";

interface PurchaseContextType {
  purchasedCourses: string[];
  purchaseCourse: (courseId: string) => void;
  hasPurchased: (courseId: string) => boolean;
  canAccessLecture: (courseId: string, isFreePreview: boolean) => boolean;
  isLoading: boolean;
}

const PurchaseContext = createContext<PurchaseContextType | null>(null);

export function PurchaseProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ["my_purchases", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("purchases").select("course_id").eq("user_id", user!.id);
      if (error) throw error;
      return data.map((p) => p.course_id);
    },
  });

  const purchaseMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await supabase.from("purchases").insert({ user_id: user!.id, course_id: courseId });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my_purchases"] }),
  });

  const purchaseCourse = (courseId: string) => purchaseMutation.mutate(courseId);
  const hasPurchased = (courseId: string) => purchases.includes(courseId);
  const canAccessLecture = (courseId: string, isFreePreview: boolean) => isFreePreview || hasPurchased(courseId);

  return (
    <PurchaseContext.Provider value={{ purchasedCourses: purchases, purchaseCourse, hasPurchased, canAccessLecture, isLoading }}>
      {children}
    </PurchaseContext.Provider>
  );
}

export function usePurchase() {
  const ctx = useContext(PurchaseContext);
  if (!ctx) throw new Error("usePurchase must be inside PurchaseProvider");
  return ctx;
}
