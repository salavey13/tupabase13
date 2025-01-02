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

