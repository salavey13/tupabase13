'use client'

import { useState, useEffect } from 'react'
import { Loader2, Plus, Send, Trash2 } from 'lucide-react'
//import { useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { ImageSelector } from '@/components/image-selector'
import { UserSelector } from '@/components/user-selector'
import { sendTelegramMessage } from '@/actions/telegram'
import { FreeTicketButton } from '@/components/free-ticket-button'
import { getEvents, Event } from '../lib/database'
import { EventDetails } from './event-details'
import { EventSelector } from '@/components/event-selector'
import { supabase } from '@/lib/supabase';
interface InlineButton {
  text: string
  url: string
}

export default function TelegramAdmin() {
  const [message, setMessage] = useState('')
  const [buttons, setButtons] = useState<InlineButton[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)  
  //const searchParams = useSearchParams()
  const { toast } = useToast()

  const token =  "6318069842:AAHgjV87LZfrsfm3fenz2xZzDmLttPKCWK4"//searchParams?.get('token') ||

  const addButton = () => {
    setButtons([...buttons, { text: '', url: '' }])
  }

  const removeButton = (index: number) => {
    setButtons(buttons.filter((_, i) => i !== index))
  }

  const updateButton = (index: number, field: keyof InlineButton, value: string) => {
    setButtons(
      buttons.map((button, i) =>
        i === index ? { ...button, [field]: value } : button
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Bot token is required. Add it to the URL as ?token=YOUR_TOKEN",
        duration: 5000,
      })
      return
    }

    if (!message.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Message content is required",
        duration: 5000,
      })
      return
    }

    setIsLoading(true)
    try {
      let recipients: string[] = []

      if (selectedUserId === 'EVERYONE') {
        const { data: allUsers, error } = await supabase.from('users').select('user_id')
        if (error) throw error
                                   
        recipients = allUsers.map(user => user.user_id)
      } else if (selectedUserId?.startsWith('TIER:')) {
        const tier = selectedUserId.split(':')[1]
        const { data: tierUsers, error } = await supabase
          .from('tickets')
          .select('user_id')
          .eq('tier', tier)
        if (error) throw error
        recipients = tierUsers.map(user => user.user_id)
      } else if (selectedUserId) {
        recipients = [selectedUserId]
      }

      for (const recipient of recipients) {
        const result = await sendTelegramMessage(
          token,
          message,
          buttons,
          imageUrl,
          recipient
        )
        
        if (!result.success) {
          throw new Error(result.error)
        }
      }
      toast({
        title: "Success",
        description: "Message(s) sent successfully!",
        duration: 5000,
      })
      
      // Clear form
      //setMessage('')
      //setButtons([])
      //setImageUrl('')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTicketGenerated = async (ticketId: string, userId: string, eventSlug: string) => {
    const ticketUrl = `https://t.me/oneSitePlsBot/patimaker?ticket=${ticketId}&event=${eventSlug}`
    const ticketMessage = `Congratulations! You've won a free ticket to an event. Click the button below to claim your ticket.`
    
    const ticketButtons = [{
      text: 'Claim Ticket',
      url: ticketUrl
    }]

    try {
      const result = await sendTelegramMessage(
        token,
        ticketMessage,
        ticketButtons,
        '',
        userId
      )

      if (!result.success) {
        throw new Error(result.error)
      }

      // Update the ticket status in the database
      const { error: updateError } = await supabase
        .from('tickets')
        .update({ is_sold: true, user_id: userId })
        .eq('id', ticketId)

      if (updateError) throw updateError

      toast({
        title: "Success",
        description: "Free ticket sent to the user!",
        duration: 5000,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send free ticket",
        duration: 5000,
      })
    }
  }

  const handlePurchaseTicket = async (tierId: string) => {
    if (!selectedEvent) return
    // Implement ticket purchase logic here
    console.log(`Purchasing ticket for tier ${tierId} of event ${selectedEvent.slug}`)
    toast({
      title: "Success",
      description: "Ticket purchased successfully!",
      duration: 5000,
    })
  }

  useEffect(() => {
    async function fetchEvents() {
      try {
        const fetchedEvents = await getEvents()
        console.log('Fetched events:', fetchedEvents)
        setEvents(fetchedEvents)
      } catch (error) {
        console.error('Error fetching events:', error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch events",
          duration: 5000,
        })
      }
    }
    fetchEvents()
  }, [])
  
  return (
    <div className="bg-black text-green-500 border-green-500">
      {/*<Card className="mx-auto max-w-2xl mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Event Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <EventSelector
            onEventSelect={(slug) => {
              const selected = events.find(event => event.slug === slug)
              setSelectedEvent(selected || null)
            }}
            selectedEventSlug={selectedEvent?.slug}
          />
        </CardContent>
      </Card>

      {selectedEvent && (
        <EventDetails event={selectedEvent} onPurchaseTicket={handlePurchaseTicket} />
      )}*/}

      <Card className="bg-black text-green-500 border-green-500">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Telegram Bot Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/*<div className="space-y-4">
              <Label>Recipient</Label>
              <UserSelector
                onUserSelect={setSelectedUserId}
                selectedUserId={selectedUserId || "413553377"}
              />
            </div>

            <div className="space-y-4">
              <Label>Event</Label>
              <EventSelector
                onEventSelect={setSelectedEventId}
                selectedEventId={selectedEventId || undefined}
              />
            </div>*/}

            <div className="space-y-2">
              <Label htmlFor="message">Message Content</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message..."
                className="min-h-[120px] font-mono bg-black text-green-500 border-green-500"
                required
              />
            </div>

            <ImageSelector
              onImageSelect={setImageUrl}
              selectedImage={imageUrl}
              //selectedEvent={selectedEvent} //This line was added based on the update.  Assuming selectedEvent is available in scope.
            />

            {buttons.length > 0 && (
              <div className="space-y-4">
                <Label>Inline Buttons</Label>
                {buttons.map((button, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Button text"
                      value={button.text}
                      onChange={(e) => updateButton(index, 'text', e.target.value)}
                      required
                      className="font-mono bg-black text-green-500 border-green-500"
                    />
                    <Input
                      placeholder="Button URL"
                      value={button.url}
                      onChange={(e) => updateButton(index, 'url', e.target.value)}
                      type="url"
                      className="font-mono bg-black text-green-500 border-green-500"
                      required
                    />
                    <Button
                      type="button"
                      variant="default"
                      onClick={() => removeButton(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="default"
                onClick={addButton}
                className="w-full sm:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Button
              </Button>

              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </form>
          {/*<div className="mt-6">
            <FreeTicketButton onTicketGenerated={handleTicketGenerated} />
          </div>*/}
        </CardContent>
      </Card>
    </div>
  )
}

