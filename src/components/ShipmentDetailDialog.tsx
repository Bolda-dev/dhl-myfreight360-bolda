import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Shipment } from "@/data/mockShipments";
import { Check, X } from "lucide-react";

interface ShipmentDetailDialogProps {
  shipment: Shipment | null;
  open: boolean;
  onClose: () => void;
}

const ShipmentDetailDialog = ({ shipment, open, onClose }: ShipmentDetailDialogProps) => {
  if (!shipment) return null;

  const modeLabel = shipment.transportMode === "Ocean" ? "SEA" : shipment.transportMode === "Air" ? "AIR" : "RAIL";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-lg font-semibold">
            {shipment.transportMode} Shipment Tracking
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-4">
          {/* Mode badge + House Bill */}
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-primary text-primary-foreground">
              {modeLabel}
            </span>
            <span className="text-lg font-semibold text-foreground">{shipment.houseBill}</span>
          </div>

          {/* Origin → Destination */}
          <div className="flex items-center gap-2 text-sm text-foreground mb-5">
            <span className="font-medium">{shipment.origin}</span>
            <span className="text-muted-foreground">→</span>
            <span className="font-medium">{shipment.destination}</span>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm mb-6">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Shipper</span>
              <p className="font-medium text-foreground mt-0.5">{shipment.shipper}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Consignee</span>
              <p className="font-medium text-foreground mt-0.5">{shipment.consignee}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Containers</span>
              <p className="font-medium text-foreground mt-0.5">{shipment.containerCount || "—"}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Est. Delivery</span>
              <p className="font-medium text-foreground mt-0.5">{shipment.eta || "—"}</p>
            </div>
          </div>
        </div>

        {/* Status timeline */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between mb-2">
            {shipment.statusSteps.map((step, i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <div className="flex items-center w-full">
                  {i > 0 && (
                    <div className={`h-0.5 flex-1 ${step.completed || step.active ? "bg-success" : "bg-border"}`} />
                  )}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      step.completed
                        ? "bg-success text-success-foreground"
                        : step.active
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent text-muted-foreground"
                    }`}
                  >
                    {step.completed ? <Check className="w-4 h-4" /> : step.active ? <div className="w-2.5 h-2.5 bg-primary-foreground rounded-full" /> : null}
                  </div>
                  {i < shipment.statusSteps.length - 1 && (
                    <div className={`h-0.5 flex-1 ${shipment.statusSteps[i + 1].completed || shipment.statusSteps[i + 1].active ? "bg-success" : "bg-border"}`} />
                  )}
                </div>
                <span className={`text-[11px] mt-1.5 text-center ${step.active ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Containers section */}
        {shipment.containers.length > 0 && (
          <div className="px-6 pb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Containers</h3>
            <div className="space-y-2">
              {shipment.containers.map((c) => (
                <div key={c.id} className="flex items-center justify-between px-4 py-3 border rounded-md bg-card">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">{c.id}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-primary text-primary-foreground">
                      {c.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status history */}
        <div className="px-6 pb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Shipment Status</h3>
          <div className="space-y-3">
            {shipment.statusSteps
              .filter((s) => s.date)
              .map((step, i) => (
                <div key={i} className="flex gap-3 px-4 py-3 border rounded-md bg-card">
                  <div className="mt-1">
                    <div className="w-2 h-2 rounded-full bg-success" />
                  </div>
                  <div className="border-l-2 border-success pl-3">
                    <p className="text-sm font-semibold text-foreground">{step.label}</p>
                    <p className="text-xs text-muted-foreground">{step.date}</p>
                    {step.location && <p className="text-xs text-muted-foreground">{step.location}</p>}
                    {step.description && <p className="text-xs text-muted-foreground mt-1">{step.description}</p>}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShipmentDetailDialog;
