-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- TABLE: threat_memory
-- Stores historical threat intelligence and agent detections
-- ==========================================
CREATE TABLE IF NOT EXISTS public.threat_memory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    agent_name VARCHAR(50) NOT NULL,
    threat_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    context TEXT NOT NULL,
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS for threat_memory
ALTER TABLE public.threat_memory ENABLE ROW LEVEL SECURITY;

-- RLS Policies for threat_memory
-- Allow read access to authenticated service role or anon (for hackathon demo)
CREATE POLICY "Allow public read access on threat_memory" 
    ON public.threat_memory 
    FOR SELECT 
    USING (true);

CREATE POLICY "Allow service insert on threat_memory" 
    ON public.threat_memory 
    FOR INSERT 
    WITH CHECK (true);


-- ==========================================
-- TABLE: deployment_history
-- Stores past deployments, verdicts, and failure reasons
-- ==========================================
CREATE TABLE IF NOT EXISTS public.deployment_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    environment VARCHAR(50) NOT NULL,
    verdict VARCHAR(20) NOT NULL CHECK (verdict IN ('PASS', 'WARN', 'BLOCK')),
    risk_score INTEGER NOT NULL,
    issues JSONB DEFAULT '[]'::jsonb,
    deployment_date TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for deployment_history
ALTER TABLE public.deployment_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deployment_history
CREATE POLICY "Allow public read access on deployment_history" 
    ON public.deployment_history 
    FOR SELECT 
    USING (true);

CREATE POLICY "Allow service insert on deployment_history" 
    ON public.deployment_history 
    FOR INSERT 
    WITH CHECK (true);


-- ==========================================
-- TABLE: agent_logs
-- Stores the live stream of agent debate and communication
-- ==========================================
CREATE TABLE IF NOT EXISTS public.agent_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    agent_name VARCHAR(50) NOT NULL,
    level VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for agent_logs
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agent_logs
-- Supabase Realtime requires SELECT policies to broadcast inserts to clients
CREATE POLICY "Allow public read access on agent_logs" 
    ON public.agent_logs 
    FOR SELECT 
    USING (true);

CREATE POLICY "Allow service insert on agent_logs" 
    ON public.agent_logs 
    FOR INSERT 
    WITH CHECK (true);

-- Enable Supabase Realtime for agent_logs (Execute this manually in the Supabase Dashboard -> Database -> Publications, or run this via SQL)
DO $$
BEGIN
  -- Check if publication exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    CREATE PUBLICATION supabase_realtime FOR TABLE agent_logs;
  ELSE
    ALTER PUBLICATION supabase_realtime ADD TABLE agent_logs;
  END IF;
END;
$$;
