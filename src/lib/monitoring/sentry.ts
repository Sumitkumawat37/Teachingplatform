import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import { supabase } from "@/integrations/supabase/client";

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || import.meta.env.SENTRY_DSN;

export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn("Sentry DSN not configured - monitoring disabled");
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.NODE_ENV || "production",
    integrations: [
      new BrowserTracing({
        tracingOrigins: [
          "localhost",
          "www.upscwithnadiya.in",
          /^\//,
        ],
      }),
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    beforeSend(event, hint) {
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers;
      }
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }
      return event;
    },
    beforeBreadcrumb(breadcrumb) {
      if (breadcrumb.category === "xhr" || breadcrumb.category === "fetch") {
        if (breadcrumb.data?.url) {
          breadcrumb.data.url = breadcrumb.data.url.split("?")[0];
        }
      }
      return breadcrumb;
    },
  });

  supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      Sentry.setUser({
        id: session.user.id,
        email: session.user.email,
      });
    } else {
      Sentry.setUser(null);
    }
  });
}

export function captureException(error: Error, context?: Record<string, any>) {
  if (SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context,
    });
  }
}

export function captureMessage(message: string, level: "info" | "warning" | "error" = "info") {
  if (SENTRY_DSN) {
    Sentry.captureMessage(message, {
      level,
    });
  }
}

export function setTag(key: string, value: string) {
  if (SENTRY_DSN) {
    Sentry.setTag(key, value);
  }
}

export function setUserContext(userId: string, email?: string) {
  if (SENTRY_DSN) {
    Sentry.setUser({
      id: userId,
      email,
    });
  }
}

export function clearUserContext() {
  if (SENTRY_DSN) {
    Sentry.setUser(null);
  }
}
