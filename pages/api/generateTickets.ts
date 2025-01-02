import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { eventSlug } = req.body;

    try {
      // Call the Supabase function to generate tickets
      const { data, error } = await supabase.rpc('generate_tickets_for_event', { event_slug: eventSlug });

      if (error) throw error;

      res.status(200).json({ message: 'Tickets generated successfully', data });
    } catch (error) {
      console.error('Error generating tickets:', error);
      res.status(500).json({ error: 'Error generating tickets' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

