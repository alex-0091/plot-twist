-- ==============================================================================
-- PLOT TWIST 🇵🇰 — Supabase Realtime Database Permissions & Table Setup
-- Run this in your Supabase SQL Editor
-- ==============================================================================

-- 1. Create the game rooms table if not exists
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code TEXT UNIQUE NOT NULL,
    room_name TEXT NOT NULL,
    host_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'LOBBY',
    game_state JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rooms_code ON public.rooms (room_code);

-- 2. Grant table permissions to anon public web users
GRANT ALL ON TABLE public.rooms TO anon, authenticated, service_role;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- 4. Policies
DROP POLICY IF EXISTS "Allow public read rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow public insert rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow public update rooms" ON public.rooms;

CREATE POLICY "Allow public read rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Allow public insert rooms" ON public.rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update rooms" ON public.rooms FOR UPDATE USING (true);

-- 5. Enable Supabase Realtime
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'rooms'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
    END IF;
END $$;
