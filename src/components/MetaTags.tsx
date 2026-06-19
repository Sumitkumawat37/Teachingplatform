import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const PRIMARY_DOMAIN = "https://www.upscwithnadiya.in";

const pageTitles: Record<string, { title: string; description: string }> = {
  "/": {
    title: "UPSC by Nadiya Ma'am - Online Courses & Live Classes",
    description: "UPSC preparation by Nadiya Ma'am — courses, live classes, notes & quizzes for aspirants."
  },
  "/login": {
    title: "Login - UPSC by Nadiya Ma'am",
    description: "Login to access your UPSC preparation courses and materials."
  },
  "/signup": {
    title: "Sign Up - UPSC by Nadiya Ma'am",
    description: "Create an account to start your UPSC preparation journey with expert guidance."
  },
  "/courses": {
    title: "Courses - UPSC by Nadiya Ma'am",
    description: "Browse comprehensive UPSC courses covering Polity, Governance, and more."
  },
  "/live-classes": {
    title: "Live Classes - UPSC by Nadiya Ma'am",
    description: "Join live interactive sessions with Nadiya Ma'am for real-time doubt clearing."
  },
  "/notes": {
    title: "Study Notes - UPSC by Nadiya Ma'am",
    description: "Access curated study notes, PYQs, and PDF downloads for UPSC preparation."
  },
  "/doubts": {
    title: "Doubts - UPSC by Nadiya Ma'am",
    description: "Get your doubts resolved by expert teachers and connect with fellow aspirants."
  },
  "/mentoring": {
    title: "1:1 Mentoring - UPSC by Nadiya Ma'am",
    description: "Personalized guidance and mentoring for UPSC aspirants with expert faculty."
  },
  "/profile": {
    title: "Profile - UPSC by Nadiya Ma'am",
    description: "Manage your profile and account settings."
  },
  "/notifications": {
    title: "Notifications - UPSC by Nadiya Ma'am",
    description: "Stay updated with latest announcements and class schedules."
  },
  "/admin": {
    title: "Admin Dashboard - UPSC by Nadiya Ma'am",
    description: "Manage courses, students, and platform content."
  },
};

export function MetaTags() {
  const location = useLocation();
  const path = location.pathname;
  
  // Find matching page or use closest parent
  const meta = pageTitles[path] || 
    pageTitles[Object.keys(pageTitles).find(key => path.startsWith(key) && key !== "/") || ""] ||
    pageTitles["/"];

  // Generate canonical URL
  const canonicalUrl = `${PRIMARY_DOMAIN}${path}`;

  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:url" content={canonicalUrl} />
    </Helmet>
  );
}
