import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function CollaborativeCoding({ eventSlug }: { eventSlug: string }) {
  const [code, setCode] = useState('');
  const [collaborators, setCollaborators] = useState(['Neo', 'Trinity', 'Morpheus']);
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    // Simulating real-time updates
    const interval = setInterval(() => {
      const newCollaborator = ['Agent Smith', 'Oracle', 'Cypher'][Math.floor(Math.random() * 3)];
      if (!collaborators.includes(newCollaborator)) {
        setCollaborators([...collaborators, newCollaborator]);
      }
      setMessages([...messages, `${newCollaborator} has joined the session.`]);
    }, 10000);

    return () => clearInterval(interval);
  }, [collaborators, messages]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    // Here you would typically sync the code with other collaborators
  };

  const handleSubmit = () => {
    // Here you would typically submit the collaborative code
    setMessages([...messages, 'Code submitted successfully!']);
  };

  return (
    <Card className="bg-black text-green-500 border-green-500">
      <CardHeader>
        <CardTitle>Collaborative Hacking Session</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold mb-2">Active Hackers:</h4>
            <div className="flex flex-wrap gap-2">
              {collaborators.map((collaborator, index) => (
                <span key={index} className="px-2 py-1 bg-green-900 rounded-full text-sm">{collaborator}</span>
              ))}
            </div>
          </div>
          <Textarea
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            rows={15}
            className="font-mono bg-black text-green-500 border-green-500"
            placeholder="Start coding here..."
          />
          <Button onClick={handleSubmit} className="bg-green-700 hover:bg-green-600">Submit Collaborative Code</Button>
          <div className="mt-4">
            <h4 className="text-lg font-semibold mb-2">Session Log:</h4>
            <div className="h-40 overflow-y-auto bg-green-900 p-2 rounded">
              {messages.map((message, index) => (
                <p key={index} className="text-sm">{message}</p>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

