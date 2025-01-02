import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tyqnthnifewjrrjlvmor.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5cW50aG5pZmV3anJyamx2bW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTc5Mjk3MzEsImV4cCI6MjAxMzUwNTczMX0.Dw_NeU4KGTyFpHat5rPcfBvAzHuvEDZwCUg0ceurI2s'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

