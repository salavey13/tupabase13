import { supabase } from '@/lib/supabase';

export async function getTicketDetails(ticketId: string) {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      ticket_id,
      event_slug,
      tier,
      price,
      perks,
      is_sold,
      events (
        slug,
        title,
        description,
        date,
        image_url,
        venue,
        lineup,
        ticket_tiers,
        status
      )
    `)
    .eq('ticket_id', ticketId)
    .single();

  if (error) throw error;
  return data;
}

export async function assignTicketToUser(ticketId: string, userId: string) {
  const { error } = await supabase.rpc('assign_ticket_to_user', {
    ticket_id: ticketId,
    user_id: userId
  });

  if (error) throw error;
}

export async function validateTicketAccess(ticketId: string, userId: string) {
  const { data, error } = await supabase
    .from('event_ticket_user')
    .select('*')
    .eq('ticket_id', ticketId)
    .eq('user_id', userId)
    .single();

  if (error) return false;
  return Boolean(data);
}