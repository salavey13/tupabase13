import { DbEvent, PublicEvent, AuthenticatedEvent } from '@/types/event';

export function mapToPublicEvent(event: DbEvent): PublicEvent {
  return {
    slug: event.slug,
    title: event.title,
    description: event.description,
    long_description: event.long_description || "", // Default to empty string if missing
    date: event.date,
    start_time: event.start_time || null, // Default to null if missing
    end_time: event.end_time || null, // Default to null if missing
    image_url: event.image_url,
    venue: event.venue ? { name: event.venue.name, city: event.venue.city } : null,
    status: event.status,
    capacity: event.capacity || 0, // Default to 0 if missing
    tickets_remaining: event.tickets_remaining,
    organizer: event.organizer || {}, // Default to empty object if missing
    tags: event.tags || [], // Default to empty array if missing
    created_at: event.created_at,
    updated_at: event.updated_at,
    organizer_id: event.organizer_id || null, // Default to null if missing
    lineup: event.lineup || null, // Default to null if missing
    ticket_tiers: event.ticket_tiers || null, // Default to null if missing
    user_id: event.user_id || "",
  };
}

export function mapToAuthenticatedEvent(event: DbEvent): AuthenticatedEvent {
  return {
    ...mapToPublicEvent(event),
    user_id: event.user_id || "",
    long_description: event.long_description,
    start_time: event.start_time,
    end_time: event.end_time,
    venue: event.venue as AuthenticatedEvent['venue'],
    lineup: event.lineup as AuthenticatedEvent['lineup'],
    ticket_tiers: event.ticket_tiers as AuthenticatedEvent['ticket_tiers'],
    organizer: event.organizer as AuthenticatedEvent['organizer'],
  };
}