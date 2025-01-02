"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TicketSetCreation } from '@/components/TicketSetCreation';
import TelegramAdmin from '@/components/telegram-admin';
import { Button } from '@/components/ui/button';
import { Leaderboard } from '@/components/Leaderboard';
import { GameifiedDebugger } from '@/components/GameifiedDebugger';
import { CollaborativeCoding } from '@/components/CollaborativeCoding';
import { BoltNewIntegration } from '@/components/BoltNewIntegration';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BottomSheet } from '@/components/bottom-sheet';

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [redPillRacingEvent, setRedPillRacingEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
    fetchRedPillRacingEvent();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true })
      .limit(10);

    if (error) {
      console.error('Error fetching events:', error);
    } else {
      setEvents(data);
    }
  };

  const fetchRedPillRacingEvent = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('slug', 'dota2_gathering')
      .single();

    if (error) {
      console.error('Error fetching Red Pill Racing event:', error);
    } else {
      setRedPillRacingEvent(data);
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-500">
      <div className="container mx-auto py-20  bg-black text-green-500 border-green-500">
        {redPillRacingEvent && (
          <Card className="mb-12  bg-black text-green-500 border-green-500">
            <CardHeader>
              <CardTitle className="text-4xl font-bold text-green-300">
                {redPillRacingEvent.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/2">
                  <img 
                    src={redPillRacingEvent.image_url} 
                    alt={redPillRacingEvent.title}
                    className="w-full h-64 object-cover rounded-lg shadow-lg"
                  />
                </div>
                <div className="md:w-1/2">
                  <p className="text-lg mb-4">{redPillRacingEvent.description}</p>
                  <p className="text-sm text-green-300 mb-4">
                    {new Date(redPillRacingEvent.date).toLocaleDateString()}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {redPillRacingEvent.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-green-300 border-green-300">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Link href={`/events/${redPillRacingEvent.slug}`}>
                    <Button variant="outline" className="text-green-300 border-green-300 hover:bg-green-800 p-2 rounded-lg">
                      Enter the Matrix
                    </Button>
                  </Link>
                </div>
              </div>
              {/*<BottomSheet>*/}
                <Tabs defaultValue="admin" className="mt-8">
                  <TabsList className="bg-black">
                    <TabsTrigger value="admin" className="text-green-300">Admin Panel</TabsTrigger>
                    <TabsTrigger value="tickets" className="text-green-300">Get Your Tickets</TabsTrigger>
                    {/*<TabsTrigger value="leaderboard" className="text-green-300">Leaderboard</TabsTrigger>
                    <TabsTrigger value="challenge" className="text-green-300">Debug Challenge</TabsTrigger>
                    <TabsTrigger value="collaborate" className="text-green-300">Collaborate</TabsTrigger>
                    <TabsTrigger value="bolt" className="text-green-300">Bolt Integration</TabsTrigger>*/}
                  </TabsList>
                  <TabsContent value="admin">
                    <TelegramAdmin />
                  </TabsContent>
                  <TabsContent value="tickets">
                    <TicketSetCreation eventSlug={redPillRacingEvent.slug} />
                  </TabsContent>
                  <TabsContent value="leaderboard">
                    <Leaderboard eventSlug={redPillRacingEvent.slug} />
                  </TabsContent>
                  <TabsContent value="challenge">
                    <GameifiedDebugger eventSlug={redPillRacingEvent.slug} />
                  </TabsContent>
                  <TabsContent value="collaborate">
                    <CollaborativeCoding eventSlug={redPillRacingEvent.slug} />
                  </TabsContent>
                  <TabsContent value="bolt">
                    <BoltNewIntegration eventSlug="red-pill-racing" tierName="Matrix Hacker" />
                  </TabsContent>
                </Tabs>
              {/*</BottomSheet>*/}
            </CardContent>
          </Card>
        )}

        <h2 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
          Other Upcoming Events
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.filter(event => event.slug !== (`${redPillRacingEvent?.slug}` || "dota2_gathering" )).map((event) => (
            <Link href={`/events/${event.slug}`} key={event.slug} className="transform transition duration-300 hover:scale-105">
              <Card className="h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-green-900 border-green-500">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={event.image_url || 'https://via.placeholder.com/400x200'}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold truncate text-green-300">{event.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-400 mb-2">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                  <p className="line-clamp-2 text-sm mb-4 text-green-200">{event.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-green-300 border-green-300">
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
    </div>
  );
}
