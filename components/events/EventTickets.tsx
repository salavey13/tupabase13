"use client";

import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TicketTier } from "@/types/database";

interface EventTicketsProps {
  ticketsRemaining: number;
  ticketTiers: TicketTier[];
  onPurchase: () => void;
}

export function EventTickets({ 
  ticketsRemaining, 
  ticketTiers, 
  onPurchase 
}: EventTicketsProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Tickets</h2>
      <div className="bg-gray-800/50 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-purple-400" />
            <span className="text-sm text-gray-400">
              {ticketsRemaining} tickets remaining
            </span>
          </div>
        </div>
        <div className="space-y-4">
          {ticketTiers.length > 0 ? (
            ticketTiers.map((tier) => (
              <div
                key={tier.id}
                className="border border-gray-700 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{tier.name}</h3>
                    <p className="text-sm text-gray-400">
                      {tier.description}
                    </p>
                  </div>
                  <p className="text-xl font-bold">${tier.price}</p>
                </div>
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={onPurchase}
                >
                  Buy Now
                </Button>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No ticket tiers available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
