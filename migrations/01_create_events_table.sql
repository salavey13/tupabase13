-- Drop existing tables and their dependencies
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizers CASCADE;
DROP TABLE IF EXISTS ticket_tiers CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS event_ticket_user CASCADE;
DROP TABLE IF EXISTS access_control CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS history CASCADE;
DROP TABLE IF EXISTS sales_tracking CASCADE;
DROP TABLE IF EXISTS notion_sync CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS leaderboard CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
-- Drop existing table and functions if they exist
DROP TABLE IF EXISTS public.memberships CASCADE;
DROP FUNCTION IF EXISTS update_membership_level CASCADE;
DROP FUNCTION IF EXISTS check_and_update_membership_level CASCADE;



-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS http;

-- Create users table
CREATE TABLE users (
    user_id text PRIMARY KEY NOT NULL,
    username text,
    full_name text,
    avatar_url text,
    website text,
    status text DEFAULT 'free',
    role text DEFAULT 'attendee',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    active_organizer_id text,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    description text,
    badges jsonb,
    CONSTRAINT users_username_key UNIQUE (username),
    CONSTRAINT check_status CHECK (status = ANY (ARRAY['free'::text, 'pro'::text, 'admin'::text]))
);

-- Create organizers table
CREATE TABLE organizers (
    id text PRIMARY KEY,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT current_timestamp,
    description text,
    slug text,
    website text,
    is_default boolean DEFAULT false,
    notion_integration_key text,
    notion_database_id text UNIQUE
);

-- Add foreign key constraint for active_organizer_id after organizers table exists
ALTER TABLE users 
ADD CONSTRAINT fk_active_organizer 
FOREIGN KEY (active_organizer_id) 
REFERENCES organizers(id);

-- Create events table
CREATE TABLE events (
    slug text PRIMARY KEY NOT NULL,
    user_id text REFERENCES users(user_id),
    title text NOT NULL,
    description text NOT NULL,
    long_description text NOT NULL,
    date date NOT NULL,
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    image_url text NOT NULL,
    venue jsonb NOT NULL,
    lineup jsonb NOT NULL,
    ticket_tiers jsonb NOT NULL,
    status text NOT NULL DEFAULT 'upcoming',
    capacity integer NOT NULL,
    tickets_remaining integer NOT NULL,
    organizer jsonb NOT NULL,
    tags text[] NOT NULL DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    organizer_id text REFERENCES organizers(id)
);

-- Create ticket tiers table
CREATE TABLE ticket_tiers (
    tier_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_slug text REFERENCES events(slug),
    tier text NOT NULL,
    price numeric NOT NULL,
    availability integer NOT NULL DEFAULT 0,
    perks text DEFAULT 'General Admission'
);

-- Create tickets table
CREATE TABLE tickets (
    ticket_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_slug text REFERENCES events(slug),
    tier text NOT NULL,
    price numeric NOT NULL,
    perks text,
    is_sold boolean DEFAULT false,
    tier_id uuid REFERENCES ticket_tiers(tier_id)
    invoice_id UUID REFERENCES invoices(id);

);

-- Create event_ticket_user table
CREATE TABLE event_ticket_user (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id uuid REFERENCES tickets(ticket_id),
    user_id text REFERENCES users(user_id),
    assigned_at timestamp with time zone DEFAULT now(),
    CONSTRAINT unique_ticket_assignment UNIQUE (ticket_id, user_id)
);

-- Create access control table
CREATE TABLE access_control (
    access_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_slug text REFERENCES events(slug),
    ticket_tier text,
    content_access_level text,
    CONSTRAINT fk_event FOREIGN KEY (event_slug) REFERENCES events(slug)
);

-- Create favorites table
CREATE TABLE favorites (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id text REFERENCES users(user_id),
    type text NOT NULL CHECK (type = ANY (ARRAY['project', 'note'])),
    title text NOT NULL,
    description text,
    timestamp timestamp with time zone DEFAULT now(),
    project_id uuid
);

-- Create history table
CREATE TABLE history (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id text REFERENCES users(user_id),
    type text NOT NULL CHECK (type = ANY (ARRAY['search', 'project'])),
    content text NOT NULL,
    timestamp timestamp with time zone DEFAULT now()
);

-- Create sales tracking table
CREATE TABLE sales_tracking (
    sale_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id uuid REFERENCES tickets(ticket_id),
    user_id text REFERENCES users(user_id),
    event_slug text REFERENCES events(slug),
    sale_amount numeric NOT NULL,
    sale_timestamp timestamp with time zone DEFAULT now()
);

