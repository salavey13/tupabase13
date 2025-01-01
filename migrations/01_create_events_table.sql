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
<<<<<<< HEAD
    digiseller_product_id TEXT;
=======
>>>>>>> f5fd64fe817f171a84320a08851bbd49cdaa3cc0
);

-- Create ticket tiers table
CREATE TABLE ticket_tiers (
    tier_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_slug text REFERENCES events(slug),
    tier text NOT NULL,
    price numeric NOT NULL,
    availability integer NOT NULL DEFAULT 0,
    perks text DEFAULT 'General Admission'
<<<<<<< HEAD
    digiseller_product_id TEXT;
=======
>>>>>>> f5fd64fe817f171a84320a08851bbd49cdaa3cc0
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

-- Create notion sync table
CREATE TABLE notion_sync (
    sync_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    notion_database_id text REFERENCES organizers(notion_database_id),
    event_slug text REFERENCES events(slug),
    last_sync_time timestamp with time zone,
    status text
);

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
    
/*CREATE OR REPLACE FUNCTION http_post(url text, payload json)
RETURNS void AS $$
DECLARE
    response json;
BEGIN
    SELECT content INTO response
    FROM http_post(url, payload::text);
    -- You can handle the response if needed
END;
$$ LANGUAGE plpgsql;

-- Create notification function and trigger
CREATE OR REPLACE FUNCTION notify_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Get the organizer_id from the event
    DECLARE
        organizer_slug text;
    BEGIN
        SELECT slug INTO organizer_slug
        FROM organizers
        WHERE id = NEW.organizer_id;

        PERFORM http_post(
            format('https://%s.vercel.app/api/sendTelegramNotification', organizer_slug),
            json_build_object(
                'chat_id', NEW.user_id,
                'message', 'New event created: ' || NEW.title
            )
        );
    END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;*/

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


/*-- Function to generate tickets for an event using ticket_tiers table (hz)
CREATE OR REPLACE FUNCTION generate_tickets_for_event(event_slug TEXT)
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
*/

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

-- Add more sample data as needed

