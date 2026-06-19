import posthog from "posthog-js";
import { supabase } from "@/integrations/supabase/client";

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || import.meta.env.POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || import.meta.env.POSTHOG_HOST || "https://app.posthog.com";

export function initPosthog() {
  if (!POSTHOG_KEY) {
    console.warn("PostHog key not configured - analytics disabled");
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: true,
    capture_pageleave: true,
    persistence: "localStorage",
    autocapture: false,
    loaded: (ph) => {
      supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          ph.identify(session.user.id, {
            email: session.user.email,
            created_at: session.user.created_at,
          });
        } else {
          ph.reset();
        }
      });
    },
  });
}

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (POSTHOG_KEY) {
    posthog.capture(eventName, properties);
  }
}

export function trackPageView(page: string, properties?: Record<string, any>) {
  if (POSTHOG_KEY) {
    posthog.capture("$pageview", {
      $current_url: window.location.href,
      page,
      ...properties,
    });
  }
}

export function setUserProperties(userId: string, properties: Record<string, any>) {
  if (POSTHOG_KEY) {
    posthog.people.set(properties);
    posthog.identify(userId);
  }
}

export function resetUser() {
  if (POSTHOG_KEY) {
    posthog.reset();
  }
}

export const AnalyticsEvents = {
  COURSE_VIEWED: "course_viewed",
  COURSE_PURCHASED: "course_purchased",
  COURSE_ENROLLED: "course_enrolled",
  LECTURE_STARTED: "lecture_started",
  LECTURE_COMPLETED: "lecture_completed",
  LECTURE_PAUSED: "lecture_paused",
  LECTURE_RESUMED: "lecture_resumed",
  LECTURE_SEEKED: "lecture_seeked",
  PAYMENT_INITIATED: "payment_initiated",
  PAYMENT_COMPLETED: "payment_completed",
  PAYMENT_FAILED: "payment_failed",
  PAYMENT_CANCELLED: "payment_cancelled",
  USER_SIGNED_UP: "user_signed_up",
  USER_LOGGED_IN: "user_logged_in",
  USER_LOGGED_OUT: "user_logged_out",
  DOUBT_SUBMITTED: "doubt_submitted",
  DOUBT_ANSWERED: "doubt_answered",
  QUIZ_ATTEMPTED: "quiz_attempted",
  NOTE_CREATED: "note_created",
  BOOKMARK_ADDED: "bookmark_added",
  LIVE_CLASS_JOINED: "live_class_joined",
  LIVE_CLASS_LEFT: "live_class_left",
  MENTORING_REQUESTED: "mentoring_requested",
  MENTORING_SCHEDULED: "mentoring_scheduled",
  ERROR_OCCURRED: "error_occurred",
} as const;

export function trackCourseViewed(courseId: string, courseTitle: string) {
  trackEvent(AnalyticsEvents.COURSE_VIEWED, {
    course_id: courseId,
    course_title: courseTitle,
  });
}

export function trackLectureStarted(lectureId: string, courseId: string) {
  trackEvent(AnalyticsEvents.LECTURE_STARTED, {
    lecture_id: lectureId,
    course_id: courseId,
  });
}

export function trackLectureCompleted(lectureId: string, courseId: string, duration: number) {
  trackEvent(AnalyticsEvents.LECTURE_COMPLETED, {
    lecture_id: lectureId,
    course_id: courseId,
    duration,
  });
}

export function trackPaymentCompleted(courseId: string, amount: number, method: string) {
  trackEvent(AnalyticsEvents.PAYMENT_COMPLETED, {
    course_id: courseId,
    amount,
    payment_method: method,
  });
}