-- Create memberships table
CREATE TABLE public.memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES public.users(user_id),
  creator_id TEXT REFERENCES public.users(user_id),
  tier TEXT CHECK (tier IN ('bronze', 'silver', 'gold')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP WITH TIME ZONE,
  successful_invoices INTEGER DEFAULT 0,
  UNIQUE (user_id, creator_id)
);

-- Create index for faster queries
CREATE INDEX idx_memberships_user_id ON public.memberships(user_id);
CREATE INDEX idx_memberships_creator_id ON public.memberships(creator_id);

-- RLS policies
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own memberships
CREATE POLICY view_own_memberships ON public.memberships
  FOR SELECT
  USING (auth.jwt() ->> 'chat_id' = user_id);

-- Policy for creators to view memberships for their content
CREATE POLICY view_creator_memberships ON public.memberships
  FOR SELECT
  USING (auth.jwt() ->> 'chat_id' = creator_id);

-- Policy for users to insert their own memberships
CREATE POLICY insert_own_membership ON public.memberships
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'chat_id' = user_id);

-- Policy for updating own membership
CREATE POLICY update_own_membership ON public.memberships
  FOR UPDATE
  USING (auth.jwt() ->> 'chat_id' = user_id);

-- Function to update membership level based on successful invoices
CREATE OR REPLACE FUNCTION update_membership_level()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment successful_invoices count
  UPDATE public.memberships
  SET successful_invoices = successful_invoices + 1
  WHERE user_id = NEW.user_id AND creator_id = NEW.recipient_id;

  -- Check and update tier based on successful_invoices count
  UPDATE public.memberships
  SET tier = CASE
    WHEN successful_invoices >= 13 THEN 'gold'
    WHEN successful_invoices >= 1 THEN 'silver'
    ELSE 'bronze'
  END
  WHERE user_id = NEW.user_id AND creator_id = NEW.recipient_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update membership level when an invoice is paid
CREATE TRIGGER update_membership_on_invoice_paid
AFTER UPDATE OF status ON public.invoices
FOR EACH ROW
WHEN (NEW.status = 'paid' AND OLD.status != 'paid')
EXECUTE FUNCTION update_membership_level();

