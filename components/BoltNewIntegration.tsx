import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function BoltNewIntegration({ eventSlug, tierName }: { eventSlug: string, tierName: string }) {
  const [boltUrl, setBoltUrl] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async () => {
    try {
      // Here you would typically send the boltUrl to your backend
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage({ type: 'success', text: 'Your bolt.new URL has been submitted successfully!' });
    } catch (error) {
      console.error('Error submitting bolt.new URL:', error);
      setMessage({ type: 'error', text: 'Failed to submit bolt.new URL. Please try again.' });
    }
  };

  return (
    <Card className="bg-black text-green-500 border-green-500">
      <CardHeader>
        <CardTitle>Submit Your bolt.new Project</CardTitle>
        <CardDescription>Share your coding progress with the Matrix</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label htmlFor="boltUrl" className="block text-sm font-medium text-gray-700">bolt.new URL</label>
            <Input
              id="boltUrl"
              type="url"
              placeholder="https://bolt.new/your-project-url"
              value={boltUrl}
              onChange={(e) => setBoltUrl(e.target.value)}
              className="font-mono bg-black text-green-500 border-green-500"
            />
          </div>
          <Button onClick={handleSubmit}>Submit Project</Button>
          {message && (
            <Alert variant={message.type === 'success' ? "default" : "destructive"}>
              <AlertTitle>{message.type === 'success' ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}
          {tierName === 'Matrix Hacker' && (
            <div className="mt-4">
              <h4 className="text-lg font-semibold mb-2">For Matrix Hackers:</h4>
              <p>As a Matrix Hacker, you have the option to create a pull request directly:</p>
              <ol className="list-decimal list-inside mt-2">
                <li>Download your project archive from bolt.new</li>
                <li>Run the following command in your terminal:</li>
                <pre className="font-mono bg-black text-green-500 border-green-500 p-2 rounded mt-2">
                  ./create_pr.sh {eventSlug} {tierName.replace(' ', '-').toLowerCase()}
                </pre>
                <li>Follow the prompts to create your pull request</li>
              </ol>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

