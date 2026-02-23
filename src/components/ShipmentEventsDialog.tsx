import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Shipment } from "@/data/mockShipments";
import { Check, Circle, MapPin, Clock } from "lucide-react";

interface ShipmentEventsDialogProps {
  shipment: Shipment | null;
  open: boolean;
  onClose: () => void;
}

const typeLabels: Record<string, string> = {
  PICKUP: "PICKUP",
  DEPARTURE: "DEPARTURE",
  ARRIVAL: "ARRIVAL",
  CUSTOMS: "CUSTOMS",
  DELIVERY: "DELIVERY",
  IN_TRANSIT: "IN TRANSIT",
};

const ShipmentEventsDialog = ({ shipment, open, onClose }: ShipmentEventsDialogProps) => {
  if (!shipment) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-lg font-semibold">
            Shipment Events for {shipment.houseBill}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 max-h-[60vh] overflow-y-auto">
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-primary/20" />

            <div className="space-y-4">
              {shipment.events.map((event, i) => (
                <div key={i} className="relative flex gap-4">
                  {/* Timeline dot */}
                  <div className="relative z-10 shrink-0 mt-1">
                    {event.completed ? (
                      <div className="w-[30px] h-[30px] rounded-full bg-success flex items-center justify-center">
                        <Check className="w-4 h-4 text-success-foreground" />
                      </div>
                    ) : (
                      <div className="w-[30px] h-[30px] rounded-full bg-accent flex items-center justify-center">
                        <Circle className="w-3 h-3 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Event card */}
                  <div className="flex-1 border rounded-lg overflow-hidden bg-card">
                    {/* Header bar */}
                    <div className="bg-primary px-4 py-2.5 flex items-center gap-2">
                      <span className="text-sm font-semibold text-primary-foreground">{event.title}</span>
                      <span className="text-[10px] font-semibold text-primary-foreground/80 bg-primary-foreground/15 px-2 py-0.5 rounded">
                        {typeLabels[event.type] || event.type}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="px-4 py-3">
                      <p className="text-sm text-foreground">{event.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-destructive" />
                          {event.location}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {event.date}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShipmentEventsDialog;