-- Function to check and create/update membership when an invoice is created
CREATE OR REPLACE FUNCTION check_and_update_membership_level()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if a membership exists, if not, create one
  INSERT INTO public.memberships (user_id, creator_id, tier)
  VALUES (NEW.user_id, NEW.recipient_id, 'bronze')
  ON CONFLICT (user_id, creator_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check and create/update membership when an invoice is created
CREATE TRIGGER check_membership_on_invoice_created
AFTER INSERT ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION check_and_update_membership_level();

-- Create notion sync table
/*CREATE TABLE notion_sync (
    sync_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    notion_database_id text REFERENCES organizers(notion_database_id),
    event_slug text REFERENCES events(slug),
    last_sync_time timestamp with time zone,
    status text
);*/
-- Add more sample data as needed
/*
  # Add Notifications System

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (text, foreign key to users)
      - `message` (text)
      - `type` (text: info, success, warning, error)
      - `created_at` (timestamp)
      - `read` (boolean)

  2. Security
    - Enable RLS on notifications table
    - Add policy for users to read their own notifications
*/
-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(user_id),
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  created_at TIMESTAMPTZ DEFAULT now(),
  read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create leaderboard table
CREATE TABLE leaderboard (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_slug text NOT NULL REFERENCES events(slug) ON DELETE CASCADE,
    user_id text NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    score integer NOT NULL DEFAULT 0 CHECK (score >= 0), -- Ensure score is non-negative
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE public.invoices (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id text NOT NULL,  -- Reference to the user in public.users
    title text NOT NULL,
    description text NOT NULL,
    amount integer NOT NULL,
    ticket_uuid uuid NULL,  -- This can be removed if you don't want to reference tickets
    status text NOT NULL,
    recipient_id text NULL,  -- Reference to the recipient in public.users
    access_type text NULL,
    access_data jsonb NULL,
    promo_text jsonb NULL,
    CONSTRAINT invoices_pkey PRIMARY KEY (id),
    CONSTRAINT invoices_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.users (user_id),  -- Corrected to reference public.users
    CONSTRAINT invoices_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (user_id)  -- Corrected to reference public.users
) TABLESPACE pg_default;

-- Create an index on recipient_id for performance
CREATE INDEX IF NOT EXISTS idx_invoices_recipient_id ON public.invoices USING btree (recipient_id) TABLESPACE pg_default;

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



-- Enable Supabase Realtime for the leaderboard table
-- (Realtime requires replication to be enabled on INSERT, UPDATE, DELETE)
ALTER TABLE leaderboard REPLICA IDENTITY FULL;

-- Ensure table is optimized for frequent reads and writes
CREATE INDEX idx_leaderboard_event_slug ON leaderboard(event_slug);
CREATE INDEX idx_leaderboard_user_id ON leaderboard(user_id);





-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_ticket_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE notion_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Policy for inserting invoices
CREATE POLICY "Users can insert invoices" ON public.invoices
FOR INSERT
WITH CHECK (auth.jwt() ->> 'chat_id' = user_id);

-- Policy for selecting invoices
CREATE POLICY "Users can select their own invoices" ON public.invoices
FOR SELECT
USING (auth.jwt() ->> 'chat_id' = user_id);

-- Policy for updating invoices
CREATE POLICY "Users can update their own invoices" ON public.invoices
FOR UPDATE
USING (auth.jwt() ->> 'chat_id' = user_id)
WITH CHECK (auth.jwt() ->> 'chat_id' = user_id);

-- Policy for deleting invoices
CREATE POLICY "Users can delete their own invoices" ON public.invoices
FOR DELETE
USING (auth.jwt() ->> 'chat_id' = user_id);


-- Example row-level security policy for leaderboard
CREATE POLICY "Leaderboard select policy" ON leaderboard
    FOR SELECT
    USING (auth.jwt() ->> 'chat_id' = user_id);
-- Create RLS policies
CREATE POLICY user_policy ON users
    FOR SELECT
    USING (auth.jwt() ->> 'chat_id' = user_id);

CREATE POLICY favorites_policy ON favorites
    FOR ALL
    USING (auth.jwt() ->> 'chat_id' = user_id);

CREATE POLICY history_policy ON history
    FOR ALL
    USING (auth.jwt() ->> 'chat_id' = user_id);

CREATE POLICY "Allow public read access" ON events
    FOR SELECT USING (true);

CREATE POLICY event_policy ON events
    FOR ALL
    USING (auth.jwt() ->> 'chat_id' = user_id);
    
    -- Create RLS policies for organizers
CREATE POLICY "Allow public read access to organizers" ON organizers
    FOR SELECT USING (true);

CREATE POLICY "Allow organizer management by admin" ON organizers
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE user_id = auth.jwt() ->> 'chat_id'
            AND status = 'admin'
        )
    );

-- Add the remaining RLS policies
CREATE POLICY ticket_tiers_policy ON ticket_tiers
    FOR SELECT
    USING (
        auth.jwt() ->> 'chat_id' = (
            SELECT user_id FROM events WHERE slug = ticket_tiers.event_slug
        )
    );

CREATE POLICY tickets_policy ON tickets
    FOR SELECT
    USING (
        auth.jwt() ->> 'chat_id' = (
            SELECT user_id FROM event_ticket_user WHERE ticket_id = tickets.ticket_id
        )
    );

CREATE POLICY event_ticket_user_policy ON event_ticket_user
    FOR SELECT
    USING (auth.jwt() ->> 'chat_id' = user_id);

CREATE POLICY sales_tracking_policy ON sales_tracking
    FOR SELECT
    USING (auth.jwt() ->> 'chat_id' = user_id);

CREATE POLICY notion_sync_policy ON notion_sync
    FOR SELECT
    USING (
        auth.jwt() ->> 'chat_id' = (
            SELECT user_id FROM events WHERE slug = notion_sync.event_slug
        )
    );

CREATE POLICY access_control_policy ON access_control
    FOR SELECT
    USING (
        auth.jwt() ->> 'chat_id' = (
            SELECT user_id FROM events WHERE slug = access_control.event_slug
        )
    );
    

-- Create RLS policies
CREATE POLICY "Users can read their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'chat_id' = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'chat_id' = user_id);
  

-- First, ensure the pgcrypto extension is installed
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Generate JWT Token Function
CREATE OR REPLACE FUNCTION generate_jwt_token(user_id TEXT)
RETURNS TEXT AS $$
DECLARE
    jwt_secret TEXT;
    claims JSON;
    header JSON;
    header_base64 TEXT;
    claims_base64 TEXT;
    signature TEXT;
