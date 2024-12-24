"use client";

import { useState, useEffect } from "react";
import { AuthenticatedEvent } from "@/types/event";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApp } from "@/lib/contexts/app-context";
import { purchaseTicket, validateTicketPurchase } from "@/lib/utils/tickets";
import { TicketTier } from "@/types/database";
import { toast } from "sonner";
import { DbEvent } from "@/types/event";
import { PublicEvent } from "@/types/event";

interface TicketPurchaseDialogProps {
  event: PublicEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TicketPurchaseDialog({
  event,
  open,
  onOpenChange,
}: TicketPurchaseDialogProps) {
  const { state } = useApp();
  // Filter valid ticket tiers
  const validTiers: TicketTier[] = Array.isArray(event.ticket_tiers)
    ? event.ticket_tiers.filter(
        (tier): tier is TicketTier =>
          tier !== null &&
          typeof tier === "object" &&
          "id" in tier &&
          "name" in tier &&
          "price" in tier &&
          "description" in tier &&
          "availability" in tier
      )
    : [];
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(
    validTiers.length > 0 ? validTiers[0] : null
  );
  const [purchasing, setPurchasing] = useState(false);

  async function handlePurchase() {
    if (!state.user) {
      toast.error("Please log in to purchase tickets");
      return;
    }

    
    if (!selectedTier) {
      toast.error("Please select ticket tier");
      return;
    }

    setPurchasing(true);
    try {
      const isValid = await validateTicketPurchase(
        event.slug,
        state.user.telegram_id.toString()
      );

      if (!isValid) {
        toast.error("You already have a ticket for this event");
        return;
      }

      await purchaseTicket(
        event.slug,
        selectedTier.id,
        state.user.telegram_id.toString()
      );

      toast.success("Ticket purchased successfully!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to purchase ticket");
      console.error('Error purchasing ticket:', error);
    } finally {
      setPurchasing(false);
    }
  }

  useEffect(() => {
    // Update selected tier if the list of valid tiers changes
    if (!selectedTier && validTiers.length > 0) {
      setSelectedTier(validTiers[0]);
    }
  }, [validTiers, selectedTier]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 text-white">
        <DialogHeader>
          <DialogTitle>Purchase Ticket</DialogTitle>
          <DialogDescription className="text-gray-400">
            You are about to purchase a ticket for {event.title}
          </DialogDescription>
        </DialogHeader>

        {selectedTier &&
          <div className="space-y-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">{selectedTier.name}</h3>
              <p className="text-sm text-gray-400 mb-2">{selectedTier.description}</p>
              <p className="text-xl font-bold">${selectedTier.price}</p>
            </div>
          </div>
        }

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-gray-800 hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePurchase}
            disabled={purchasing}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {purchasing ? "Processing..." : "Confirm Purchase"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
