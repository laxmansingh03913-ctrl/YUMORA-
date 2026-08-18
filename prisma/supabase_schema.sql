-- ====================================================================
-- YUMORA SUPABASE REAL POSTGRESQL DATABASE SCHEMA
-- Execute this script in Supabase SQL Editor (https://supabase.com/dashboard/project/rwqzuigozagzgioixpgn/sql)
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('READER', 'CREATOR', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE content_status AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'HIATUS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE content_rating AS ENUM ('EVERYONE', 'TEEN', 'MATURE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Users Table (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role DEFAULT 'READER',
    avatar TEXT,
    banner TEXT,
    bio TEXT,
    country TEXT DEFAULT 'Global',
    website TEXT,
    twitter TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_creator_profile_complete BOOLEAN DEFAULT FALSE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_age_verified BOOLEAN DEFAULT TRUE,
    followers_count INT DEFAULT 0,
    following_count INT DEFAULT 0,
    total_reads INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Follows Table
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- 5. Novels Table
CREATE TABLE IF NOT EXISTS public.novels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    cover_url TEXT NOT NULL,
    banner_url TEXT,
    genre TEXT NOT NULL,
    secondary_genre TEXT,
    tags TEXT[] DEFAULT '{}',
    language TEXT DEFAULT 'en',
    status content_status DEFAULT 'ONGOING',
    content_rating content_rating DEFAULT 'TEEN',
    content_warning TEXT,
    views INT DEFAULT 0,
    reads INT DEFAULT 0,
    likes_count INT DEFAULT 0,
    bookmarks_count INT DEFAULT 0,
    rating NUMERIC(3,2) DEFAULT 5.00,
    total_ratings INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_editor_pick BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    chapters_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Novel Chapters Table
CREATE TABLE IF NOT EXISTS public.chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    novel_id UUID NOT NULL REFERENCES public.novels(id) ON DELETE CASCADE,
    chapter_number INT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status content_status DEFAULT 'PUBLISHED',
    word_count INT DEFAULT 0,
    read_time_minutes INT DEFAULT 1,
    is_free BOOLEAN DEFAULT TRUE,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(novel_id, chapter_number)
);

-- 7. Comics Table
CREATE TABLE IF NOT EXISTS public.comics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    cover_url TEXT NOT NULL,
    banner_url TEXT,
    genre TEXT NOT NULL,
    secondary_genre TEXT,
    tags TEXT[] DEFAULT '{}',
    language TEXT DEFAULT 'en',
    format TEXT DEFAULT 'PAGE_BASED',
    reading_direction TEXT DEFAULT 'RTL',
    sub_type TEXT DEFAULT 'MANGA',
    allow_pdf_download BOOLEAN DEFAULT TRUE,
    status content_status DEFAULT 'ONGOING',
    content_rating content_rating DEFAULT 'TEEN',
    content_warning TEXT,
    views INT DEFAULT 0,
    reads INT DEFAULT 0,
    likes_count INT DEFAULT 0,
    bookmarks_count INT DEFAULT 0,
    rating NUMERIC(3,2) DEFAULT 5.00,
    total_ratings INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_editor_pick BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    episodes_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Comic Episodes Table
CREATE TABLE IF NOT EXISTS public.episodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comic_id UUID NOT NULL REFERENCES public.comics(id) ON DELETE CASCADE,
    episode_number INT NOT NULL,
    title TEXT NOT NULL,
    thumbnail_url TEXT,
    image_urls TEXT[] NOT NULL DEFAULT '{}',
    status content_status DEFAULT 'PUBLISHED',
    likes_count INT DEFAULT 0,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(comic_id, episode_number)
);

-- 9. Likes, Bookmarks & Reading Progress
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_id UUID NOT NULL,
    target_type TEXT NOT NULL, -- 'NOVEL', 'COMIC', 'CHAPTER', 'EPISODE'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, target_id, target_type)
);

CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    novel_id UUID REFERENCES public.novels(id) ON DELETE CASCADE,
    comic_id UUID REFERENCES public.comics(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reading_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    novel_id UUID REFERENCES public.novels(id) ON DELETE CASCADE,
    comic_id UUID REFERENCES public.comics(id) ON DELETE CASCADE,
    chapter_number INT DEFAULT 1,
    episode_number INT DEFAULT 1,
    scroll_position INT DEFAULT 0,
    percentage INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    novel_id UUID REFERENCES public.novels(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
    comic_id UUID REFERENCES public.comics(id) ON DELETE CASCADE,
    episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Contests Table
CREATE TABLE IF NOT EXISTS public.contests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    subtitle TEXT,
    description TEXT NOT NULL,
    banner_url TEXT,
    prize_pool TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    rules TEXT[] DEFAULT '{}',
    eligible_genres TEXT[] DEFAULT '{}',
    min_chapters INT DEFAULT 2,
    submission_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.novels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users Can Update Own Profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public Read Novels" ON public.novels FOR SELECT USING (true);
CREATE POLICY "Creators Can Insert Novels" ON public.novels FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators Can Update Own Novels" ON public.novels FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Public Read Chapters" ON public.chapters FOR SELECT USING (true);
CREATE POLICY "Public Read Comics" ON public.comics FOR SELECT USING (true);
CREATE POLICY "Public Read Episodes" ON public.episodes FOR SELECT USING (true);
CREATE POLICY "Public Read Comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Public Read Contests" ON public.contests FOR SELECT USING (true);

-- Authenticated User Policies
CREATE POLICY "Authenticated Users Can Comment" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated Users Can Like" ON public.likes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Authenticated Users Can Bookmark" ON public.bookmarks FOR ALL USING (auth.uid() = user_id);

-- 13. Automatic Trigger to create Profile on Supabase Auth Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, username, name, avatar, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'),
        COALESCE((new.raw_user_meta_data->>'role')::user_role, 'READER')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
