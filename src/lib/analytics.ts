// Google Analytics GA4 Tracking Utility

declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void;
  }
}

// Initialize gtag if not already defined
if (typeof window !== 'undefined' && !window.gtag) {
  window.gtag = function() {
    (window.dataLayer = window.dataLayer || []).push(arguments);
  };
}

export const GA_MEASUREMENT_ID = 'G-1V0BYE0RK2';

// Track page views
export const trackPageView = (path: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: path,
      page_title: title,
    });
  }
};

// Track custom events
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

// Specific event tracking functions
export const trackEnrollNowClick = (courseId: string, courseTitle: string, price: number) => {
  trackEvent('enroll_now_click', {
    course_id: courseId,
    course_title: courseTitle,
    price: price,
  });
};

export const trackLoginClick = () => {
  trackEvent('login_click', {
    method: 'email',
  });
};

export const trackSignupClick = () => {
  trackEvent('signup_click', {
    method: 'email',
  });
};

export const trackCoursePageVisit = (courseId: string, courseTitle: string) => {
  trackEvent('course_page_visit', {
    course_id: courseId,
    course_title: courseTitle,
  });
};

export const trackCoursePurchase = (courseId: string, courseTitle: string, price: number) => {
  trackEvent('purchase', {
    transaction_id: courseId,
    items: [{
      item_id: courseId,
      item_name: courseTitle,
      price: price,
      quantity: 1,
    }],
    value: price,
    currency: 'INR',
  });
};

export const trackLectureView = (courseId: string, lectureId: string, lectureTitle: string) => {
  trackEvent('lecture_view', {
    course_id: courseId,
    lecture_id: lectureId,
    lecture_title: lectureTitle,
  });
};

export const trackNoteDownload = (noteId: string, noteTitle: string) => {
  trackEvent('note_download', {
    note_id: noteId,
    note_title: noteTitle,
  });
};
