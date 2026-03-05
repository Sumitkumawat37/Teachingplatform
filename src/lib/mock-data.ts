export const courses = [
  {
    id: "1",
    title: "Complete Mathematics",
    description: "Master algebra, calculus, and geometry with interactive lessons",
    chapters: 12,
    lectures: 48,
    progress: 65,
    thumbnail: "📐",
    color: "from-primary to-info",
  },
  {
    id: "2",
    title: "Physics Fundamentals",
    description: "Mechanics, thermodynamics, and optics explained simply",
    chapters: 10,
    lectures: 40,
    progress: 30,
    thumbnail: "⚛️",
    color: "from-info to-success",
  },
  {
    id: "3",
    title: "Chemistry Mastery",
    description: "Organic, inorganic and physical chemistry complete course",
    chapters: 8,
    lectures: 32,
    progress: 10,
    thumbnail: "🧪",
    color: "from-warning to-destructive",
  },
];

export const lectures = [
  { id: "1", courseId: "1", chapter: "Algebra", title: "Linear Equations", duration: "18:30", completed: true },
  { id: "2", courseId: "1", chapter: "Algebra", title: "Quadratic Equations", duration: "22:15", completed: true },
  { id: "3", courseId: "1", chapter: "Algebra", title: "Polynomials", duration: "25:00", completed: false },
  { id: "4", courseId: "1", chapter: "Calculus", title: "Limits & Continuity", duration: "30:45", completed: false },
  { id: "5", courseId: "1", chapter: "Calculus", title: "Differentiation", duration: "28:20", completed: false },
  { id: "6", courseId: "1", chapter: "Geometry", title: "Triangles", duration: "20:10", completed: false },
];

export const notes = [
  { id: "1", courseId: "1", chapter: "Algebra", title: "Linear Equations Formula Sheet", type: "PDF", pages: 12 },
  { id: "2", courseId: "1", chapter: "Algebra", title: "Practice Problems Set 1", type: "PDF", pages: 8 },
  { id: "3", courseId: "1", chapter: "Calculus", title: "Differentiation Rules", type: "PDF", pages: 15 },
  { id: "4", courseId: "2", chapter: "Mechanics", title: "Newton's Laws Summary", type: "PDF", pages: 10 },
  { id: "5", courseId: "2", chapter: "Mechanics", title: "Kinematics Formulas", type: "PDF", pages: 6 },
];

export const quizzes = [
  {
    id: "1",
    title: "Algebra Basics Quiz",
    courseId: "1",
    questions: 10,
    duration: "15 min",
    status: "available" as const,
    score: null,
  },
  {
    id: "2",
    title: "Quadratic Equations Test",
    courseId: "1",
    questions: 8,
    duration: "12 min",
    status: "completed" as const,
    score: 85,
  },
  {
    id: "3",
    title: "Physics: Newton's Laws",
    courseId: "2",
    questions: 10,
    duration: "15 min",
    status: "available" as const,
    score: null,
  },
  {
    id: "4",
    title: "Chemical Bonding Quiz",
    courseId: "3",
    questions: 12,
    duration: "20 min",
    status: "upcoming" as const,
    score: null,
  },
];

export const quizQuestions = [
  {
    id: 1,
    question: "What is the solution of 2x + 6 = 14?",
    options: ["x = 2", "x = 4", "x = 6", "x = 8"],
    correct: 1,
  },
  {
    id: 2,
    question: "Which of the following is a quadratic equation?",
    options: ["2x + 3 = 0", "x² + 5x + 6 = 0", "x³ = 27", "1/x = 5"],
    correct: 1,
  },
  {
    id: 3,
    question: "The discriminant of x² - 4x + 4 = 0 is:",
    options: ["0", "4", "8", "-4"],
    correct: 0,
  },
  {
    id: 4,
    question: "What is the sum of roots of x² - 7x + 12 = 0?",
    options: ["5", "7", "12", "-7"],
    correct: 1,
  },
  {
    id: 5,
    question: "If f(x) = 3x² + 2x + 1, then f(1) = ?",
    options: ["4", "5", "6", "7"],
    correct: 2,
  },
];

export const announcements = [
  { id: "1", title: "New Mathematics Course Launched!", message: "Check out our comprehensive algebra course with 48 video lectures.", date: "2026-03-04", type: "info" as const },
  { id: "2", title: "Quiz Results Published", message: "Quadratic Equations test results are now available. Check your scores!", date: "2026-03-03", type: "success" as const },
  { id: "3", title: "Holiday Schedule", message: "No classes on March 10th due to national holiday.", date: "2026-03-02", type: "warning" as const },
  { id: "4", title: "Study Material Updated", message: "New practice problems added for Physics mechanics chapter.", date: "2026-03-01", type: "info" as const },
];

export const students = [
  { id: "1", name: "Aarav Sharma", email: "aarav@example.com", courses: 3, avgScore: 82, lastActive: "2 hours ago" },
  { id: "2", name: "Priya Patel", email: "priya@example.com", courses: 2, avgScore: 91, lastActive: "1 hour ago" },
  { id: "3", name: "Rohan Kumar", email: "rohan@example.com", courses: 3, avgScore: 74, lastActive: "5 hours ago" },
  { id: "4", name: "Ananya Singh", email: "ananya@example.com", courses: 1, avgScore: 88, lastActive: "1 day ago" },
  { id: "5", name: "Vikram Mehta", email: "vikram@example.com", courses: 2, avgScore: 67, lastActive: "3 hours ago" },
];

export const performanceData = [
  { month: "Jan", score: 72 },
  { month: "Feb", score: 78 },
  { month: "Mar", score: 85 },
  { month: "Apr", score: 82 },
  { month: "May", score: 90 },
  { month: "Jun", score: 88 },
];
