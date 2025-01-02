import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

const challenges = [
  {
    code: `function decodeMatrix(code) {\n  return code.split('').reverse().join('');\n}`,
    bug: 'This function decodes Matrix code. Can you modify it to encode instead?',
    solution: `function encodeMatrix(code) {\n  return code.split('').reverse().join('');\n}`,
    hint: 'Think about reversing the process.',
  },
  {
    code: `function hackFirewall(attempts) {\n  return attempts > 3;\n}`,
    bug: 'This function checks if a firewall has been hacked. It should return true if attempts are 3 or less. Can you fix it?',
    solution: `function hackFirewall(attempts) {\n  return attempts <= 3;\n}`,
    hint: 'Consider the condition for a successful hack.',
  },
  // Add more challenges here
];

export function GameifiedDebugger({ eventSlug }: { eventSlug: string }) {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [userCode, setUserCode] = useState(challenges[currentChallenge].code);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes per challenge

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentChallenge]);

  const handleSubmit = () => {
    if (userCode.trim() === challenges[currentChallenge].solution.trim()) {
      const newScore = score + Math.max(0, timeLeft);
      setScore(newScore);
      setMessage({ type: 'success', text: 'Great job, Neo! You\'ve cracked the code.' });
      if (currentChallenge < challenges.length - 1) {
        setTimeout(() => {
          setCurrentChallenge(currentChallenge + 1);
          setUserCode(challenges[currentChallenge + 1].code);
          setMessage(null);
          setShowHint(false);
          setTimeLeft(300);
        }, 2000);
      } else {
        setMessage({ type: 'success', text: 'Congratulations! You\'ve completed all challenges. The Matrix has been reset.' });
      }
    } else {
      setMessage({ type: 'error', text: 'Not quite right. The Agents are closing in. Try again!' });
    }
  };

  return (
    <div className="space-y-4 p-4 bg-black text-green-500 rounded-lg border border-green-500">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold">Matrix Challenge {currentChallenge + 1}</h4>
        <Badge variant="default" className="text-green-500">Score: {score}</Badge>
      </div>
      <Progress value={(timeLeft / 300) * 100} className="h-2 bg-green-900" />
      <p className="text-sm">Time left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</p>
      <p>{challenges[currentChallenge].bug}</p>
      <Textarea
        value={userCode}
        onChange={(e) => setUserCode(e.target.value)}
        rows={10}
        className="font-mono bg-black text-green-500 border-green-500"
      />
      <div className="flex justify-between">
        <Button onClick={handleSubmit} className="bg-green-700 hover:bg-green-600">Submit Solution</Button>
        <Button onClick={() => setShowHint(!showHint)} variant="default" className="text-green-500 border-green-500">
          {showHint ? 'Hide Hint' : 'Show Hint'}
        </Button>
      </div>
      {showHint && (
        <Alert variant="default" className="bg-green-900 border-green-500">
          <AlertTitle>Hint</AlertTitle>
          <AlertDescription>{challenges[currentChallenge].hint}</AlertDescription>
        </Alert>
      )}
      {message && (
        <Alert variant={message.type === 'success' ? "default" : "destructive"} className={message.type === 'success' ? "bg-green-900 border-green-500" : "bg-red-900 border-red-500"}>
          <AlertTitle>{message.type === 'success' ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

