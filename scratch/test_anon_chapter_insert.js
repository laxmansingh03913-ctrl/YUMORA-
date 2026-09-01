const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://rwqzuigozagzgioixpgn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3cXp1aWdvemFnemdpb2l4cGduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5ODA2NzksImV4cCI6MjEwMjU1NjY3OX0.yFhMlXfPIB1xtEHFt7SMPPiGAaNbI1w6wMNnRv8FhBk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testChapterInsert() {
  const novelId = '6e6f7665-6c2d-4137-a838-313935363635'; // Ice Queen
  const chapterId = '63682d31-0000-0000-0000-000000000001';

  console.log("Attempting to insert Chapter 1 using anon client...");
  const { data, error } = await supabase
    .from("chapters")
    .upsert([
      {
        id: chapterId,
        novel_id: novelId,
        chapter_number: 1,
        title: "Chapter 1: The Secret Exposed",
        content: "Test content for Chapter 1",
        status: "PUBLISHED",
        word_count: 5,
        read_time_minutes: 1,
        is_free: true,
        published_at: new Date().toISOString()
      }
    ], { onConflict: "id" })
    .select();

  console.log("Result data:", data);
  console.log("Result error:", error);
}

testChapterInsert();
