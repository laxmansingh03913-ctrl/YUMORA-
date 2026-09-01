-- ============================================================================
-- YOUMIKA PRODUCTION DATABASE SCHEMA & COMPLETE MIGRATION
-- Project: Youmika (https://youmika.site)
-- Engine: PostgreSQL / Supabase
-- Target Database: rwqzuigozagzgioixpgn
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE content_status AS ENUM ('DRAFT', 'ONGOING', 'COMPLETED', 'HIATUS');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE content_rating AS ENUM ('EVERYONE', 'TEEN', 'MATURE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE role_type AS ENUM ('READER', 'CREATOR', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. PROFILES TABLE (Linked 1-to-1 with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role role_type DEFAULT 'CREATOR',
    avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    banner TEXT,
    bio TEXT,
    country TEXT DEFAULT 'Global',
    website TEXT,
    twitter TEXT,
    preferred_types TEXT[] DEFAULT '{}',
    primary_genres TEXT[] DEFAULT '{}',
    is_verified BOOLEAN DEFAULT FALSE,
    is_creator_profile_complete BOOLEAN DEFAULT FALSE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_age_verified BOOLEAN DEFAULT TRUE,
    monetization_tier TEXT DEFAULT 'NONE',
    monetization_status TEXT DEFAULT 'NOT_APPLIED',
    fraud_audit_status TEXT DEFAULT 'CLEAN',
    followers_count INT DEFAULT 0,
    following_count INT DEFAULT 0,
    total_reads INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. NOVELS TABLE
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
    format TEXT DEFAULT 'STANDARD',
    sub_type TEXT DEFAULT 'WEB_NOVEL',
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

-- Safely backfill format columns if previously NULL
ALTER TABLE public.novels ADD COLUMN IF NOT EXISTS format TEXT DEFAULT 'STANDARD';
ALTER TABLE public.novels ADD COLUMN IF NOT EXISTS sub_type TEXT DEFAULT 'WEB_NOVEL';
UPDATE public.novels SET format = 'STANDARD', sub_type = 'WEB_NOVEL' WHERE format IS NULL OR sub_type IS NULL;

-- 5. NOVEL CHAPTERS TABLE
CREATE TABLE IF NOT EXISTS public.chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    novel_id UUID NOT NULL REFERENCES public.novels(id) ON DELETE CASCADE,
    chapter_number INT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status content_status DEFAULT 'ONGOING',
    word_count INT DEFAULT 0,
    is_free BOOLEAN DEFAULT TRUE,
    read_time_minutes INT DEFAULT 1,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(novel_id, chapter_number)
);

-- 6. COMICS & MANGA TABLE
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

-- 7. COMIC EPISODES TABLE
CREATE TABLE IF NOT EXISTS public.episodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comic_id UUID NOT NULL REFERENCES public.comics(id) ON DELETE CASCADE,
    episode_number INT NOT NULL,
    title TEXT NOT NULL,
    thumbnail_url TEXT,
    image_urls TEXT[] DEFAULT '{}',
    status content_status DEFAULT 'ONGOING',
    likes_count INT DEFAULT 0,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(comic_id, episode_number)
);

-- 8. USER ACTIVITY TABLES
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_id UUID NOT NULL,
    target_type TEXT DEFAULT 'STORY',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, target_id)
);

CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    novel_id UUID REFERENCES public.novels(id) ON DELETE CASCADE,
    comic_id UUID REFERENCES public.comics(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS public.reading_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content_id UUID NOT NULL,
    content_type TEXT DEFAULT 'NOVEL',
    chapter_number INT,
    episode_number INT,
    scroll_offset NUMERIC DEFAULT 0,
    page_index INT DEFAULT 0,
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, content_id)
);

CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    novel_id UUID REFERENCES public.novels(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
    comic_id UUID REFERENCES public.comics(id) ON DELETE CASCADE,
    episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    subtitle TEXT,
    description TEXT,
    banner_url TEXT,
    prize_pool TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'LIVE',
    rules TEXT[] DEFAULT '{}',
    eligible_genres TEXT[] DEFAULT '{}',
    min_chapters INT DEFAULT 2,
    submission_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. FINANCIAL TABLES (Wallets, Ledger, Payments, Payouts)
CREATE TABLE IF NOT EXISTS public.coin_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    balance INT NOT NULL DEFAULT 0 CHECK (balance >= 0),
    total_earned INT NOT NULL DEFAULT 0 CHECK (total_earned >= 0),
    total_spent INT NOT NULL DEFAULT 0 CHECK (total_spent >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.coin_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INT NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    reference_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_id TEXT NOT NULL,
    payment_id TEXT UNIQUE NOT NULL,
    package_id TEXT NOT NULL,
    amount_inr NUMERIC(10,2) NOT NULL,
    coins_credited INT NOT NULL CHECK (coins_credited > 0),
    status TEXT NOT NULL DEFAULT 'COMPLETED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payout_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount_inr NUMERIC(10,2) NOT NULL CHECK (amount_inr > 0),
    amount_usd NUMERIC(10,2),
    method TEXT NOT NULL DEFAULT 'UPI',
    details TEXT NOT NULL,
    account_holder_name TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'COMPLETED', 'REJECTED')),
    reference_id TEXT,
    note TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. PERFORMANCE & SECURITY INDEXES
CREATE INDEX IF NOT EXISTS idx_novels_format ON public.novels(format);
CREATE INDEX IF NOT EXISTS idx_novels_sub_type ON public.novels(sub_type);
CREATE INDEX IF NOT EXISTS idx_novels_creator_id ON public.novels(creator_id);
CREATE INDEX IF NOT EXISTS idx_comics_creator_id ON public.comics(creator_id);
CREATE INDEX IF NOT EXISTS idx_coin_wallets_user_id ON public.coin_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user_id ON public.coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_created_at ON public.coin_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_user_id ON public.payout_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON public.payout_requests(status);

-- 11. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.novels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

-- 12. RLS POLICIES

-- Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Public Content (Novels & Comics)
DROP POLICY IF EXISTS "Public novels are viewable by everyone" ON public.novels;
CREATE POLICY "Public novels are viewable by everyone" ON public.novels FOR SELECT USING (true);

DROP POLICY IF EXISTS "Creators can manage own novels" ON public.novels;
CREATE POLICY "Creators can manage own novels" ON public.novels FOR ALL USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Public comics are viewable by everyone" ON public.comics;
CREATE POLICY "Public comics are viewable by everyone" ON public.comics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Creators can manage own comics" ON public.comics;
CREATE POLICY "Creators can manage own comics" ON public.comics FOR ALL USING (auth.uid() = creator_id);

-- Chapters (Novels): Public read, creator can insert/update/delete their own chapters
DROP POLICY IF EXISTS "Public chapters are viewable by everyone" ON public.chapters;
CREATE POLICY "Public chapters are viewable by everyone" ON public.chapters FOR SELECT USING (true);

DROP POLICY IF EXISTS "Creators can insert own chapters" ON public.chapters;
CREATE POLICY "Creators can insert own chapters" ON public.chapters FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT creator_id FROM public.novels WHERE id = novel_id LIMIT 1)
  );

DROP POLICY IF EXISTS "Creators can update own chapters" ON public.chapters;
CREATE POLICY "Creators can update own chapters" ON public.chapters FOR UPDATE
  USING (
    auth.uid() = (SELECT creator_id FROM public.novels WHERE id = novel_id LIMIT 1)
  );

DROP POLICY IF EXISTS "Creators can delete own chapters" ON public.chapters;
CREATE POLICY "Creators can delete own chapters" ON public.chapters FOR DELETE
  USING (
    auth.uid() = (SELECT creator_id FROM public.novels WHERE id = novel_id LIMIT 1)
  );

-- Episodes (Comics): Public read, creator can insert/update/delete their own episodes
DROP POLICY IF EXISTS "Public episodes are viewable by everyone" ON public.episodes;
CREATE POLICY "Public episodes are viewable by everyone" ON public.episodes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Creators can insert own episodes" ON public.episodes;
CREATE POLICY "Creators can insert own episodes" ON public.episodes FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT creator_id FROM public.comics WHERE id = comic_id LIMIT 1)
  );

DROP POLICY IF EXISTS "Creators can update own episodes" ON public.episodes;
CREATE POLICY "Creators can update own episodes" ON public.episodes FOR UPDATE
  USING (
    auth.uid() = (SELECT creator_id FROM public.comics WHERE id = comic_id LIMIT 1)
  );

