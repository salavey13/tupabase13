"use client";

import { useEffect, useState } from "react";
import { useEvents } from "@/lib/hooks/useEvents";
import { getPublicEvents } from "@/lib/api/events";
import { EventSlider } from "@/components/EventSlider";
import { CenteredLoading } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useApp } from "@/lib/contexts/app-context";
import { PublicEvent, AuthenticatedEvent, DbEvent } from "@/types/event";
import { mapToPublicEvent, mapToAuthenticatedEvent } from "@/lib/utils/event-utils";

export default function EventsPage() {
  const { isAuthenticated } = useApp();
  const [publicEvents, setPublicEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const authenticatedEvents = useEvents();

  const fetchPublicEvents = async () => {
    try {
      const rawEvents: DbEvent[] = await getPublicEvents();

      // Map raw events to PublicEvent using the utility function
      const transformedEvents: PublicEvent[] = rawEvents.map(mapToPublicEvent);

      setPublicEvents(transformedEvents);
    } catch (error) {
      console.error("Error fetching public events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      fetchPublicEvents();
    } else {
      setLoading(false); // Authenticated users rely on `useEvents`.
    }
  }, [isAuthenticated]);

  // Combine public and authenticated events
  const events: (PublicEvent | AuthenticatedEvent)[] = [
    ...publicEvents,
    ...(authenticatedEvents?.map(mapToAuthenticatedEvent) ?? []), // Ensure consistent transformation
  ];

  if (loading || (isAuthenticated && !authenticatedEvents)) {
    return <CenteredLoading />;
  }

  return (
    <div className="min-h-screen h-[100vh] bg-black">
      {events.length > 0 ? (
        <EventSlider events={events} />
      ) : (
        <div className="h-[100vh] flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-4">No events found</h2>
            {isAuthenticated && (
              <Link href="/admin/events/new">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Create Event
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
