import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { Shipment } from "@/data/mockShipments";
import { Check, X } from "lucide-react";

interface Props {
  shipment: Shipment | null;
  open: boolean;
  onClose: () => void;
}

const ShipmentDetailSidebar = ({ shipment, open, onClose }: Props) => {
  if (!shipment) return null;

  const modeLabel = shipment.transportMode === "Ocean" ? "SEA" : shipment.transportMode === "Air" ? "AIR" : "RAIL";

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-[420px] sm:max-w-[420px] p-0 overflow-y-auto">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="text-lg font-semibold">
            {shipment.transportMode} Shipment
          </SheetTitle>
        </SheetHeader>

        <div className="p-6 space-y-6">
          {/* Mode badge + House Bill */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-primary text-primary-foreground">
              {modeLabel}
            </span>
            <span className="text-lg font-semibold text-foreground">{shipment.houseBill}</span>
          </div>

          {/* Origin → Destination */}
          <div className="flex items-center gap-2 text-sm text-foreground">
            <span className="font-medium">{shipment.origin}</span>
            <span className="text-muted-foreground">→</span>
            <span className="font-medium">{shipment.destination}</span>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">File No.</span>
              <p className="font-medium text-foreground mt-0.5">{shipment.fileNumber}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Client Ref.</span>
              <p className="font-medium text-foreground mt-0.5">{shipment.clientRef}</p>
            </div>
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
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Last Event</span>
              <p className="font-medium text-foreground mt-0.5">{shipment.lastEvent}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">ETD</span>
              <p className="font-medium text-foreground mt-0.5">{shipment.etd}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">ETA</span>
              <p className="font-medium text-foreground mt-0.5">{shipment.eta}</p>
            </div>
          </div>

          {/* Status timeline */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Progress</h3>
            <div className="flex items-center justify-between">
              {shipment.statusSteps.map((step, i) => (
                <div key={i} className="flex flex-col items-center flex-1">
                  <div className="flex items-center w-full">
                    {i > 0 && (
                      <div className={`h-0.5 flex-1 ${step.completed || step.active ? "bg-success" : "bg-border"}`} />
                    )}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        step.completed
                          ? "bg-success text-success-foreground"
                          : step.active
                          ? "bg-primary text-primary-foreground"
                          : "bg-accent text-muted-foreground"
                      }`}
                    >
                      {step.completed ? <Check className="w-3.5 h-3.5" /> : step.active ? <div className="w-2 h-2 bg-primary-foreground rounded-full" /> : null}
                    </div>
                    {i < shipment.statusSteps.length - 1 && (
                      <div className={`h-0.5 flex-1 ${shipment.statusSteps[i + 1].completed || shipment.statusSteps[i + 1].active ? "bg-success" : "bg-border"}`} />
                    )}
                  </div>
                  <span className={`text-[10px] mt-1 text-center ${step.active ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Containers */}
          {shipment.containers.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Containers</h3>
              <div className="space-y-1.5">
                {shipment.containers.map((c) => (
                  <div key={c.id} className="flex items-center justify-between px-3 py-2 border rounded-md bg-card text-sm">
                    <span className="font-medium text-foreground">{c.id}</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-primary text-primary-foreground">{c.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status history */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Status History</h3>
            <div className="space-y-2">
              {shipment.statusSteps
                .filter((s) => s.date)
                .map((step, i) => (
                  <div key={i} className="flex gap-3 px-3 py-2 border rounded-md bg-card">
                    <div className="mt-1.5">
                      <div className="w-2 h-2 rounded-full bg-success" />
                    </div>
                    <div className="border-l-2 border-success pl-3">
                      <p className="text-sm font-semibold text-foreground">{step.label}</p>
                      <p className="text-xs text-muted-foreground">{step.date}</p>
                      {step.location && <p className="text-xs text-muted-foreground">{step.location}</p>}
                      {step.description && <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ShipmentDetailSidebar;
