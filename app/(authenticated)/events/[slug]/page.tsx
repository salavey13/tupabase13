"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useApp } from "@/lib/contexts/app-context";
import { getEventBySlug, validateEventAccess } from "@/lib/api/events";
import { CenteredLoading } from "@/components/Navigation";
import { EventHeader } from "@/components/events/EventHeader";
import { EventDetails } from "@/components/events/EventDetails";
import { EventLineup } from "@/components/events/EventLineup";
import { EventTickets } from "@/components/events/EventTickets";
import { TicketPurchaseDialog } from "@/components/TicketPurchaseDialog";
import { toast } from "sonner";
import { DbEvent } from '@/types/event';
import { TicketSetCreation } from '@/components/TicketSetCreation'

export default function EventPage() {
  const params = useParams();
  const { state } = useApp();
  const [event, setEvent] = useState<DbEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(true);//false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);

  useEffect(() => {
    async function fetchEventAndValidateAccess() {
      if (!state.user) return;

      const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
      if (!slug) {
        setLoading(false);
        return;
      }

      try {
        const eventData = await getEventBySlug(slug);
        setEvent(eventData);

        //const access = await validateEventAccess(slug, state.user.user_id);
        //setHasAccess(access);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load event');
      } finally {
        setLoading(false);
      }
    }

    fetchEventAndValidateAccess();
  }, [params.slug, state.user]);

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

  return (
    <div className="min-h-screen bg-black text-white">
      <EventHeader title={event.title} date={event.date} imageUrl={event.image_url} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-xl p-6 md:p-8">
          <EventDetails
            date={event.date}
            startTime={event.start_time || ""}
            endTime={event.end_time || ""}
            venue={event.venue || { name: "", address: "" }}
          />
          <div className="prose prose-invert max-w-none mb-12">
            <h2 className="text-2xl font-bold mb-4">About the Event</h2>
            <p className="text-gray-300">{hasAccess ? event.long_description : event.description}</p>
          </div>
          {hasAccess && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <EventLineup lineup={event.lineup || []} />
              <EventTickets
                ticketsRemaining={event.tickets_remaining}
                ticketTiers={event.ticket_tiers || []}
                onPurchase={() => setShowPurchaseDialog(true)}
              />
            </div>
          )}
        </div>
      </div>
      {hasAccess && (
        <TicketPurchaseDialog
          event={event}
          open={showPurchaseDialog}
          onOpenChange={setShowPurchaseDialog}
        />
      )}

          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Ticket Management</CardTitle>
            </CardHeader>
            <CardContent>
              <TicketSetCreation eventSlug={event.slug} />
            </CardContent>
          </Card>


        <h2 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-purple-600">
          Other Upcoming Events
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.filter(event => event.slug !== 'red-pill-racing').map((event) => (
            <Link href={`/events/${event.slug}`} key={event.slug} className="transform transition duration-300 hover:scale-105">
              <Card className="h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-800">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={event.image_url || 'https://via.placeholder.com/400x200'} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold truncate">{event.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                  <p className="line-clamp-2 text-sm mb-4">{event.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
    </div>
  );
}