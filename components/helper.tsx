import { useState } from 'react';
import { createDigisellerProduct, getDigisellerProductStats, createAndSellTickets } from '@/utils/digisellerApi';
import { supabase } from '@/utils/supabase';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function HelperPage() {
  const [productData, setProductData] = useState({
    name: '',
    price: 0,
    description: ''
  });
  const [productId, setProductId] = useState('');
  const [eventSlug, setEventSlug] = useState('');
  const [tierName, setTierName] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateProduct = async () => {
    try {
      const response = await createDigisellerProduct({
        content_type: "text",
        name: [
          { locale: "ru-RU", value: productData.name },
          { locale: "en-US", value: productData.name }
        ],
        price: {
          price: productData.price,
          currency: "USDT"
        },
        description: [
          { locale: "ru-RU", value: productData.description },
          { locale: "en-US", value: productData.description }
        ]
      });
      setResult(response);
      setError(null);
    } catch (err) {
      setError('Error creating product: ' + (err as Error).message);
      setResult(null);
    }
  };

  const handleGetStats = async () => {
    try {
      const response = await getDigisellerProductStats(productId);
      setResult(response);
      setError(null);
    } catch (err) {
      setError('Error getting product stats: ' + (err as Error).message);
      setResult(null);
    }
  };

  const handleCreateAndSellTickets = async () => {
    try {
      const response = await createAndSellTickets(eventSlug, tierName, productData.price, quantity, productData.description);
      setResult(response);
      setError(null);
    } catch (err) {
      setError('Error creating and selling tickets: ' + (err as Error).message);
      setResult(null);
    }
  };

  const handleTestSupabase = async () => {
    try {
      const { data, error } = await supabase.from('events').select('*').limit(1);
      if (error) throw error;
      setResult(data);
      setError(null);
    } catch (err) {
      setError('Error testing Supabase connection: ' + (err as Error).message);
      setResult(null);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Helper Tools</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create Digiseller Product</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="productName">Product Name</Label>
              <Input
                id="productName"
                value={productData.name}
                onChange={(e) => setProductData({ ...productData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="productPrice">Price (USDT)</Label>
              <Input
                id="productPrice"
                type="number"
                value={productData.price}
                onChange={(e) => setProductData({ ...productData, price: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="productDescription">Description</Label>
              <Textarea
                id="productDescription"
                value={productData.description}
                onChange={(e) => setProductData({ ...productData, description: e.target.value })}
              />
            </div>
            <Button onClick={handleCreateProduct}>Create Product</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Get Digiseller Product Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="productId">Product ID</Label>
              <Input
                id="productId"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
              />
            </div>
            <Button onClick={handleGetStats}>Get Stats</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create and Sell Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="eventSlug">Event Slug</Label>
              <Input
                id="eventSlug"
                value={eventSlug}
                onChange={(e) => setEventSlug(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tierName">Tier Name</Label>
              <Input
                id="tierName"
                value={tierName}
                onChange={(e) => setTierName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
            <Button onClick={handleCreateAndSellTickets}>Create and Sell Tickets</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Test Supabase Connection</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleTestSupabase}>Test Supabase</Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