BEGIN
    -- Get the JWT secret from the database settings
    SELECT coalesce(current_setting('app.settings.jwt_secret', true), '<hardcoded_jwt_secret_maintained_manually>')
    INTO jwt_secret;

    -- Ensure we have a JWT secret
    IF jwt_secret IS NULL THEN
        RAISE EXCEPTION 'JWT secret is not set in the database settings';
    END IF;

    -- Create the JWT header (Base64-encoded)
    header := json_build_object('alg', 'HS256', 'typ', 'JWT');
    header_base64 := encode(header::text::bytea, 'base64');

    -- Create the JWT claims (Base64-encoded)
    claims := json_build_object(
        'sub', user_id,
        'iat', extract(epoch from now())::integer,
        'exp', extract(epoch from (now() + interval '1 hour'))::integer
    );
    claims_base64 := encode(claims::text::bytea, 'base64');

    -- Generate the signature
    signature := encode(
        pgcrypto.hmac(header_base64 || '.' || claims_base64, jwt_secret, 'sha256'),
        'base64'
    );

    -- Return the final JWT
    RETURN header_base64 || '.' || claims_base64 || '.' || signature;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION http_post(url text, payload json, jwt text)
RETURNS void AS $$
DECLARE
    response json;
BEGIN
    SELECT content INTO response
    FROM http((
        'POST',
        url,
        ARRAY[http_header('Content-Type', 'application/json'), http_header('Authorization', 'Bearer ' || jwt)],
        'application/json',
        payload::text
    )::http_request);
    -- You can handle the response if needed
END;
$$ LANGUAGE plpgsql;



-- Notify User Function
CREATE OR REPLACE FUNCTION notify_user(
    user_id TEXT,
    message TEXT
)
RETURNS void AS $$
DECLARE
    admin_chat_id TEXT;
    jwt TEXT;
BEGIN
    -- Get the admin chat_id from the settings or use a default
    SELECT coalesce(current_setting('app.settings.admin_chat_id', true), '413553377') INTO admin_chat_id;

    -- Generate a JWT token
    SELECT generate_jwt_token(user_id) INTO jwt;

    -- Send the notification via HTTP
    PERFORM http_post(
        'https://tupabase.vercel.app/api/sendTelegramNotification',
        json_build_object(
            'chat_id', CASE WHEN user_id = 'admin' THEN admin_chat_id ELSE user_id END,
            'message', message
        ),
        jwt
    );
END;
$$ LANGUAGE plpgsql;

-- Create helper functions
CREATE OR REPLACE FUNCTION public.generate_tickets_for_event(event_slug text) 
RETURNS void 
LANGUAGE plpgsql AS $$
DECLARE 
    tier_record jsonb; 
    tier_name text; 
    tier_price numeric; 
    tier_perks text; 
    tier_quantity integer; 
    i integer; 
BEGIN 
    FOR tier_record IN 
        SELECT jsonb_array_elements(ticket_tiers) 
        FROM events 
        WHERE slug = event_slug 
    LOOP 
        tier_name := tier_record ->> 'tier'; 
        tier_price := (tier_record ->> 'price')::numeric; 
        tier_perks := tier_record ->> 'perks'; 
        tier_quantity := (tier_record ->> 'quantity')::integer; 
        
        -- Ensure tier_quantity is a positive integer 
        IF tier_quantity IS NOT NULL AND tier_quantity > 0 THEN 
            FOR i IN 1..tier_quantity LOOP 
                INSERT INTO tickets (event_slug, tier, price, perks) 
                VALUES (event_slug, tier_name, tier_price, tier_perks); 
            END LOOP; 
        ELSE 
            RAISE NOTICE 'Tier quantity for tier % is not valid: %', tier_name, tier_quantity; 
        END IF; 
    END LOOP; 
END; 
$$;

/*CREATE TRIGGER new_event_trigger
    AFTER INSERT ON events
    FOR EACH ROW
    EXECUTE FUNCTION notify_user();*/

-- Create ticket assignment function
CREATE OR REPLACE FUNCTION assign_ticket_to_user(ticket_id uuid, user_id text) RETURNS void AS $$
BEGIN
    -- Check if the ticket is already assigned
    IF EXISTS (SELECT 1 FROM event_ticket_user WHERE ticket_id = ticket_id) THEN
        RAISE EXCEPTION 'Ticket % is already assigned', ticket_id;
    END IF;

    -- Assign the ticket to the user
    INSERT INTO event_ticket_user (ticket_id, user_id)
    VALUES (ticket_id, user_id);

    -- Mark the ticket as sold
    UPDATE tickets SET is_sold = true WHERE ticket_id = ticket_id;

    -- Update tickets_remaining count in events table
    UPDATE events
    SET tickets_remaining = tickets_remaining - 1
    WHERE slug = (SELECT event_slug FROM tickets WHERE ticket_id = ticket_id);
