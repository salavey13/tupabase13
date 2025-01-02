"use client";

import { useEffect } from 'react';
import { useApp } from '@/lib/contexts/app-context';
import { EventSlider } from '@/components/EventSlider';
import { CenteredLoading } from '@/components/Navigation';

export default function EventsPage() {
  const { state } = useApp();

  if (!state.user) {
    return <CenteredLoading />;
  }

  return <EventSlider />;
}