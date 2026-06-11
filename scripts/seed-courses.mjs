// Run with: node scripts/seed-courses.mjs
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://naysnsxwazrvxfbtmrbn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_aYEAYkzTtU9dt58ZEPetNw_n5cB3P9G';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Generate UUIDs
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const courses = [
  {
    id: generateUUID(),
    title: 'Polity and Governance',
    description: 'Comprehensive coverage of Indian Polity and Governance for UPSC',
    price: 9999,
    category: 'Polity',
    instructor: 'Nadiya Maam',
    thumbnail_emoji: '📚',
    color: 'from-sky-400 to-cyan-400',
    chapters: [
      { title: 'Indian Polity', sort_order: 1 },
      { title: 'Indian Economy', sort_order: 2 },
      { title: 'Geography', sort_order: 3 },
      { title: 'History', sort_order: 4 },
    ],
    lectures: [
      { title: 'Introduction to Indian Polity', duration: '45:00', youtube_id: 'HEfHFsfGXjs', free_preview: true, sort_order: 1 },
      { title: 'Constitution of India', duration: '60:00', youtube_id: '2ZgBJxT3aXg', free_preview: true, sort_order: 2 },
      { title: 'Basic Economic Concepts', duration: '50:00', youtube_id: 'FFm_mEVdcmI', free_preview: true, sort_order: 3 },
      { title: 'GDP & Development', duration: '55:00', youtube_id: 'riXcZT2ICjA', free_preview: true, sort_order: 4 },
      { title: 'Physical Geography', duration: '40:00', youtube_id: 'rAof9Ld5sOg', free_preview: false, sort_order: 5 },
      { title: 'Ancient India', duration: '50:00', youtube_id: 'mLeNaZcy1hE', free_preview: false, sort_order: 6 },
      { title: 'Medieval India', duration: '45:00', youtube_id: 'kKKM8Y-u7ds', free_preview: false, sort_order: 7 },
    ],
  },
  {
    id: generateUUID(),
    title: 'Mentoring',
    description: 'Personalized mentoring and guidance for UPSC aspirants',
    price: 14999,
    category: 'Mentoring',
    instructor: 'Nadiya Maam',
    thumbnail_emoji: '📖',
    color: 'from-violet-400 to-purple-400',
    chapters: [
      { title: 'Ethics & Integrity', sort_order: 1 },
      { title: 'Essay Writing', sort_order: 2 },
    ],
    lectures: [
      { title: 'Ethics in Governance', duration: '55:00', youtube_id: 'w4QFJb9a8vo', free_preview: true, sort_order: 1 },
      { title: 'Essay Writing Basics', duration: '45:00', youtube_id: 'HEfHFsfGXjs', free_preview: true, sort_order: 2 },
      { title: 'Answer Writing Strategy', duration: '50:00', youtube_id: '2ZgBJxT3aXg', free_preview: true, sort_order: 3 },
      { title: 'Interview Preparation', duration: '40:00', youtube_id: 'FFm_mEVdcmI', free_preview: true, sort_order: 4 },
    ],
  },
];

async function seedCourses() {
  console.log('=== Seeding Courses ===\n');

  for (const course of courses) {
    console.log(`→ Processing: ${course.title}`);

    // Insert course
    const { error: courseError } = await supabase
      .from('courses')
      .upsert({
        id: course.id,
        title: course.title,
        description: course.description,
        price: course.price,
        category: course.category,
        instructor: course.instructor,
        thumbnail_emoji: course.thumbnail_emoji,
        color: course.color,
      }, { onConflict: 'id' });

    if (courseError) {
      console.error(`  ✗ Course error: ${courseError.message}`);
      continue;
    }
    console.log(`  ✓ Course created`);

    // Insert chapters with generated UUIDs
    const chapterMap = new Map();
    for (const chapter of course.chapters) {
      const chapterId = generateUUID();
      chapterMap.set(chapter.title, chapterId);

      const { error: chapterError } = await supabase
        .from('chapters')
        .upsert({
          id: chapterId,
          course_id: course.id,
          title: chapter.title,
          sort_order: chapter.sort_order,
        }, { onConflict: 'id' });

      if (chapterError) {
        console.error(`    ✗ Chapter "${chapter.title}" error: ${chapterError.message}`);
      } else {
        console.log(`    ✓ Chapter: ${chapter.title}`);
      }
    }

    // Insert lectures with generated UUIDs
    let lectureIndex = 0;
    for (const lecture of course.lectures) {
      // Map lecture to chapter by title pattern or order
      const chapterIndex = Math.floor(lectureIndex / (course.lectures.length / course.chapters.length));
      const chapterTitle = course.chapters[Math.min(chapterIndex, course.chapters.length - 1)].title;
      const chapterId = chapterMap.get(chapterTitle);

      const { error: lectureError } = await supabase
        .from('lectures')
        .upsert({
          id: generateUUID(),
          course_id: course.id,
          chapter_id: chapterId,
          title: lecture.title,
          duration: lecture.duration,
          youtube_id: lecture.youtube_id,
          free_preview: lecture.free_preview,
          sort_order: lecture.sort_order,
        }, { onConflict: 'id' });

      if (lectureError) {
        console.error(`    ✗ Lecture "${lecture.title}" error: ${lectureError.message}`);
      } else {
        console.log(`    ✓ Lecture: ${lecture.title}`);
      }
      lectureIndex++;
    }

    console.log();
  }

  console.log('=== Done ===');
}

seedCourses();
