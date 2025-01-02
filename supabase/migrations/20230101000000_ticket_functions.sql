-- Function to generate tickets for an event
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

