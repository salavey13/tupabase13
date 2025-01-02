import { supabase } from '@/lib/supabase';
import { DbEvent, PublicEvent, AuthenticatedEvent } from '@/types/event';
import { mapToPublicEvent, mapToAuthenticatedEvent } from '@/lib/utils/event-utils';

export async function getEventBySlug(slug: string) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data;
}

export async function validateEventAccess(eventSlug: string, userId: string) {
  const { data, error } = await supabase
    .from('event_ticket_user')
    .select('*')
    .eq('tickets.event_slug', eventSlug)
    .eq('user_id', userId)
    .single();

  if (error) return false;
  return Boolean(data);
}

export async function getPublicEvents(): Promise<PublicEvent[]> {
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true });

  if (error) throw error;
  return (events as DbEvent[]).map(mapToPublicEvent);
}