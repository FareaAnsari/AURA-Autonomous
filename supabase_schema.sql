-- ═══════════════════════════════════════════════════════════════════
-- AURA — Autonomous Unified Research Agent Database Schema
-- Supabase PostgreSQL Schema
-- Project: https://ektvwnuodldzkrznqgxz.supabase.co
-- ═══════════════════════════════════════════════════════════════════

-- 1. Create table for research missions
CREATE TABLE IF NOT EXISTS public.research_missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    query TEXT NOT NULL,
    category TEXT NOT NULL,
    category_label TEXT,
    budget_display TEXT,
    location TEXT,
    purpose TEXT,
    intent_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    plan_data JSONB NOT NULL DEFAULT '[]'::jsonb,
    candidates JSONB NOT NULL DEFAULT '[]'::jsonb,
    sources JSONB NOT NULL DEFAULT '[]'::jsonb,
    verification JSONB NOT NULL DEFAULT '[]'::jsonb,
    reasoning TEXT,
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'COMPLETED'
);

-- 2. Create table for saved / bookmarked reports
CREATE TABLE IF NOT EXISTS public.saved_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    mission_id UUID REFERENCES public.research_missions(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    notes TEXT
);

-- 3. Create table for real-time agent activity logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    mission_id UUID REFERENCES public.research_missions(id) ON DELETE CASCADE,
    event_time TEXT,
    message TEXT NOT NULL,
    event_type TEXT DEFAULT 'info'
);

-- 4. Enable Row Level Security (RLS) & Grant Access for anon role
ALTER TABLE public.research_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read and write access for public research missions
CREATE POLICY "Allow public read access to research_missions" ON public.research_missions
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to research_missions" ON public.research_missions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to saved_reports" ON public.saved_reports
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to saved_reports" ON public.saved_reports
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to activity_logs" ON public.activity_logs
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to activity_logs" ON public.activity_logs
    FOR INSERT WITH CHECK (true);
