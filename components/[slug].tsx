import { TicketSetCreation } from '@/components/TicketSetCreation';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getEventBySlug } from '@/utils/supabase';
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface EventMetadata {
  title: string;
  description: string;
  long_description: string;
  date: string;
  start_time: string;
  end_time: string;
  image_url: string;
  venue: {
    city: string;
    name: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    }
  };
}

export default function EventPage() {
  const router = useRouter();
  const [eventSlug, setEventSlug] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [eventMetadata, setEventMetadata] = useState<EventMetadata | null>(null);

  useEffect(() => {
    if (router.isReady && router.query.slug) {
      const slug = Array.isArray(router.query.slug) ? router.query.slug[0] : router.query.slug;
      setEventSlug(slug);
      fetchEventMetadata(slug);
    }
  }, [router.isReady, router.query.slug]);

  const fetchEventMetadata = async (slug: string) => {
    setIsLoading(true);
    try {
      const data = await getEventBySlug(slug);
      setEventMetadata(data);
    } catch (error) {
      console.error('Error fetching event metadata:', error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-4 w-1/3 mb-2" />
        <Skeleton className="h-4 w-2/3 mb-8" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (!eventMetadata) {
    return <div className="container mx-auto py-8">Event not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            {eventMetadata.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-2">{eventMetadata.description}</p>
          <p className="text-sm text-gray-500 mb-2">
            {new Date(eventMetadata.date).toLocaleDateString()} | 
            {eventMetadata.start_time && new Date(eventMetadata.start_time).toLocaleTimeString()} - 
            {eventMetadata.end_time && new Date(eventMetadata.end_time).toLocaleTimeString()}
          </p>
          <p className="text-sm text-gray-500">
            {eventMetadata.venue.name}, {eventMetadata.venue.address}, {eventMetadata.venue.city}
          </p>
        </CardContent>
      </Card>
      {eventSlug && <TicketSetCreation eventSlug={eventSlug} />}
    </div>
  );
}

