import { supabase } from "@/lib/supabase";

export async function purchaseTicket(
  eventSlug: string,
  tierId: string,
  userId: string
) {
  try {
    const { data, error } = await supabase.rpc('purchase_ticket', {
      p_event_slug: eventSlug,
      p_tier_id: tierId,
      p_user_id: userId
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error purchasing ticket:', error);
    throw error;
  }
}

export async function validateTicketPurchase(
  eventSlug: string,
  userId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('validate_ticket_purchase', {
      p_event_slug: eventSlug,
      p_user_id: userId
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error validating ticket purchase:', error);
    throw error;
  }
}