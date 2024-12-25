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
