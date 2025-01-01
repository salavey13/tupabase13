import { load } from 'cheerio';
import { z } from 'zod';

const TicketTierSchema = z.object({
  name: z.string(),
  price: z.number(),
  availability: z.number(),
  perks: z.string(),
});

const EventSchema = z.object({
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  long_description: z.string(),
  date: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  venue: z.object({
    name: z.string(),
    address: z.string(),
    city: z.string(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
  }),
  ticket_tiers: z.array(TicketTierSchema),
  capacity: z.number(),
  tickets_remaining: z.number(),
  organizer: z.object({
    name: z.string(),
    description: z.string(),
    contact_email: z.string(),
    social_links: z.object({
      website: z.string().optional(),
      facebook: z.string().optional(),
      instagram: z.string().optional(),
    }),
  }),
  tags: z.array(z.string()),
});

export async function parseNotionHtml(html: string) {
  const $ = load(html);
  
  // Extract basic event info
  const title = $('h1').first().text().trim();
  const description = $('p').first().text().trim();
  
  // Extract ticket information from the table
  const ticketTiers: any[] = [];
  $('table').each((_, table) => {
    const $table = $(table);
    if ($table.find('th').text().includes('Tier')) {
      $table.find('tbody tr').each((_, row) => {
        const $cells = $(row).find('td');
        ticketTiers.push({
          name: $cells.eq(0).text().trim(),
          price: parseFloat($cells.eq(1).text().trim()),
          availability: parseInt($cells.eq(2).text().trim()),
          perks: $cells.eq(3).text().trim(),
        });
      });
    }
  });

  // Extract date and time
  const dateTimeText = $('li:contains("Date:")').text();
  const [date, time] = dateTimeText.split('Time:').map(s => s.replace('Date:', '').trim());
  const [startTime, endTime] = time.split('-').map(t => t.trim());

  // Extract location
  const locationText = $('li:contains("Location:")').text();
  const [venueName, ...addressParts] = locationText.replace('Location:', '').split(',').map(s => s.trim());
  const address = addressParts.join(', ');

  // Calculate total capacity from ticket tiers
  const capacity = ticketTiers.reduce((sum, tier) => sum + tier.availability, 0);

  const eventData = {
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: description.substring(0, 200),
    long_description: description,
    date,
    start_time: startTime,
    end_time: endTime,
    venue: {
      name: venueName,
      address,
      city: addressParts[addressParts.length - 2] || '',
      coordinates: {
        lat: 0, // These would need to be set manually or via geocoding
        lng: 0,
      },
    },
    ticket_tiers: ticketTiers,
    capacity,
    tickets_remaining: capacity,
    organizer: {
      name: $('li:contains("Organizer:")').text().replace('Organizer:', '').trim(),
      description: '',
      contact_email: $('li:contains("Contact:")').text().replace('Contact:', '').trim(),
      social_links: {},
    },
    tags: ['event'],
    status: 'upcoming',
  };

  return EventSchema.parse(eventData);
}