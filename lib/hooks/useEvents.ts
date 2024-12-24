import { useEffect } from 'react';
import { useApp } from '@/lib/contexts/app-context';
import { supabase } from '@/lib/supabase';

const MOCK_EVENT = {
  slug: "psytrance-territory",
  title: "Psytrance Territory",
  description: "A journey into the depths of psychedelic trance music",
  long_description: "Experience a night of mind-bending beats and ethereal soundscapes as we bring together the finest psytrance artists for an unforgettable journey.",
  date: "2024-12-13",
  start_time: "23:00:00",
  end_time: "06:00:00",
  image_url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7",
  venue: {
    name: "Alcatraz Bar",
    address: "176 Pochinkovaya Street",
    city: "Moscow",
    coordinates: {
      lat: 55.751244,
      lng: 37.618423
    }
  },
  lineup: [
    {
      id: "1",
      name: "AudioHallu",
      imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7",
      bio: "Master of progressive psytrance",
      socialLinks: {
        soundcloud: "audiuhallu",
        instagram: "audiohallu"
      }
    }
  ],
  ticket_tiers: [
    {
      id: "1",
      name: "Early Bird",
      price: 25,
      description: "Limited early bird tickets",
      availableQuantity: 100
    }
  ],
  status: "upcoming",
  capacity: 300,
  tickets_remaining: 250,
  organizer: {
    id: "1",
    name: "Psytrance Events",
    description: "Premier psytrance event organizer",
    contactEmail: "contact@psytranceevents.com",
    socialLinks: {
      website: "https://psytranceevents.com",
      facebook: "psytranceevents",
      instagram: "psytranceevents"
    }
  },
  tags: ["psytrance", "electronic", "dance", "festival"]
};

export function useEvents() {
  const { state, dispatch } = useApp();

  useEffect(() => {
    async function fetchEvents() {
      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        return;
      }

      if (events && events.length === 0) {
        // Insert mock event if no events exist
        const { data: newEvent, error: insertError } = await supabase
          .from('events')
          .insert([MOCK_EVENT])
          .select()
          .single();

        if (insertError) {
          console.error('Error inserting mock event:', insertError);
          return;
        }

        dispatch({ type: 'SET_EVENTS', payload: [newEvent] });
      } else {
        dispatch({ type: 'SET_EVENTS', payload: events || [] });
      }
    }

    fetchEvents();
  }, [dispatch]);

  return state.events;
}