END;
$$ LANGUAGE plpgsql;
-- Create trigger for auto-generating tickets
CREATE OR REPLACE FUNCTION auto_assign_tickets() RETURNS TRIGGER AS $$
BEGIN
    PERFORM generate_tickets_for_event(NEW.slug);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_assign_tickets_trigger
AFTER INSERT ON events
FOR EACH ROW
EXECUTE FUNCTION auto_assign_tickets();

-- Create view for unsold tickets
CREATE VIEW unsold_tickets_for_export AS
SELECT t.ticket_id, t.event_slug, t.tier, t.price, t.perks
FROM tickets t
WHERE t.is_sold = false;


-- Create ticket purchase validation function
CREATE OR REPLACE FUNCTION validate_ticket_purchase(user_id text, ticket_id uuid) RETURNS boolean AS $$
DECLARE
    event_slug text;
BEGIN
    -- Get the event_slug associated with the ticket_id
    SELECT event_slug INTO event_slug FROM tickets WHERE ticket_id = ticket_id;

    -- Check if the user already has a ticket for the same event
    IF EXISTS (
        SELECT 1
        FROM event_ticket_user etu
        JOIN tickets t ON etu.ticket_id = t.ticket_id
        WHERE etu.user_id = user_id AND t.event_slug = event_slug
    ) THEN
        RETURN FALSE; -- User already has a ticket for this event
    END IF;

    RETURN TRUE; -- User can purchase the ticket
END;
$$ LANGUAGE plpgsql;

-- Create function to update tickets remaining
CREATE OR REPLACE FUNCTION update_tickets_remaining() RETURNS trigger AS $$
BEGIN
    UPDATE events
    SET tickets_remaining = (
        SELECT COUNT(*)
        FROM tickets t
        WHERE t.event_slug = NEW.event_slug
        AND t.is_sold = false
    )
    WHERE slug = NEW.event_slug;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating tickets remaining
CREATE TRIGGER update_tickets_remaining_trigger
    AFTER UPDATE OF is_sold ON tickets
    FOR EACH ROW
    WHEN (OLD.is_sold IS DISTINCT FROM NEW.is_sold)
    EXECUTE FUNCTION update_tickets_remaining();                                 
    
-- Insert sample data
INSERT INTO users (user_id, username, full_name, avatar_url, website, status, role)
VALUES
('413553377', 'SALAVEY13', 'Dmitry', 'http://example.com/avatar.jpg', 'https://oneSitePls.framer.ai', 'free', 'attendee');

INSERT INTO organizers (id, name, description, slug, website, notion_integration_key, notion_database_id)
VALUES
('org1', 'Event Organizers Inc.', 'Leading event organizers', 'event-organizers', 'http://organizers.com', 'key123', 'db123');

