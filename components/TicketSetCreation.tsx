'use client'
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { createAndSellTickets, getDigisellerProductStats, getDigisellerWidgetCode } from '@/lib/utils/digiseller';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TicketTier {
  tier: string;
  price: number;
  quantity: number;
  perks: string;
  digiseller_product_id?: string;
}

interface TicketStats {
  tier: string;
  total: number;
  sold: number;
  available: number;
}

export function TicketSetCreation({ eventSlug }: { eventSlug: string }) {
  const [ticketTiers, setTicketTiers] = useState<TicketTier[]>([]);
  const [newTier, setNewTier] = useState<TicketTier>({ tier: '', price: 13, quantity: 0, perks: '' });
  const [stats, setStats] = useState<TicketStats[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [saleProgress, setSaleProgress] = useState<number>(0);

  useEffect(() => {
    console.log('TicketSetCreation: Initializing component for event slug:', eventSlug);
    fetchTicketTiers();
    const subscription = supabase
      .channel('ticket_tiers_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ticket_tiers' }, (payload) => {
        console.log('TicketSetCreation: Received real-time update:', payload);
        fetchTicketTiers();
      })
      .subscribe();

    return () => {
      console.log('TicketSetCreation: Unsubscribing from real-time updates');
      subscription.unsubscribe();
    };
  }, [eventSlug]);

const fetchTicketTiers = async () => {
  console.log('Fetching ticket tiers for event slug:', eventSlug);
  try {
    // Fetch event-specific ticket tiers
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('ticket_tiers')
      .eq('slug', eventSlug)
      .single();

    if (eventError) throw eventError;

    // Fetch ticket tier details
    const { data: tierData, error: tierError } = await supabase
      .from('ticket_tiers')
      .select('*')
      .eq('event_slug', eventSlug);

    if (tierError) throw tierError;

    console.log('Fetched event data:', eventData);
    console.log('Fetched tier data:', tierData);

    // Merge event and tier data
    const mergedTiers = eventData.ticket_tiers.map((eventTier: TicketTier) => {
      const matchingTier = tierData.find((t: TicketTier) => t.tier === eventTier.tier);
      return { ...eventTier, ...matchingTier };
    });

    console.log('Merged tiers:', mergedTiers);
    setTicketTiers(mergedTiers);
    updateSaleStats(mergedTiers);
  } catch (error) {
    console.error('Error fetching ticket tiers:', error);
    setMessage({ type: 'error', text: 'Failed to fetch ticket tiers. Please try again.' });
  }
};


const updateSaleStats = (tiers: TicketTier[]) => {
  const totalTickets = tiers.reduce((sum, tier) => sum + tier.quantity, 0);
  const soldTickets = tiers.reduce((sum, tier) => sum + (tier.quantity - (tier.available || 0)), 0);
  const progress = (soldTickets / totalTickets) * 100;
  const revenue = tiers.reduce((sum, tier) => sum + (tier.quantity - (tier.available || 0)) * tier.price, 0);

  console.log('Updating sale stats:', { totalTickets, soldTickets, progress, revenue });
  setSaleProgress(progress);
  setTotalRevenue(revenue);
};

  const handleAddTier = async () => {
    console.log('Adding new tier:', newTier);
    try {
      // Create Digiseller product
      const { data: productData, error: productError } = await createAndSellTickets(
        eventSlug,
        newTier.tier,
        newTier.price,
        newTier.quantity,
        newTier.perks
      );
  
      if (productError) throw productError;
  
      console.log('Created Digiseller product:', productData);
  
      // Insert new tier into ticket_tiers table
      const { data, error } = await supabase
        .from('ticket_tiers')
        .insert([{ ...newTier, event_slug: eventSlug, digiseller_product_id: productData.productId }]);
  
      if (error) throw error;
  
      console.log('Inserted new tier into ticket_tiers table');
  
      await syncTicketTiers(eventSlug);
  
      setMessage({ type: 'success', text: 'New tier added successfully!' });
      setNewTier({ tier: '', price: 0, quantity: 0, perks: '' });
      fetchTicketTiers();
    } catch (error) {
      console.error('Error adding new tier:', error);
      setMessage({ type: 'error', text: 'Failed to add new tier. Please try again.' });
    }
  };
  
    const handleEditTier = (tier: TicketTier) => {
    console.log('Editing tier:', tier);
    setEditingTier(tier);
  };

  const handleUpdateTier = async () => {
    if (!editingTier) return;
  
    console.log('Updating tier:', editingTier);
    try {
      const { error } = await supabase
        .from('ticket_tiers')
        .update({ price: editingTier.price, perks: editingTier.perks })
        .eq('event_slug', eventSlug)
        .eq('tier', editingTier.tier);
  
      if (error) throw error;
  
      console.log('Updated tier in ticket_tiers table');
      await syncTicketTiers(eventSlug);
  
      setMessage({ type: 'success', text: 'Tier updated successfully!' });
      setEditingTier(null);
      fetchTicketTiers();
    } catch (error) {
      console.error('Error updating tier:', error);
      setMessage({ type: 'error', text: 'Failed to update tier. Please try again.' });
    }
  };

  const calculateRevenueAndProgress = (stats: TicketStats[]) => {
    let revenue = 0;
    let totalSold = 0;
    let totalAvailable = 0;
  
    stats.forEach(stat => {
      revenue += stat.sold * (ticketTiers.find(tier => tier.tier === stat.tier)?.price || 0);
      totalSold += stat.sold;
      totalAvailable += stat.available;
    });
  
    setTotalRevenue(revenue);
    setSaleProgress((totalSold / (totalSold + totalAvailable)) * 100);
  };


  return (
    <div className="space-y-8 bg-black text-green-500 border-green-500">
      <Card className="bg-black text-green-500 border-green-500">
        <CardHeader>
          <CardTitle>Create Ticket Tier</CardTitle>
          <CardDescription>Add a new ticket tier for your event</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tier">Tier Name</Label>
                <Input
                  id="tier"
                  value={newTier.tier}
                  onChange={(e) => setNewTier({ ...newTier, tier: e.target.value })}
                  className="font-mono bg-black text-green-500 border-green-500"
                />
              </div>
              <div>
                <Label htmlFor="price">Price (USDT)</Label>
                <Input
                  id="price"
                  type="number"
                  value={newTier.price}
                  onChange={(e) => setNewTier({ ...newTier, price: Number(e.target.value) })}
                  className="font-mono bg-black text-green-500 border-green-500"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={newTier.quantity}
                onChange={(e) => setNewTier({ ...newTier, quantity: Number(e.target.value) })}
                className="font-mono bg-black text-green-500 border-green-500"
              />
            </div>
            <div>
              <Label htmlFor="perks">Perks</Label>
              <Textarea
                id="perks"
                value={newTier.perks}
                onChange={(e) => setNewTier({ ...newTier, perks: e.target.value })}
                className="font-mono bg-black text-green-500 border-green-500"
              />
            </div>
            <Button onClick={handleAddTier}>Add Tier</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black text-green-500 border-green-500">
        <CardHeader>
          <CardTitle>Current Ticket Tiers</CardTitle>
          <CardDescription>Manage your existing ticket tiers</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tier</TableHead>
                <TableHead>Price (USDT)</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Perks</TableHead>
                <TableHead>Digiseller Widget</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ticketTiers.map((tier, index) => (
                <TableRow key={index}>
                  <TableCell>{tier.tier}</TableCell>
                  <TableCell>{tier.price} USDT</TableCell>
                  <TableCell>{tier.quantity}</TableCell>
                  <TableCell>{tier.perks}</TableCell>
                  <TableCell>
                    {tier.digiseller_product_id && (
                      <div dangerouslySetInnerHTML={{ __html: getDigisellerWidgetCode(tier.digiseller_product_id) }} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-black text-green-500 border-green-500">
        <CardHeader>
          <CardTitle>Ticket Sales Overview</CardTitle>
          <CardDescription>Current sales progress and revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label>Sales Progress</Label>
            <Progress value={saleProgress} className="mt-2" />
            <p className="text-sm text-gray-500 mt-1">{saleProgress.toFixed(2)}% of tickets sold</p>
          </div>
          <div>
            <Label>Total Revenue (USDT)</Label>
            <p className="text-2xl font-bold">{totalRevenue.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black text-green-500 border-green-500">
        <CardHeader>
          <CardTitle>Ticket Statistics</CardTitle>
          <CardDescription>Overview of ticket sales and availability</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tier</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Sold</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Sale Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((stat, index) => (
                <TableRow key={index}>
                  <TableCell>{stat.tier}</TableCell>
                  <TableCell>{stat.total}</TableCell>
                  <TableCell>{stat.sold}</TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant={stat.available > 0 ? "success" : "destructive"}>
                            {stat.available}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          {stat.available > 0 ? "Tickets still available" : "Sold out"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <Progress value={(stat.sold / stat.total) * 100} className="w-[60px]" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {message && (
        <Alert variant={message.type === 'success' ? "default" : "destructive"}>
          <AlertTitle>{message.type === 'success' ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

