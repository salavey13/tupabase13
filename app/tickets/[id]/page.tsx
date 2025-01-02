import { supabase } from '@/utils/supabase'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface TicketPageProps {
  params: Promise<{ id: string }>;
}


async function getTicketInfo(id: string) {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      events (
        title,
        slug
      ),
      event_ticket_user (
        users (
          username,
          full_name
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching ticket info:', error)
    return null
  }

  return data
}

export default async function TicketPage({ params }: TicketPageProps) {
  const { id } = await params;
  const ticketInfo = await getTicketInfo(id)

  if (!ticketInfo) {
    return <div className="container mx-auto py-8">Ticket not found</div>
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Ticket Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p><strong>Ticket ID:</strong> {ticketInfo.id}</p>
            <p><strong>Event:</strong> {ticketInfo.events.title}</p>
            <p><strong>Tier:</strong> {ticketInfo.tier}</p>
            <p><strong>Price:</strong> ${ticketInfo.price}</p>
            <p><strong>Status:</strong> {ticketInfo.is_sold ? 'Sold' : 'Available'}</p>
            {ticketInfo.event_ticket_user && ticketInfo.event_ticket_user[0] && (
              <p><strong>Assigned to:</strong> {ticketInfo.event_ticket_user[0].users.full_name || ticketInfo.event_ticket_user[0].users.username}</p>
            )}
            <Link href={`/events/${ticketInfo.events.slug}`}>
              <Button variant="matrix">View Event</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