INSERT INTO events (
    slug, user_id, title, description, long_description, date, start_time, end_time, image_url, 
    venue, lineup, ticket_tiers, status, capacity, tickets_remaining, organizer, tags
) VALUES 
(
    'psytrance-territory', NULL, 'Psytrance Territory', 
    'A journey into the depths of psychedelic trance music', 
    'Experience a night of mind-bending beats and ethereal soundscapes as we bring together the finest psytrance artists for an unforgettable journey. Let the rhythmic pulses and hypnotic melodies guide you through a transformative experience.', 
    '2024-12-20', '2024-12-20T23:00:00Z', '2024-12-21T06:00:00Z', 
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7', 
    '{"name": "Alcatraz Bar", "address": "176 Pochinkovaya Street", "city": "Moscow", "coordinates": {"lat": 55.751244, "lng": 37.618423}}'::jsonb, 
    '[{"id": "1", "name": "AudioHallu", "imageUrl": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7", "bio": "Master of progressive psytrance", "socialLinks": {"soundcloud": "audiuhallu", "instagram": "audiohallu"}}, {"id": "2", "name": "Tata", "imageUrl": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7", "bio": "Dark forest vibes specialist", "socialLinks": {"soundcloud": "tata", "instagram": "tata_psy"}}]'::jsonb, 
    '[{"tier": "General Admission", "price": 20.00, "quantity": 200, "perks": "Standard entry to the event"}, {"tier": "VIP", "price": 50.00, "quantity": 50, "perks": "VIP access with special seating"}]'::jsonb, 
    'upcoming', 300, 250, 
    '{"id": "1", "name": "Psytrance Events", "logo": "https://example.com/logo.png", "description": "Premier psytrance event organizer", "contactEmail": "contact@psytranceevents.com", "socialLinks": {"website": "https://psytranceevents.com", "facebook": "psytranceevents", "instagram": "psytranceevents"}}'::jsonb, 
    ARRAY['psytrance', 'electronic', 'dance', 'festival']
),
(
    'techno-night', NULL, 'Techno Night', 
    'The ultimate techno experience', 
    'Get ready for a pulsating night filled with the finest techno beats and an electrifying atmosphere. Witness an unforgettable lineup of DJs and cutting-edge visuals.', 
    '2024-12-21', '2024-12-21T22:00:00Z', '2024-12-22T04:00:00Z', 
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4', 
    '{"name": "Urban Warehouse", "address": "45 Electro Street", "city": "Berlin", "coordinates": {"lat": 52.520008, "lng": 13.404954}}'::jsonb, 
    '[{"id": "3", "name": "DJ Pulsar", "imageUrl": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4", "bio": "Bringing high-energy techno to the floor", "socialLinks": {"soundcloud": "djpulsar", "instagram": "djpulsar_official"}}, {"id": "4", "name": "DeepMechanic", "imageUrl": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4", "bio": "Dark and hypnotic sounds"}]'::jsonb, 
    '[{"tier": "General Admission", "price": 25.00, "quantity": 400, "perks": "Standard entry to the event"}, {"tier": "Backstage Pass", "price": 100.00, "quantity": 20, "perks": "Exclusive backstage access"}]'::jsonb, 
    'upcoming', 500, 450, 
    '{"id": "2", "name": "Berlin Beats", "logo": "https://example.com/berlinbeats-logo.png", "description": "Innovators of electronic music events", "contactEmail": "info@berlinbeats.com", "socialLinks": {"website": "https://berlinbeats.com"}}'::jsonb, 
    ARRAY['techno', 'electronic', 'party']
);






-- Function to generate tickets for an event
CREATE OR REPLACE FUNCTION generate_tickets_for_eventby_ticket_tiers_table(event_slug TEXT)
RETURNS TABLE (ticket_id UUID, tier_name TEXT, unique_code TEXT)
LANGUAGE plpgsql
AS $$
DECLARE
  tier RECORD;
BEGIN
  FOR tier IN SELECT * FROM ticket_tiers WHERE event_slug = $1
  LOOP
    FOR i IN 1..tier.availability
    LOOP
      INSERT INTO tickets (event_slug, tier_name, unique_code)
      VALUES (event_slug, tier.tier, encode(gen_random_bytes(16), 'hex'))
      RETURNING id, tier_name, unique_code;
    END LOOP;
  END LOOP;
  RETURN QUERY SELECT id, tier_name, unique_code FROM tickets WHERE event_slug = $1;
END;
$$;

-- Function to get ticket stats
CREATE OR REPLACE FUNCTION get_ticket_stats(event_slug TEXT)
RETURNS TABLE (tier_name TEXT, total INT, sold INT, available INT)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.tier_name,
    COUNT(t.id) AS total,
    COUNT(t.sold_at) AS sold,
    COUNT(t.id) - COUNT(t.sold_at) AS available
  FROM tickets t
  WHERE t.event_slug = $1
  GROUP BY t.tier_name;
END;
$$;

-- Add digiseller_product_id to events table
ALTER TABLE events
ADD COLUMN digiseller_product_id TEXT;

