DROP TABLE IF EXISTS leaderboard CASCADE;
-- Create leaderboard table
CREATE TABLE leaderboard (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_slug text NOT NULL REFERENCES events(slug) ON DELETE CASCADE,
    user_id text NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    score integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Ensure unique scores per event for a user
ALTER TABLE leaderboard
ADD CONSTRAINT unique_event_user_score UNIQUE (event_slug, user_id);

-- Example row-level security policy for leaderboard
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leaderboard policy" ON leaderboard
    FOR SELECT
    USING (auth.jwt() ->> 'chat_id' = user_id);
