"use client";

import { EventForm } from "@/components/EventForm";
import { Suspense } from "react";

export default function CreateEventPage() {
  return  (
    <Suspense fallback={<div>Loading...</div>}>
      <EventForm />;
    </Suspense>
  );
}