const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createDraftsTable() {
  console.log("Creating creator_drafts table in Supabase PostgreSQL...");

  const queries = [
    `CREATE TABLE IF NOT EXISTS public.creator_drafts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      series_id TEXT,
      format TEXT NOT NULL DEFAULT 'NOVEL',
      title TEXT,
      description TEXT,
      cover_url TEXT,
      banner_url TEXT,
      genre TEXT,
      secondary_genre TEXT,
      tags TEXT[] DEFAULT '{}',
      upload_mode TEXT DEFAULT 'NEW_SERIES',
      current_step INT DEFAULT 3,
      chapters_data JSONB NOT NULL DEFAULT '{}'::jsonb,
      last_saved_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      CONSTRAINT fk_creator_drafts_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
    );`,
    `CREATE INDEX IF NOT EXISTS idx_creator_drafts_user_id ON public.creator_drafts(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_creator_drafts_last_saved ON public.creator_drafts(last_saved_at DESC);`
  ];

  for (const q of queries) {
    await prisma.$executeRawUnsafe(q);
  }
  console.log("✓ Successfully created/verified public.creator_drafts table!");
  await prisma.$disconnect();
}

createDraftsTable();
