"use client";

import Image from "next/image";
import { TicketTier, Artist } from "@/types/database";

const EventLineup = ({ lineup }: { lineup: Artist[] }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Lineup</h2>
      <div className="space-y-4">
        {lineup.length > 0 ? (
          lineup.map((artist) => (
            <div
              key={artist.id}
              className="bg-gray-800/50 p-4 rounded-lg flex items-center space-x-4"
            >
              <Image
                src={artist.imageUrl}
                alt={artist.name}
                width={60}
                height={60}
                className="rounded-full"
              />
              <div>
                <h3 className="font-semibold">{artist.name}</h3>
                <p className="text-sm text-gray-400">{artist.bio}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No lineup available.</p>
        )}
      </div>
    </div>
  );
};

export { EventLineup };
