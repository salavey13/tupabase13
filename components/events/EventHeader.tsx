"use client";

import Image from "next/image";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatEventDate } from "@/lib/utils/date";

interface EventHeaderProps {
  title: string;
  date: string;
  imageUrl: string;
}

export function EventHeader({ title, date, imageUrl }: EventHeaderProps) {
  const formattedDate = formatEventDate(date);

  return (
    <div className="relative h-[60vh]">
      <Image
        src={imageUrl}
        alt={title}
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-90" />
      
      <div className="absolute bottom-16 left-0 right-0 p-8">
        <div className="max-w-7xl mx-auto flex justify-between items-start">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">{title}</h1>
            <p className="text-xl text-purple-400">{formattedDate}</p>
          </div>
          <Button
            variant="default"
            className="bg-gray-800 hover:bg-gray-700"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}