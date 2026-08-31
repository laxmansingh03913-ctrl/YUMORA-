// One-time fix: Sync chapters_count for all novels in DB
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://rwqzuigozagzgioixpgn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3cXp1aWdvemFnemdpb2l4cGduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5ODA2NzksImV4cCI6MjEwMjU1NjY3OX0.yFhMlXfPIB1xtEHFt7SMPPiGAaNbI1w6wMNnRv8FhBk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  // Get all novels
  const { data: novels, error } = await supabase.from('novels').select('id, title');
  if (error) { console.error('Failed to fetch novels:', error); return; }

  console.log(`Syncing chapters_count for ${novels.length} novels...`);

  for (const novel of novels) {
    // Count actual chapters for this novel
    const { count } = await supabase
      .from('chapters')
      .select('id', { count: 'exact', head: true })
      .eq('novel_id', novel.id);

    // Update chapters_count
    const { error: updateError } = await supabase
      .from('novels')
      .update({ chapters_count: count || 0 })
      .eq('id', novel.id);

    if (updateError) {
      console.log(`ERROR updating "${novel.title}": ${updateError.message}`);
    } else {
      console.log(`✓ "${novel.title.slice(0, 50)}" → chapters_count = ${count}`);
    }
  }
  
  console.log('\nDone! All novels chapters_count synced.');
}

run().catch(console.error);
