"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTelegram } from '@/lib/hooks/useTelegram';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const { isInTelegramContext } = useTelegram();
  const router = useRouter();

  const handleLogin = () => {
    if (isInTelegramContext) {
      router.push('/events');
    } else {
      window.location.href = 'https://t.me/oneSitePlsBot/events';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-black">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Login with Telegram</CardTitle>
          <CardDescription className="text-gray-400">
            {isInTelegramContext
              ? "You're using the Telegram Web App. Click below to log in."
              : "Please open this app in Telegram to log in."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleLogin}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isInTelegramContext ? "Log In" : "Open in Telegram"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}