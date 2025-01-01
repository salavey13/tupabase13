-- Drop table if it exists to ensure idempotency
DROP TABLE IF EXISTS leaderboard CASCADE;

-- Create leaderboard table
CREATE TABLE leaderboard (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_slug text NOT NULL REFERENCES events(slug) ON DELETE CASCADE,
    user_id text NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    score integer NOT NULL DEFAULT 0 CHECK (score >= 0), -- Ensure score is non-negative
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Ensure unique scores per event for a user
ALTER TABLE leaderboard
ADD CONSTRAINT unique_event_user UNIQUE (event_slug, user_id);

-- Trigger to update `updated_at` automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON leaderboard
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable row-level security for the leaderboard table
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Example row-level security policy for leaderboard
CREATE POLICY "Leaderboard select policy" ON leaderboard
    FOR SELECT
    USING (auth.jwt() ->> 'chat_id' = user_id);

-- Enable Supabase Realtime for the leaderboard table
-- (Realtime requires replication to be enabled on INSERT, UPDATE, DELETE)
ALTER TABLE leaderboard REPLICA IDENTITY FULL;

-- Ensure table is optimized for frequent reads and writes
CREATE INDEX idx_leaderboard_event_slug ON leaderboard(event_slug);
CREATE INDEX idx_leaderboard_user_id ON leaderboard(user_id);
