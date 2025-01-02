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

