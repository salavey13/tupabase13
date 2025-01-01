"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useApp } from "@/lib/contexts/app-context";
import { getPublicEventBySlug } from "@/lib/api/events";
import { CenteredLoading } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { EventHeader } from "@/components/events/EventHeader";
import { EventDetails } from "@/components/events/EventDetails";
import { EventLineup } from "@/components/events/EventLineup";
import { EventTickets } from "@/components/events/EventTickets";
import { TicketPurchaseDialog } from "@/components/TicketPurchaseDialog";
import Image from "next/image";
import { Calendar, MapPin, Share2 } from "lucide-react";
import { DbEvent, PublicEvent } from '@/types/event';
import { TicketTier } from "@/types/database";

export default function EventPage() {
  const params = useParams();
  const { state, isAuthenticated } = useApp();
  const [event, setEvent] = useState<DbEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);

  // Define the async function outside of useEffect
  const fetchEvent = async () => {
    const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
    if (!slug) {
      setEvent(null);
      setLoading(false);
      return;
    }

    if (isAuthenticated) {
      const currentEvent = state.events.find((e) => e.slug === slug);
      setEvent(currentEvent || null);
    } else {
      const publicEvent = await getPublicEventBySlug(slug);
      if (publicEvent) {
        const transformedEvent: DbEvent = {
          slug: publicEvent.slug || '',
          title: publicEvent.title || '',
          description: publicEvent.description || '',
          long_description: '',
          date: publicEvent.date || '',
          start_time: null,
          end_time: null,
          image_url: publicEvent.image_url || '',
          venue: publicEvent.venue
            ? {
                name: publicEvent.venue.name || '',
                address: publicEvent.venue.address || '', 
                city: publicEvent.venue.city || '',
                coordinates: publicEvent.venue.coordinates || { lat: 0, lng: 0 }, 
              }
            : { name: '', address: '', city: '', coordinates: { lat: 0, lng: 0 } },
          organizer_id: null,
          user_id: null,
          status: 'upcoming',
          tickets_remaining: 0,
          ticket_tiers: sanitizeTicketTiers(publicEvent.ticket_tiers),
          lineup: Array.isArray(publicEvent.lineup)
            ? publicEvent.lineup.map((artist) => ({
                id: artist.id || '',
                name: artist.name || 'Unknown Artist',
                bio: artist.bio || 'No bio available',
                imageUrl: artist.imageUrl || '/default-artist.jpg',
              }))
            : [],
          capacity: 0,
          tags: [],
          organizer: 'Anonymous',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setEvent(transformedEvent);
      } else {
        setEvent(null);
      }
    }
    setLoading(false);
  };

  // Call the async function inside useEffect
  useEffect(() => {
    fetchEvent();
  }, [params.slug, state.events, isAuthenticated]);

  function sanitizeTicketTiers(data: unknown[] | null): TicketTier[] {
    if (!Array.isArray(data)) return [];
    return data
      .filter((item): item is { id: string; name: string; price: number; description: string; availability:number; } =>
        item !== null && typeof item === 'object' &&
        'id' in item && 'name' in item && 'price' in item && 'description' in item && 'availability' in item
      )
      .map((item) => ({
        id: String(item.id),
        name: String(item.name),
        price: Number(item.price),
        description: String(item.description),
        availability: Number(item.availability),
      }));
  }

  if (loading) {
    return <CenteredLoading />;
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Event not found</h2>
          <p className="text-gray-400">The event you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let ticketTiers: unknown[] | null = null;
  try {
    ticketTiers = typeof event.ticket_tiers === 'string'
      ? JSON.parse(event.ticket_tiers)
      : event.ticket_tiers;
  } catch (error) {
    console.error("Failed to parse ticket tiers:", error);
    ticketTiers = null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {isAuthenticated ? (
        <>
          <EventHeader title={event.title} date={event.date} imageUrl={event.image_url} />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-xl p-6 md:p-8">
              <EventDetails
                date={event.date}
                startTime={event.start_time || ""} 
                endTime={event.end_time || ""} 
                venue={
                  event.venue
                    ? {
                        name: event.venue.name || "",  
                        address: event.venue.address || "",  
                      }
                    : { name: "", address: "" }  
                }
              />
              <div className="prose prose-invert max-w-none mb-12">
                <h2 className="text-2xl font-bold mb-4">About the Event</h2>
                <p className="text-gray-300">{event.long_description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <EventLineup lineup={event.lineup ?? []} />
                <EventTickets
                  ticketsRemaining={event.tickets_remaining}
                  ticketTiers={sanitizeTicketTiers(ticketTiers)}
                  onPurchase={() => setShowPurchaseDialog(true)}
                />
              </div>
            </div>
          </div>
          <TicketPurchaseDialog
            event={event}
            open={showPurchaseDialog}
            onOpenChange={setShowPurchaseDialog}
          />
        </>
      ) : (
        <>
          <div className="relative h-[60vh]">
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-90" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-xl p-6 md:p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">{event.title}</h1>
                  <p className="text-xl text-purple-400">{formattedDate}</p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-gray-800 hover:bg-gray-700"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="flex items-center space-x-3 bg-gray-800/50 p-4 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-400">Date</p>
                    <p className="font-semibold">{formattedDate}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 bg-gray-800/50 p-4 rounded-lg">
                  <MapPin className="h-6 w-6 text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-400">Location</p>
                    <p className="font-semibold">{event.venue ? event.venue.name : "Unknown Venue"}</p>
                    <p className="text-sm text-gray-400">{event.venue ? event.venue.city : "Unknown City"}</p>
                  </div>
                </div>
              </div>
              <div className="prose prose-invert max-w-none mb-12">
                <h2 className="text-2xl font-bold mb-4">About the Event</h2>
                <p className="text-gray-300">{event.description}</p>
              </div>
              <div className="text-center">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Login to Buy Tickets
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
