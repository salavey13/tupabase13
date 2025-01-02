import React from 'react'
import { Event } from '../lib/database'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface EventDetailsProps {
  event: Event
  onPurchaseTicket: (tierId: string) => void
}

export function EventDetails({ event, onPurchaseTicket }: EventDetailsProps) {
  const ticketTiers = Array.isArray(event.ticket_tiers) ? event.ticket_tiers : []

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{event.title}</CardTitle>
        <CardDescription>{event.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p><strong>Date:</strong> {event.date ? new Date(event.date).toLocaleDateString() : 'TBA'}</p>
          <p><strong>Time:</strong> {event.start_time && event.end_time ? `${event.start_time} - ${event.end_time}` : 'TBA'}</p>
          <p><strong>Venue:</strong> {event.venue ? JSON.stringify(event.venue) : 'TBA'}</p>
          <p><strong>Lineup:</strong> {event.lineup ? JSON.stringify(event.lineup) : 'TBA'}</p>
          <p><strong>Tickets Remaining:</strong> {event.tickets_remaining}</p>
          <div>
            <h3 className="text-lg font-semibold mb-2">Ticket Tiers</h3>
            {ticketTiers.length > 0 ? (
              ticketTiers.map((tier) => (
                <div key={tier.tier} className="flex justify-between items-center mb-2">
                  <span>{tier.tier} - ${tier.price} ({tier.perks})</span>
                  <Button onClick={() => onPurchaseTicket(tier.tier)}>Purchase</Button>
                </div>
              ))
            ) : (
              <p>No ticket tiers available</p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-gray-500">
          This is a "Pay-to-Win Mentorship Gladiator Race" event. By purchasing a ticket, you're entering a high-stakes coding competition.
        </p>
      </CardFooter>
    </Card>
  )
}

