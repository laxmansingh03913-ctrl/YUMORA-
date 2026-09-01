const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://rwqzuigozagzgioixpgn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3cXp1aWdvemFnemdpb2l4cGduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5ODA2NzksImV4cCI6MjEwMjU1NjY3OX0.yFhMlXfPIB1xtEHFt7SMPPiGAaNbI1w6wMNnRv8FhBk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkStorage() {
  console.log("=== CHECKING SUPABASE STORAGE BUCKETS ===");
  
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error("Storage bucket error:", error);
    return;
  }

  console.log("Buckets found:", buckets.map(b => b.name));

  for (const b of buckets) {
    const { data: files } = await supabase.storage.from(b.name).list();
    console.log(`Bucket "${b.name}" has ${files ? files.length : 0} items at root`);
    if (files) {
      files.forEach(f => console.log(`  - ${f.name}`));
    }
  }
}

checkStorage();
