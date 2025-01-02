import axios from 'axios';
import { createHash } from 'crypto';
import { supabase } from '@/lib/supabase';

const DIGISELLER_API_URL = 'https://api.digiseller.com/api';
const DIGISELLER_ID = process.env.NEXT_PUBLIC_DIGISELLER_ID || '1235818';
const DIGISELLER_API_KEY = process.env.NEXT_PUBLIC_DIGISELLER_API_KEY || 'F7D347DE67844B1FA84AF775DCE54BD3';

async function getToken() {
  const url = 'https://api.digiseller.com/api/apilogin';
  const timestamp = Math.floor(Date.now() / 1000);
  const sign = createHash('sha256').update(`${DIGISELLER_API_KEY}${timestamp}`).digest('hex');

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

    return response.data.token;
  } catch (error) {
    console.error('Error getting Digiseller token:', error);
    throw error;
  }
}

export async function createDigisellerProduct(productData: any) {
  try {
    const token = await getToken();
    const response = await axios.post(`${DIGISELLER_API_URL}/product/create/uniquefixed?token=${token}`, productData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating Digiseller product:', error);
    throw error;
  }
}

export async function getDigisellerProductStats(productId: string) {
  try {
    const token = await getToken();
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
    return response.data;
  } catch (error) {
    console.error('Error fetching Digiseller product stats:', error);
    throw error;
  }
}

export function getDigisellerWidgetCode(productId: string) {
  return `<script type="text/javascript" src="https://shop.digiseller.ru/xml/shop2.js"></script>
  <div id="digiseller-button-${productId}"></div>
  <script type="text/javascript">
    digiseller.createButton("digiseller-button-${productId}", {
      product_id: "${productId}",
      language: "ru-RU",
      width: 240,
      height: 80
    });
  </script>`;
}

export async function createAndSellTickets(eventSlug: string, tierName: string, price: number, quantity: number, perks: string) {
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

    // Generate tickets in Supabase
    const { data, error } = await supabase.rpc('generate_tickets_for_event', { 
      p_event_slug: eventSlug,
      p_tier_name: tierName,
      p_quantity: quantity
    });

    if (error) throw error;

    // Update the tickets with the Digiseller product ID
    const ticketIds = data.map((ticket: any) => ticket.id);
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ digiseller_product_id: productId })
      .in('id', ticketIds);

    if (updateError) throw updateError;

    return {
      productId: productId,
      ticketIds: ticketIds
    };
  } catch (error) {
    console.error('Error creating and selling tickets:', error);
    throw error;
  }
}

