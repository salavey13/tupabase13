import { Client } from '@notionhq/client';  // Removed BlockObjectResponse import
import { z } from 'zod';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export const EventSchema = z.object({
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  imageUrl: z.string(),
  venue: z.object({
    name: z.string(),
    address: z.string(),
    city: z.string(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
  }),
  lineup: z.array(
    z.object({
      name: z.string(),
      imageUrl: z.string(),
      bio: z.string(),
    })
  ),
  ticketTiers: z.array(
    z.object({
      name: z.string(),
      price: z.number(),
      description: z.string(),
      available: z.number(),
    })
  ),
});

export type Event = z.infer<typeof EventSchema>;

export async function getEventFromNotion(pageId: string): Promise<Event> {
  const page = await notion.pages.retrieve({ page_id: pageId });

  if (!('properties' in page)) {
    throw new Error('Page properties are not available. Ensure the correct page is retrieved.');
  }

  const properties = page.properties as Record<string, any>;

  const event = {
    title: getPlainText(properties.title),
    slug: getPlainText(properties.slug),
    description: getPlainText(properties.description),
    date: properties.date.date.start,
    startTime: getPlainText(properties.startTime),
    endTime: getPlainText(properties.endTime),
    imageUrl: properties.imageUrl.url,
    venue: {
      name: getPlainText(properties.venueName),
      address: getPlainText(properties.venueAddress),
      city: getPlainText(properties.venueCity),
      coordinates: {
        lat: properties.venueLat.number,
        lng: properties.venueLng.number,
      },
    },
    lineup: [],  // Commenting out lineup fetching for now await parseLineup(pageId),
    ticketTiers: [],  // Commenting out ticketTiers fetching for now parseTicketTiers(pageId),
  };

  return EventSchema.parse(event);
}

function getPlainText(property: any): string {
  if (property?.type === 'title' || property?.type === 'rich_text') {
    return property[property.type]?.[0]?.plain_text || '';
  }
  throw new Error(`Unexpected property type: ${property?.type}`);
}

// Temporarily commenting out the lineup and ticket parsing functions
/*
async function parseLineup(pageId: string) {
  const blocks = await notion.blocks.children.list({ block_id: pageId });

  const lineupBlock = blocks.results.find(isBlockObjectResponseWithTable);

  if (!lineupBlock || !lineupBlock.table) return [];

  const tableBlock = lineupBlock as { type: string; table: any };

  return tableBlock.table.rows.map((row: any) => ({
    name: row.cells[0][0].plain_text,
    imageUrl: row.cells[1][0].plain_text,
    bio: row.cells[2][0].plain_text,
  }));
}

async function parseTicketTiers(pageId: string) {
  const blocks = await notion.blocks.children.list({ block_id: pageId });

  const ticketsBlock = blocks.results.find(isBlockObjectResponseWithTable);

  if (!ticketsBlock || !ticketsBlock.table) return [];

  const tableBlock = ticketsBlock as { type: string; table: any };

  return tableBlock.table.rows.map((row: any) => ({
    name: row.cells[0][0].plain_text,
    price: parseFloat(row.cells[1][0].plain_text),
    description: row.cells[2][0].plain_text,
    available: parseInt(row.cells[3][0].plain_text),
  }));
}
*/

