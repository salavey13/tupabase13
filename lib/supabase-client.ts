import { createClient } from '@supabase/supabase-js';
/*import { NotionEvent } from './notion-parser';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function saveEventToSupabase(event: NotionEvent) {
  const { data, error } = await supabase
    .from('events')
    .insert([{
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      details: event.details,
      schedule: event.schedule,
      budget: event.budget,
      team: event.team,
      status: 'upcoming',
      created_at: new Date().toISOString(),
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}*/