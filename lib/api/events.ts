import { supabase } from '@/lib/supabase';
import { DbEvent, PublicEvent, AuthenticatedEvent } from '@/types/event';
import { mapToPublicEvent, mapToAuthenticatedEvent } from '@/lib/utils/event-utils';

export async function getPublicEvents(): Promise<PublicEvent[]> {
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true });

  if (error) throw error;
  return (events as DbEvent[]).map(mapToPublicEvent);
}

export async function getPublicEventBySlug(slug: string): Promise<PublicEvent | null> {
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return mapToPublicEvent(event as DbEvent);
}

export async function getAuthenticatedEvents(userId: string): Promise<AuthenticatedEvent[]> {
  const { data: events, error } = await supabase
    .from('events')
    .select('*, tickets!inner(*)')
    .eq('tickets.user_id', userId)
    .order('date', { ascending: true });

  if (error) throw error;
  return (events as DbEvent[]).map(mapToAuthenticatedEvent);
}

export async function getAuthenticatedEventBySlug(
  slug: string,
  userId: string
): Promise<AuthenticatedEvent | null> {
  const { data: event, error } = await supabase
    .from('events')
    .select('*, tickets!inner(*)')
    .eq('slug', slug)
    .eq('tickets.user_id', userId)
    .single();

  if (error) return null;
  return mapToAuthenticatedEvent(event as DbEvent);
}