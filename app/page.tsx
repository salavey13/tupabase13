"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/contexts/app-context';
import MatrixPortal from '@/components/matrix-portal';

export default function HomePage() {
  const router = useRouter();
  const { state } = useApp();
  const username = "SALAVEY13";//"Лёха"; // Replace with actual username logic

  useEffect(() => {
    // Redirect based on authentication status
    /*if (state.user) {
      router.push('/events');
    } else {
      router.push('/login');
    }*/
  }, [state.user, router]);

  return(
    <MatrixPortal username={username} />
  );
}