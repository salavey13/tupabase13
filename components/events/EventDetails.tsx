"use client";

import { Calendar, Clock, MapPin } from "lucide-react";
import { formatEventDate } from "@/lib/utils/date";

interface EventDetailsProps {
  date: string;
  startTime: string;
  endTime: string;
  venue: {
    name: string;
    address?: string;
  };
}

export function EventDetails({ date, startTime, endTime, venue }: EventDetailsProps) {
  const formattedDate = formatEventDate(date);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
      <div className="flex items-center space-x-3 bg-gray-800/50 p-4 rounded-lg">
        <Calendar className="h-6 w-6 text-purple-400" />
        <div>
          <p className="text-sm text-gray-400">Date</p>
          <p className="font-semibold">{formattedDate}</p>
        </div>
      </div>
      <div className="flex items-center space-x-3 bg-gray-800/50 p-4 rounded-lg">
        <Clock className="h-6 w-6 text-purple-400" />
        <div>
          <p className="text-sm text-gray-400">Time</p>
          <p className="font-semibold">
            {startTime} - {endTime}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-3 bg-gray-800/50 p-4 rounded-lg">
        <MapPin className="h-6 w-6 text-purple-400" />
        <div>
          <p className="text-sm text-gray-400">Location</p>
          <p className="font-semibold">{venue.name}</p>
          <p className="text-sm text-gray-400">{venue.address}</p>
        </div>
      </div>
    </div>
  );
}