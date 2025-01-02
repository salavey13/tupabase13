import axios from 'axios';
import { supabase } from './supabase';
import { TicketTier } from '@/types/database';

const DIGISELLER_API_URL = 'https://api.digiseller.com/api';
const DIGISELLER_ID = process.env.NEXT_PUBLIC_DIGISELLER_ID || '1235818';
const DIGISELLER_API_KEY = process.env.NEXT_PUBLIC_DIGISELLER_API_KEY || 'F7D347DE67844B1FA84AF775DCE54BD3';

async function getToken() {
  const url = 'https://api.digiseller.com/api/apilogin';
  const timestamp = Math.floor(Date.now() / 1000);

  console.log('DigisellerAPI: Generating token with timestamp:', timestamp);

  // Use Web Crypto API for hashing
  const encoder = new TextEncoder();
  const data = encoder.encode(`${DIGISELLER_API_KEY}${timestamp}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const sign = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  console.log('DigisellerAPI: Generated sign:', sign);

  try {
    const response = await axios.post(url, {
      seller_id: DIGISELLER_ID,
      timestamp: timestamp,
      sign: sign
    }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    console.log('DigisellerAPI: Token response:', response.data);
    return response.data.token;
  } catch (error) {
    console.error('DigisellerAPI: Error getting Digiseller token:', error);
    throw error;
  }
}

export async function createDigisellerProduct(productData: any) {
  try {
    const token = await getToken();
    console.log('DigisellerAPI: Creating Digiseller product with token:', token);
    const response = await axios.post(`${DIGISELLER_API_URL}/product/create/uniquefixed?token=${token}`, productData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    console.log('DigisellerAPI: Digiseller product created:', response.data);
    return response.data;
  } catch (error) {
    console.error('DigisellerAPI: Error creating Digiseller product:', error);
    throw error;
  }
}

export async function getDigisellerProductStats(productId: string) {
  try {
    const token = await getToken();
    console.log('DigisellerAPI: Fetching Digiseller product stats for product:', productId);
    const response = await axios.post(`${DIGISELLER_API_URL}/seller-sells/v2?token=${token}`, {
      product_ids: [productId],
      date_start: "2000-01-01 00:00:00",
      date_finish: new Date().toISOString().split('T')[0] + " 23:59:59",
      returned: 0,
      page: 1,
      rows: 1000
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    console.log('DigisellerAPI: Digiseller product stats:', response.data);
    return response.data;
  } catch (error) {
    console.error('DigisellerAPI: Error fetching Digiseller product stats:', error);
    throw error;
  }
}

export async function removeDigisellerProduct(productId: string) {
  try {
    const token = await getToken();
    console.log('DigisellerAPI: Removing Digiseller product:', productId);
    const response = await axios.post(`${DIGISELLER_API_URL}/product/delete?token=${token}`, {
      product_id: productId
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    console.log('DigisellerAPI: Digiseller product removed:', response.data);
    return response.data;
  } catch (error) {
    console.error('DigisellerAPI: Error removing Digiseller product:', error);
    throw error;
  }
}

export async function createAndSellTickets(eventSlug: string, tierName: string, price: number, quantity: number, perks: string) {
  console.log('DigisellerAPI: Creating and selling tickets for event:', eventSlug);
  try {
    // Create the product on Digiseller
    const productData = {
      content_type: "text",
      name: [
        { locale: "ru-RU", value: `${eventSlug} - ${tierName}` },
        { locale: "en-US", value: `${eventSlug} - ${tierName}` }
      ],
      price: {
        price: price,
        currency: "USDT"
      },
      description: [
        { locale: "ru-RU", value: perks },
        { locale: "en-US", value: perks }
      ],
      guarantee: {
        enabled: true,
        value: 24 // 24 hours guarantee
      }
    };

    const digisellerProduct = await createDigisellerProduct(productData);
    const productId = digisellerProduct.content.product_id;
    console.log('DigisellerAPI: Digiseller product created with ID:', productId);

    // Generate tickets in Supabase
    console.log('DigisellerAPI: Generating tickets in Supabase');
    const { data, error } = await supabase.rpc('generate_tickets_for_event', { 
      p_event_slug: eventSlug,
      p_tier_name: tierName,
      p_quantity: quantity
    });

    if (error) throw error;

    // Update the tickets with the Digiseller product ID
    const ticketIds = data.map((ticket: any) => ticket.id);
    console.log('DigisellerAPI: Updating tickets with Digiseller product ID');
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ digiseller_product_id: productId })
      .in('id', ticketIds);

    if (updateError) throw updateError;

    console.log('DigisellerAPI: Tickets created and updated successfully');
    return {
      productId: productId,
      ticketIds: ticketIds
    };
  } catch (error) {
    console.error('DigisellerAPI: Error creating and selling tickets:', error);
    throw error;
  }
}

export async function syncTicketTiers(eventSlug: string) {
  console.log('DigisellerAPI: Syncing ticket tiers for event:', eventSlug);
  try {
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('ticket_tiers')
      .eq('slug', eventSlug)
      .single();

    if (eventError) throw eventError;

    const { data: tierData, error: tierError } = await supabase
      .from('ticket_tiers')
      .select('*')
      .eq('event_slug', eventSlug);

    if (tierError) throw tierError;

    console.log('DigisellerAPI: Event data:', eventData);
    console.log('DigisellerAPI: Tier data:', tierData);

    // Update ticket_tiers table based on events table
    for (const eventTier of eventData.ticket_tiers) {
      const existingTier = tierData.find(t => t.tier === eventTier.tier);
      if (existingTier) {
        // Update existing tier
        await supabase
          .from('ticket_tiers')
          .update({
            price: eventTier.price,
            quantity: eventTier.quantity,
            perks: eventTier.perks
          })
          .eq('event_slug', eventSlug)
          .eq('tier', eventTier.tier);
      } else {
        // Insert new tier
        await supabase
          .from('ticket_tiers')
          .insert({
            event_slug: eventSlug,
            tier: eventTier.tier,
            price: eventTier.price,
            quantity: eventTier.quantity,
            perks: eventTier.perks
          });
      }
    }

    // Remove tiers from ticket_tiers that are not in events table
    const tiersToRemove = tierData.filter(t => !eventData.ticket_tiers.some((et: { tier: TicketTier; }) => et.tier === t.tier));
    for (const tierToRemove of tiersToRemove) {
      await supabase
        .from('ticket_tiers')
        .delete()
        .eq('event_slug', eventSlug)
        .eq('tier', tierToRemove.tier);
    }

    console.log('DigisellerAPI: Ticket tiers synced successfully');
  } catch (error) {
    console.error('DigisellerAPI: Error syncing ticket tiers:', error);
    throw error;
  }
}