DROP POLICY IF EXISTS "Creators can delete own episodes" ON public.episodes;
CREATE POLICY "Creators can delete own episodes" ON public.episodes FOR DELETE
  USING (
    auth.uid() = (SELECT creator_id FROM public.comics WHERE id = comic_id LIMIT 1)
  );

-- User Activity (Likes, Bookmarks, Follows, Progress)
DROP POLICY IF EXISTS "Users manage own likes" ON public.likes;
CREATE POLICY "Users manage own likes" ON public.likes FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own bookmarks" ON public.bookmarks;
CREATE POLICY "Users manage own bookmarks" ON public.bookmarks FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own follows" ON public.follows;
CREATE POLICY "Users manage own follows" ON public.follows FOR ALL USING (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users manage own reading progress" ON public.reading_progress;
CREATE POLICY "Users manage own reading progress" ON public.reading_progress FOR ALL USING (auth.uid() = user_id);

-- Financial Tables (Strict Read-Only for Clients)
DROP POLICY IF EXISTS "Users can view own wallet" ON public.coin_wallets;
CREATE POLICY "Users can view own wallet" ON public.coin_wallets FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own transactions" ON public.coin_transactions;
CREATE POLICY "Users can view own transactions" ON public.coin_transactions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own payments" ON public.payment_transactions;
CREATE POLICY "Users can view own payments" ON public.payment_transactions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own payout requests" ON public.payout_requests;
CREATE POLICY "Users can view own payout requests" ON public.payout_requests FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

DROP POLICY IF EXISTS "Users can insert own payout requests" ON public.payout_requests;
CREATE POLICY "Users can insert own payout requests" ON public.payout_requests FOR INSERT WITH CHECK (
    auth.uid() = user_id AND status = 'PENDING'
);

-- 13. HARDENED & ATOMIC RPC FUNCTIONS

-- (A) process_coin_transfer: Authenticated Peer-to-Peer Tipping
CREATE OR REPLACE FUNCTION public.process_coin_transfer(
    p_recipient_id UUID,
    p_amount INT,
    p_description TEXT,
    p_reference_id TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_sender_id UUID;
    v_sender_balance INT;
    v_first_lock UUID;
    v_second_lock UUID;
BEGIN
    -- 1. Strictly authenticate sender via auth.uid()
    v_sender_id := auth.uid();
    IF v_sender_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Must be logged in to transfer coins');
    END IF;

    -- 2. Validate Amount
    IF p_amount <= 0 OR p_amount > 1000000 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid tip amount (must be between 1 and 1,000,000)');
    END IF;

    -- 3. Prevent Self-Transfer
    IF v_sender_id = p_recipient_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cannot tip or transfer coins to yourself');
    END IF;

    -- 4. Verify Recipient Profile Exists
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_recipient_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Recipient creator profile does not exist');
    END IF;

    -- 5. Deterministic Row Locking to Prevent Deadlocks
    IF v_sender_id < p_recipient_id THEN
        v_first_lock := v_sender_id;
        v_second_lock := p_recipient_id;
    ELSE
        v_first_lock := p_recipient_id;
        v_second_lock := v_sender_id;
    END IF;

    INSERT INTO public.coin_wallets (user_id, balance, total_earned, total_spent, updated_at)
    VALUES (v_sender_id, 0, 0, 0, NOW()) ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO public.coin_wallets (user_id, balance, total_earned, total_spent, updated_at)
    VALUES (p_recipient_id, 0, 0, 0, NOW()) ON CONFLICT (user_id) DO NOTHING;

    PERFORM balance FROM public.coin_wallets WHERE user_id = v_first_lock FOR UPDATE;
    PERFORM balance FROM public.coin_wallets WHERE user_id = v_second_lock FOR UPDATE;

    -- 6. Check Sender Balance
    SELECT balance INTO v_sender_balance FROM public.coin_wallets WHERE user_id = v_sender_id;
    IF v_sender_balance < p_amount THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient coins balance', 'currentBalance', v_sender_balance);
    END IF;

    -- 7. Atomic Balance Adjustments
    UPDATE public.coin_wallets
    SET balance = balance - p_amount,
        total_spent = total_spent + p_amount,
        updated_at = NOW()
    WHERE user_id = v_sender_id
    RETURNING balance INTO v_sender_balance;

    UPDATE public.coin_wallets
    SET balance = balance + p_amount,
        total_earned = total_earned + p_amount,
        updated_at = NOW()
    WHERE user_id = p_recipient_id;

    -- 8. Write Audit Ledger
    INSERT INTO public.coin_transactions (user_id, amount, type, description, reference_id, created_at)
    VALUES (v_sender_id, -p_amount, 'TIP_SENT', p_description, p_reference_id, NOW());

    INSERT INTO public.coin_transactions (user_id, amount, type, description, reference_id, created_at)
    VALUES (p_recipient_id, p_amount, 'TIP_RECEIVED', p_description, p_reference_id, NOW());

    RETURN jsonb_build_object('success', true, 'remainingBalance', v_sender_balance);
END;
$$;

-- (B) credit_verified_payment: Service-Role / Webhook Only (Idempotent Top-Ups)
CREATE OR REPLACE FUNCTION public.credit_verified_payment(
    p_user_id UUID,
    p_order_id TEXT,
    p_payment_id TEXT,
    p_package_id TEXT,
    p_amount_inr NUMERIC,
    p_coins INT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_new_balance INT;
BEGIN
    -- Idempotency check: Reject duplicate payment ID
    IF EXISTS (SELECT 1 FROM public.payment_transactions WHERE payment_id = p_payment_id) THEN
        SELECT balance INTO v_new_balance FROM public.coin_wallets WHERE user_id = p_user_id;
        RETURN jsonb_build_object('success', true, 'duplicate', true, 'balance', COALESCE(v_new_balance, 0));
    END IF;

    -- Record in payment_transactions table
    INSERT INTO public.payment_transactions (user_id, order_id, payment_id, package_id, amount_inr, coins_credited, status, created_at)
    VALUES (p_user_id, p_order_id, p_payment_id, p_package_id, p_amount_inr, p_coins, 'COMPLETED', NOW());

    -- Credit coin wallet
    INSERT INTO public.coin_wallets (user_id, balance, total_earned, total_spent, updated_at)
    VALUES (p_user_id, p_coins, p_coins, 0, NOW())
    ON CONFLICT (user_id) DO UPDATE
    SET balance = public.coin_wallets.balance + p_coins,
        total_earned = public.coin_wallets.total_earned + p_coins,
        updated_at = NOW()
    RETURNING balance INTO v_new_balance;

    -- Write to audit ledger
    INSERT INTO public.coin_transactions (user_id, amount, type, description, reference_id, created_at)
    VALUES (p_user_id, p_coins, 'COIN_PURCHASE', 'Purchased ' || p_coins || ' coins via Razorpay (' || p_payment_id || ')', p_payment_id, NOW());

    RETURN jsonb_build_object('success', true, 'balance', v_new_balance);
END;
$$;

-- (C) admin_process_payout: Admin Authorization Only
CREATE OR REPLACE FUNCTION public.admin_process_payout(
    p_payout_id UUID,
    p_new_status TEXT,
    p_reference_id TEXT DEFAULT NULL,
    p_note TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_caller_role TEXT;
    v_current_status TEXT;
BEGIN
    SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();
    IF v_caller_role IS NULL OR v_caller_role <> 'ADMIN' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Forbidden: Administrator privileges required');
    END IF;

    IF p_new_status NOT IN ('APPROVED', 'COMPLETED', 'REJECTED') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid status. Must be APPROVED, COMPLETED, or REJECTED');
    END IF;

    SELECT status INTO v_current_status FROM public.payout_requests WHERE id = p_payout_id FOR UPDATE;
    IF v_current_status IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Payout request not found');
    END IF;

    IF v_current_status <> 'PENDING' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Idempotency notice: Payout request is already ' || v_current_status);
    END IF;

    UPDATE public.payout_requests
    SET status = p_new_status,
        reference_id = COALESCE(p_reference_id, reference_id),
        note = COALESCE(p_note, note),
        processed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_payout_id;

    RETURN jsonb_build_object('success', true, 'payoutId', p_payout_id, 'status', p_new_status);
END;
$$;

-- 14. PERMISSIONS & ACCESS CONTROL
REVOKE ALL ON FUNCTION public.process_coin_transfer(UUID, INT, TEXT, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.credit_verified_payment(UUID, TEXT, TEXT, TEXT, NUMERIC, INT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_process_payout(UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.process_coin_transfer(UUID, INT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.credit_verified_payment(UUID, TEXT, TEXT, TEXT, NUMERIC, INT) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_process_payout(UUID, TEXT, TEXT, TEXT) TO authenticated;