-- Add digiseller_product_id to ticket_tiers table (assuming it's a separate table)
ALTER TABLE ticket_tiers
ADD COLUMN digiseller_product_id TEXT;

-- Update the generate_tickets_for_event function
CREATE OR REPLACE FUNCTION generate_tickets_for_event(
  p_event_slug TEXT,
  p_tier_name TEXT,
  p_quantity INTEGER
)
RETURNS TABLE (id UUID, tier_name TEXT, unique_code TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH inserted_tickets AS (
    INSERT INTO tickets (event_slug, tier_name, unique_code)
    SELECT p_event_slug, p_tier_name, encode(gen_random_bytes(16), 'hex')
    FROM generate_series(1, p_quantity)
    RETURNING id, tier_name, unique_code
  )
  SELECT * FROM inserted_tickets;
END;
$$;



-- Update the organizer information
UPDATE organizers
SET name = 'salavey13',
    description = 'Premier red pill event organizer',
    slug = 'salavey13',
    website = 't.me/oneSitePlsBot/salavey13'
WHERE id = 'org1';

-- Insert the Red Pill Racing event
INSERT INTO events (
  slug, title, description, long_description, date, image_url, 
  venue, lineup, ticket_tiers, status, capacity, tickets_remaining, 
  organizer, tags
)
VALUES (
  'red-pill-racing',
  'Red Pill Racing',
  '💊 Красная таблетка ждёт тебя! Ты не батарейка для ИИ, ты его кибер-водитель! Мир — это трасса, а мы уже жмём на газ.',
  '💊 Красная таблетка ждёт тебя!\nТы не батарейка для ИИ, ты его кибер-водитель!\nВесь мир — это твоя трасса, а мы уже жмём на газ.\nРевущие алгоритмы, гонка за криптой и бесконечными возможностями.\nМашины — не враги, они — твои союзники.\nПора стать кибердемоном и войти в матрицу как свободный человек.\n\nРазработка уже идёт, и ты можешь подключиться прямо сейчас.\nКод? Найдёшь его на GitHub. Видос с объяснением? Будет, но ты ведь не будешь ждать, да? Хватай скрипты, строй свои трассы и бери управление в свои руки.',
  '2024-12-25',
  'https://example.com/images/red-pill-racing.jpg',
  '{"city": "Матрица", "name": "Everywhere in the Matrix", "address": "127.0.0.1", "coordinates": {"lat": 55.751244, "lng": 37.618423}}',
  '[{"name": "Neo", "role": "Main Coder"}, {"name": "Trinity", "role": "Debugger"}]',
  '[{"tier": "Founder''s Edition", "price": 13, "perks": "Первое издание для основателей, доставка прямо в реальность!", "quantity": 69}]',
  'upcoming',
  1000,
  1000,
  '{"id": "org1", "logo": "https://example.com/logo.png", "name": "salavey13", "description": "Premier red pill event organizer", "socialLinks": {"website": "t.me/oneSitePlsBot/salavey13"}, "contactEmail": "salavey13@gmail.com"}',
  ARRAY['red-pill', 'matrix', 'crypto', 'race']
);

-- Generate tickets for the Red Pill Racing event
SELECT generate_tickets_for_event('red-pill-racing');






INSERT INTO public.events (
    slug,
    user_id,
    title,
    description,
    long_description,
    date,
    start_time,
    end_time,
    image_url,
    venue,
    lineup,
    ticket_tiers,
    status,
    capacity,
    tickets_remaining,
    organizer,
    tags
) VALUES (
    'dota2_gathering',
    'The_4uka',  -- Assuming The_4uka is the user_id
    'Dota 2 Gathering Party',
    'Join us for an exciting Dota 2 gathering!',
    'Gather your team and prepare for an epic Dota 2 session with friends!',
    '2025-01-01',
    '2025-01-01 18:00:00+00',  -- Start time
    '2025-01-01 23:00:00+00',  -- End time
    'https://tyqnthnifewjrrjlvmor.supabase.co/storage/v1/object/sign/project-images/public/IMG_20230127_200450_574.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9qZWN0LWltYWdlcy9wdWJsaWMvSU1HXzIwMjMwMTI3XzIwMDQ1MF81NzQuanBnIiwiaWF0IjoxNzM1MTAzMTMyLCJleHAiOjE3NjY2MzkxMzJ9.IZ4_rwIM9-56_m2lOOKvYDCkRQ0oQNugFcTj6toacZM&t=2024-12-25T05%3A05%3A31.773Z',  -- Replace with actual image URL
    '{"venue_name": "Gaming Lounge", "address": "456 Gamer St, City, Country"}',
    '["The_4uka", "Player1", "Player2", "Player3", "Player4"]',
    '[
        {"tier": "Support", "price": 0, "perks": "Support role", "quantity": 1},
        {"tier": "Carry", "price": 10, "perks": "Carry role", "quantity": 1},
        {"tier": "Mid", "price": 10, "perks": "Mid role", "quantity": 1},
        {"tier": "Offlane", "price": 10, "perks": "Offlane role", "quantity": 1},
        {"tier": "Roamer", "price": 10, "perks": "Roaming role", "quantity": 1}
    ]',
    'upcoming',
    5,  -- Total capacity
    5,  -- Initial tickets remaining
    '{"organizer_name": "The_4uka", "contact": "contact@the4uka.com"}',
    '{"Dota 2", "Gaming", "Gathering"}'
);

INSERT INTO public.organizers (
    id,
    name,
    description,
    slug,
    website,
    is_default,
    CREATE TABLE organizers (
    id text PRIMARY KEY,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT current_timestamp,
    description text,
    slug text,
    website text,
    is_default boolean DEFAULT false,
    notion_integration_key text,
    notion_database_id text UNIQUE
);,
    notion_database_id
) VALUES (
    'The_4uka',  -- Unique organizer ID
    'The 4uka',
    'Organizer of Dota 2 events and gatherings.',
    'the-4uka',  -- Slug for URL-friendly identifier
    'https://the4uka.com',  -- Replace with actual website
    false,  -- Default to false
    NULL,  -- Assuming no Notion integration key
    NULL   -- Assuming no Notion database ID
);



-- Create function to notify on invoice payment
CREATE OR REPLACE FUNCTION notify_invoice_paid()
RETURNS trigger AS $$
BEGIN
    IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
        -- Insert notification logic here
        -- For now, we'll just store it in a notifications table
        INSERT INTO notifications (user_id, type, data)
        VALUES (
            NEW.user_id,
            'invoice_paid',
            jsonb_build_object(
                'invoice_id', NEW.id,
                'recipient_id', NEW.recipient_id,
                'amount', NEW.amount
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text REFERENCES users(user_id),
    type text NOT NULL,
    data jsonb,
    read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- Create trigger for invoice payment notifications
DROP TRIGGER IF EXISTS invoice_paid_trigger ON invoices;
CREATE TRIGGER invoice_paid_trigger
    AFTER UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION notify_invoice_paid();



CREATE OR REPLACE FUNCTION create_invoice(
  p_user_id TEXT,
  p_event_slug TEXT,
  p_tier TEXT
) RETURNS UUID AS $$
DECLARE
  v_tier_availability INT;
  v_sold_tickets INT;
  v_pending_invoices INT;
  v_invoice_id UUID;
BEGIN
  -- Get the total availability for the tier
  SELECT availability INTO v_tier_availability
  FROM ticket_tiers
  WHERE event_slug = p_event_slug AND tier = p_tier;

  -- Count sold tickets for the tier
  SELECT COUNT(*) INTO v_sold_tickets
  FROM tickets
  WHERE event_slug = p_event_slug AND tier = p_tier AND is_sold = true;

  -- Count pending invoices for the tier
  SELECT COUNT(*) INTO v_pending_invoices
  FROM invoices
  WHERE title LIKE '%Ticket for ' || p_event_slug || '%' AND description LIKE '%Tier: ' || p_tier || '%' AND status = 'pending';

  -- Check if there are tickets available
  IF (v_tier_availability - (v_sold_tickets + v_pending_invoices)) <= 0 THEN
    RAISE EXCEPTION 'No tickets available for the selected tier.';
  END IF;

  -- Create the invoice
  INSERT INTO invoices (user_id, title, description, amount, status)
  VALUES (
    p_user_id,
    'Ticket for ' || p_event_slug,
    'Tier: ' || p_tier,
    (SELECT price FROM ticket_tiers WHERE event_slug = p_event_slug AND tier = p_tier),
    'pending'
  )
  RETURNING id INTO v_invoice_id;

  RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql;


/*CREATE OR REPLACE FUNCTION generate_ticket_on_payment()
RETURNS TRIGGER AS $$
DECLARE
  v_ticket_id UUID;
  v_event_slug TEXT;
  v_tier TEXT;
BEGIN
  -- Trigger only when the invoice status changes to "paid"
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    -- Extract event_slug and tier from the invoice
    SELECT
      SPLIT_PART(NEW.title, 'Ticket for ', 2),
      SPLIT_PART(NEW.description, 'Tier: ', 2)
    INTO
      v_event_slug,
      v_tier;

    -- Create the ticket
    INSERT INTO tickets (event_slug, tier, price, perks, is_sold, invoice_id)
    VALUES (
      v_event_slug,
      v_tier,
      (SELECT price FROM ticket_tiers WHERE event_slug = v_event_slug AND tier = v_tier),
      'Dynamically generated ticket',
      true,
      NEW.id
    )
    RETURNING ticket_id INTO v_ticket_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ticket_on_payment
AFTER UPDATE OF status ON invoices
FOR EACH ROW
EXECUTE FUNCTION generate_ticket_on_payment();*/
