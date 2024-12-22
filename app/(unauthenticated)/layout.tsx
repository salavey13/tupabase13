"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/contexts/app-context';
import { Navigation } from '@/components/Navigation';

export default function UnauthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { state } = useApp();

  useEffect(() => {
    if (state.user) {
      router.push('/events');
    }
  }, [state.user, router]);

  return <main>{children}</main>;
}