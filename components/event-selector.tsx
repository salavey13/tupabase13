'use client'

import { useEffect, useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Event, getEvents } from "@/lib/database"

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'


interface EventSelectorProps {
  onEventSelect: (eventSlug: string | null) => void
  selectedEventSlug?: string
}

export function EventSelector({ onEventSelect, selectedEventSlug }: EventSelectorProps) {
  const [open, setOpen] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadEvents()
  }, [])

  useEffect(() => {
    console.log('Selected event slug:', selectedEventSlug)
    console.log('Events:', events)
    if (selectedEventSlug && events.length > 0) {
      const event = events.find(e => e.slug === selectedEventSlug)
      console.log('Found event:', event)
      if (event) setSelectedEvent(event)
    }
  }, [selectedEventSlug, events])

  async function loadEvents() {
    setIsLoading(true)
    try {
      console.log('Loading events...')
      const fetchedEvents = await getEvents()
      console.log('Fetched events:', fetchedEvents)
      setEvents(fetchedEvents)
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {isLoading ? "Loading..." : (selectedEvent ? selectedEvent.title : "Select event...")}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search events..." />
          <CommandEmpty>No event found.</CommandEmpty>
          <CommandGroup>
            {events.map((event) => (
              <CommandItem
                key={event.slug}
                onSelect={() => {
                  setSelectedEvent(event)
                  onEventSelect(event.slug)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedEvent?.slug === event.slug ? "opacity-100" : "opacity-0"
                  )}
                />
                {event.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

