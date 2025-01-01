"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarDays, PlusCircle } from "lucide-react";
import { Loader2 } from 'lucide-react';

export function CenteredLoading() {
  return (
    <div className="flex justify-center items-center h-screen w-full">
      <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
    </div>
  );
}

export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-white text-xl font-bold">
            Psytrance Events
          </Link>
          <div className="flex space-x-4">
            <Link href="/events">
              <Button variant="ghost" className="text-white hover:text-purple-400">
                <CalendarDays className="h-5 w-5 mr-2" />
                Events
              </Button>
            </Link>
            <Link href="/admin/events/new">
              <Button variant="ghost" className="text-white hover:text-purple-400">
                <PlusCircle className="h-5 w-5 mr-2" />
                Create Event
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}