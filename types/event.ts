import { Database, Artist, TicketTier, Venue, Json } from './database';

export type DbEvent = Database['public']['Tables']['events']['Row'];
export type DbUser = Database['public']['Tables']['users']['Row'];

export interface PublicEvent {
  slug: string;
  user_id: string | null;
  title: string;
  description: string;
  long_description: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  image_url: string;
  venue: Venue | null; // Change to the new Venue type
  status: string;
  capacity: number;
  tickets_remaining: number;
  organizer: Json;
  tags: string[];
  created_at: string;
  updated_at: string;
  organizer_id: string | null;
  lineup: Artist[] | null; // Add lineup as an optional array, similar to AuthenticatedEvent
  ticket_tiers: TicketTier[] | null;
}

export interface AuthenticatedEvent extends PublicEvent {
  slug: string;
  user_id: string;
  title: string;
  description: string;
  long_description: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  image_url: string;
  venue: Venue | null; // Change to the new Venue type
  status: string;
  capacity: number;
  tickets_remaining: number;
  organizer: Json;
  tags: string[];
  created_at: string;
  updated_at: string;
  organizer_id: string | null;
  lineup: Artist[] | null;  // Allow lineup to be null
  ticket_tiers: TicketTier[] | null;
  /*organizer: {
    id: string;
    name: string;
    description: string;
    contactEmail: string;
    socialLinks?: {
      website?: string;
      facebook?: string;
      instagram?: string;
    };
  };*/
}