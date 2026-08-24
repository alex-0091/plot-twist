-- ==============================================================================
-- PLOT TWIST 🇵🇰 — Supabase Realtime Database Setup
-- Run this script in your Supabase SQL Editor (100% Free Tier)
-- ==============================================================================

-- 1. Create the game rooms table
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

-- 2. Create index for fast room code lookups
CREATE INDEX IF NOT EXISTS idx_rooms_code ON public.rooms (room_code);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- 4. Allow public anonymous players to read, create, and update active match state
CREATE POLICY "Allow public read rooms" ON public.rooms
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert rooms" ON public.rooms
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update rooms" ON public.rooms
    FOR UPDATE USING (true);

-- 5. Enable Supabase Realtime for instant multiplayer sync across the web
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
