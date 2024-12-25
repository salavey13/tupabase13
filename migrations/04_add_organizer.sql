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
