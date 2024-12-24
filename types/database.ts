// Define the Venue type
export type Venue = {
  name: string;
  city: string;
  address?: string;  // Optional address
  coordinates?: { lat: number; lng: number };
};


// Update the Database type
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Artist {
  id: string;
  name: string;
  bio: string;
  imageUrl: string;
}

export interface TicketTier {
  id: string;
  name: string;
  price: number;
  description: string;
  availability:number;
}

type Event = {
  venue: Venue;
};


export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          user_id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          website: string | null;
          status: 'free' | 'pro' | 'admin'; // Enum-like constraint based on your DB schema
          role: 'attendee' | 'organizer' | 'admin'; // Enum-like constraint based on your DB schema
          created_at: string;
          updated_at: string;
          active_organizer_id: string | null;
          metadata: Json;
          description: string | null;
          badges: string[] | null; // Assuming badges is an array of strings, update as needed
        };
        Insert: {
          user_id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          website?: string | null;
          status?: 'free' | 'pro' | 'admin'; // Enum-like constraint for inserting
          role?: 'attendee' | 'organizer' | 'admin'; // Enum-like constraint for inserting
          created_at?: string;
          updated_at?: string;
          active_organizer_id?: string | null;
          metadata?: Json;
          description?: string | null;
          badges?: string[] | null; // Assuming badges is an array of strings
        };
        Update: {
          user_id?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          website?: string | null;
          status?: 'free' | 'pro' | 'admin'; // Enum-like constraint for updating
          role?: 'attendee' | 'organizer' | 'admin'; // Enum-like constraint for updating
          created_at?: string;
          updated_at?: string;
          active_organizer_id?: string | null;
          metadata?: Json;
          description?: string | null;
          badges?: string[] | null; // Assuming badges is an array of strings
        };
      };
      events: {
        Row: {
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
          lineup: Artist[] | null;
          ticket_tiers: TicketTier[] | null;
          status: string;
          capacity: number;
          tickets_remaining: number;
          organizer: Json;
          tags: string[];
          created_at: string;
          updated_at: string;
          organizer_id: string | null;
        };
        Insert: {
          slug: string;
          user_id?: string | null;
          title: string;
          description: string;
          long_description: string;
          date: string;
          start_time?: string | null;
          end_time?: string | null;
          image_url: string;
          venue: Venue | null; // Change to the new Venue type
          lineup: Artist[];
          ticket_tiers: Json;
          status?: string;
          capacity: number;
          tickets_remaining: number;
          organizer: Json;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
          organizer_id?: string | null;
        };
        Update: {
          slug?: string;
          user_id?: string | null;
          title?: string;
          description?: string;
          long_description?: string;
          date?: string;
          start_time?: string | null;
          end_time?: string | null;
          image_url?: string;
          venue?: Venue | null; // Change to the new Venue type
          ineup?: Artist[];
          ticket_tiers?: Json;
          status?: string;
          capacity?: number;
          tickets_remaining?: number;
          organizer?: Json;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
          organizer_id?: string | null;
        };
      };
    };
    Views: {
      unsold_tickets_for_export: {
        Row: {
          ticket_id: string;
          event_slug: string;
          tier: string;
          price: number;
          perks: string | null;
        };
      };
    };
  };
}
