import { createClient } from '@supabase/supabase-js'

const supabaseUrl = /*process.env.NEXT_PUBLIC_SUPABASE_URL ||*/ "https://tyqnthnifewjrrjlvmor.supabase.co"
const supabaseAnonKey = /*process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||*/ "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5cW50aG5pZmV3anJyamx2bW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTc5Mjk3MzEsImV4cCI6MjAxMzUwNTczMX0.Dw_NeU4KGTyFpHat5rPcfBvAzHuvEDZwCUg0ceurI2s"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Event {
  slug: string
  user_id: string | null
  title: string
  description: string
  long_description: string
  date: string
  start_time: string | null
  end_time: string | null
  image_url: string
  venue: any
  lineup: any
  ticket_tiers: any
  status: string
  capacity: number
  tickets_remaining: number
  organizer: any
  tags: string[]
  created_at: string | null
  updated_at: string | null
  organizer_id: string | null
  digiseller_product_id: string | null
}

export async function getEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true })

  if (error) {
    console.error('Error fetching events:', error)
    throw error
  }
  return data || []
}

export async function getEvent(slug: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) throw error
  return data
}

export interface User {
  user_id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  website: string | null
  status: 'free' | 'pro' | 'admin'
  role: string
  created_at: string | null
  updated_at: string | null
  active_organizer_id: string | null
  metadata: any
  description: string | null
  badges: any
}

export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')

  if (error) {
    console.error('Error fetching users:', error)
    throw error
  }
  return data || []
}

