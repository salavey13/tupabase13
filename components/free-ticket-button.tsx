'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '../lib/supabase'

interface FreeTicketButtonProps {
  onTicketGenerated: (ticketId: string, userId: string, eventSlug: string) => Promise<void>
}

export function FreeTicketButton({ onTicketGenerated }: FreeTicketButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleFreeTicket = async () => {
    setIsLoading(true)
    try {
      // 1. Select a random user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_id')
        .limit(1)
        .single()

      if (userError) throw userError

      // 2. Select a random event with available tickets
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('id, slug')
        .gt('available_tickets', 0)
        .limit(1)
        .single()

      if (eventError) throw eventError

      // 3. Select an available ticket for the event
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .select('id')
        .eq('event_id', eventData.id)
        .eq('is_sold', false)
        .limit(1)
        .single()

      if (ticketError) throw ticketError

      // 4. Call the onTicketGenerated function
      await onTicketGenerated(ticketData.id, userData.user_id, eventData.slug)

      toast({
        title: "Success",
        description: "Free ticket generated and sent!",
        duration: 5000,
      })
    } catch (error) {
      console.error('Error generating free ticket:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate free ticket",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleFreeTicket} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        'Generate Free Ticket'
      )}
    </Button>
  )
}

