import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Shipment } from "@/data/mockShipments";
import { CITY_CODES, COUNTRY_CODES } from "@/data/mockShipments";
import { Check, Clock, AlertTriangle, Plane, Ship, Truck, MapPin, FileText, Tag, MessageSquare, Container, X, ArrowRight, Anchor } from "lucide-react";
import ContainersTab from "./ContainersTab";

interface Props {
  shipment: Shipment | null;
  open: boolean;
  onClose: () => void;
}

const modeIcon: Record<string, React.ReactNode> = {
  Air: <Plane className="w-4 h-4" />,
  Ocean: <Ship className="w-4 h-4" />,
  Rail: <Truck className="w-4 h-4" />,
};

const formatDate = (d: string | null | undefined): string => {
  if (!d) return "—";
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return d.split(" ")[0];
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const isDateLate = (estimated: string | null | undefined, actual: string | null | undefined): boolean | null => {
  if (!estimated || !actual) return null;
  return new Date(actual) > new Date(estimated);
};

const ShipmentDetailPopup = ({ shipment, open, onClose }: Props) => {
  if (!shipment) return null;

  const s = shipment;
  const oCode = CITY_CODES[s.origin] || s.origin.slice(0, 3);
  const dCode = CITY_CODES[s.destination] || s.destination.slice(0, 3);
  const oCountry = COUNTRY_CODES[s.origin] || "";
  const dCountry = COUNTRY_CODES[s.destination] || "";
  const steps = s.statusSteps.slice(1);
  const MILESTONE_LABELS = ["PKP", "DPT", "ARR", "POD"];
  const MILESTONE_FULL = ["Pickup", "Departed", "Arrived", "Delivered"];

  // --- Trip legs (mock generation per shipment) ---
  const isOcean = s.transportMode === "Ocean";
  const isAir = s.transportMode === "Air";
  const tripTabLabel = isOcean ? "Voyage" : "Flights";
  const tripTabValue = isOcean ? "voyage" : "flights";
  const legNoun = isOcean ? "Voyage" : "Flight";

  // Hash for deterministic mock data based on shipment id
  const hash = Array.from(s.id || s.houseBill).reduce((a, c) => a + c.charCodeAt(0), 0);
  const legCount = isOcean ? (hash % 2 === 0 ? 1 : 2) : (hash % 3 === 0 ? 3 : hash % 2 === 0 ? 2 : 1);

  const transshipmentHubs = isOcean
    ? ["Singapore", "Rotterdam", "Hamburg", "Algeciras", "Colombo", "Jebel Ali"]
    : ["Frankfurt", "Dubai", "Hong Kong", "Doha", "Istanbul", "Amsterdam"];
  const carriers = isOcean
    ? ["Maersk", "MSC", "CMA CGM", "Hapag-Lloyd", "ONE", "Evergreen"]
    : ["Lufthansa Cargo", "Emirates SkyCargo", "Cathay Pacific Cargo", "Qatar Airways Cargo", "Turkish Cargo", "KLM Cargo"];
  const vesselNames = isOcean
    ? ["MV Ever Given", "MV Madrid Maersk", "MV MSC Oscar", "MV CMA CGM Marco Polo", "MV Hapag Berlin"]
    : ["LH8401", "EK9872", "CX2031", "QR8120", "TK6493", "KL6831"];

  const buildLegs = () => {
    const legs = [];
    let prevLocation = s.origin;
    let prevCode = oCode;
    let prevCountry = oCountry;

    const baseEtd = s.etd ? new Date(s.etd) : new Date();
    const baseEta = s.eta ? new Date(s.eta) : new Date(baseEtd.getTime() + 1000 * 60 * 60 * 24 * 14);
    const totalMs = baseEta.getTime() - baseEtd.getTime();
    const segmentMs = totalMs / legCount;

    for (let i = 0; i < legCount; i++) {
      const isLast = i === legCount - 1;
      const nextLocation = isLast ? s.destination : transshipmentHubs[(hash + i) % transshipmentHubs.length];
      const nextCode = isLast ? dCode : nextLocation.slice(0, 3).toUpperCase();
      const nextCountry = isLast ? dCountry : "";
      const carrier = carriers[(hash + i) % carriers.length];
      const vessel = vesselNames[(hash + i + (isOcean ? 1 : 0)) % vesselNames.length];
      const ref = isOcean
        ? `V${(2401 + (hash % 50) + i)}E`
        : `${vessel}/${baseEtd.getDate()}${["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"][baseEtd.getMonth()]}`;

      const legEtd = new Date(baseEtd.getTime() + i * segmentMs);
      const legEta = new Date(baseEtd.getTime() + (i + 1) * segmentMs);
      const now = Date.now();
      const status: "completed" | "in_transit" | "scheduled" =
        legEta.getTime() < now ? "completed" : legEtd.getTime() < now ? "in_transit" : "scheduled";

      legs.push({
        index: i + 1,
        from: prevLocation,
        fromCode: prevCode,
        fromCountry: prevCountry,
        to: nextLocation,
        toCode: nextCode,
        toCountry: nextCountry,
        carrier,
        vessel,
        ref,
        etd: legEtd.toISOString(),
        eta: legEta.toISOString(),
        status,
        isLast,
      });
      prevLocation = nextLocation;
      prevCode = nextCode;
      prevCountry = nextCountry;
    }
    return legs;
  };

  const legs = buildLegs();

  // Exceptions from milestones
  const exceptions = steps.filter(step => step.exception).map((step, i) => ({
    milestone: step.label,
    ...step.exception!,
  }));

  const depLate = isDateLate(s.etd, s.atd);
  const arrLate = isDateLate(s.eta, s.ata);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[800px] w-[95vw] p-0 gap-0 overflow-hidden h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-card shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-primary text-primary-foreground">
                {modeIcon[s.transportMode]}
                {s.transportMode === "Rail" ? "Road" : s.transportMode === "Ocean" ? "Sea" : s.transportMode}
              </span>
              <span className="text-lg font-bold text-foreground">{s.houseBill}</span>
              <span className="text-sm text-muted-foreground">{s.masterBill}</span>
            </div>
          </div>
          {/* Route */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="text-center">
                <div className="font-bold text-foreground">{oCode}</div>
                <div className="text-[10px] text-muted-foreground">{oCountry}</div>
              </div>
              <span className="text-muted-foreground text-lg">→</span>
              <div className="text-center">
                <div className="font-bold text-foreground">{dCode}</div>
                <div className="text-[10px] text-muted-foreground">{dCountry}</div>
              </div>
            </div>
            <div className="ml-auto text-xs text-muted-foreground">
              Opened: {formatDate(s.opened)}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="general" className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-6 h-auto py-0 gap-0 shrink-0">
            {[
              { value: "general", label: "General", icon: null },
              {
                value: tripTabValue,
                label: tripTabLabel,
                icon: isOcean ? <Ship className="w-3.5 h-3.5" /> : <Plane className="w-3.5 h-3.5" />,
                count: legs.length,
              },
              { value: "events", label: "Events", icon: null, count: s.events.length },
              { value: "invoices", label: "Invoices", icon: <FileText className="w-3.5 h-3.5" />, count: s.invoiceCount },
              { value: "containers", label: "Containers", icon: <Container className="w-3.5 h-3.5" />, count: s.containerCount },
              { value: "tags", label: "Tags", icon: <Tag className="w-3.5 h-3.5" />, count: s.tags.length },
              { value: "remarks", label: "Remarks", icon: <MessageSquare className="w-3.5 h-3.5" />, count: s.remarks.length },
            ].map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-xs font-medium gap-1.5"
              >
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-1 text-[10px] bg-muted px-1.5 py-0.5 rounded-full font-semibold">{tab.count}</span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="overflow-y-auto flex-1">
            {/* General Tab */}
            <TabsContent value="general" className="p-6 m-0 space-y-6">
              {/* Exceptions banner */}
              {exceptions.length > 0 && (
                <div className="space-y-2">
                  {exceptions.map((exc, i) => (
                    <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${exc.severity === "critical" ? "bg-destructive/5 border-destructive/20" : "bg-warning/5 border-warning/20"}`}>
                      <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${exc.severity === "critical" ? "text-destructive" : "text-warning"}`} />
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-semibold ${exc.severity === "critical" ? "text-destructive" : "text-warning"}`}>{exc.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{exc.description}</div>
                        <div className="text-[10px] text-muted-foreground/70 mt-1">{exc.milestone} • {exc.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Milestone progress */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Milestones</h3>
                <div className="flex items-center justify-between relative px-2">
                  {/* Background line */}
                  <div className="absolute left-[calc(10%+10px)] right-[calc(10%+10px)] top-[14px] h-0.5 bg-muted-foreground/15 rounded-full" />
                  {/* Completed line */}
                  {(() => {
                    let lastCompleted = -1;
                    steps.forEach((st, i) => { if (st.completed) lastCompleted = i; });
                    if (lastCompleted < 0) return null;
                    const pct = (lastCompleted / (steps.length - 1)) * 80;
                    return <div className="absolute left-[calc(10%+10px)] top-[14px] h-0.5 bg-success rounded-full" style={{ width: `${pct}%` }} />;
                  })()}
                  {steps.map((step, i) => {
                    const isCompleted = step.completed;
                    const isActive = step.active;
                    const isLastStep = i === steps.length - 1;
                    const activeIsLast = isActive && isLastStep;
                    const hasExc = !!step.exception;
                    return (
                      <div key={i} className="flex flex-col items-center z-10" style={{ flex: 1 }}>
                        <div className="relative">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors bg-background
                            ${activeIsLast || isActive ? "border-primary text-primary" : isCompleted ? "border-success bg-success text-white" : "border-muted-foreground/20 text-muted-foreground/30"}`}>
                            {activeIsLast ? <Clock className="w-3.5 h-3.5" /> : isActive ? <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" /> : isCompleted ? <Check className="w-3.5 h-3.5" /> : <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />}
                          </div>
                          {hasExc && (
                            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-background z-20 ${step.exception!.severity === "critical" ? "bg-destructive" : "bg-warning"}`} />
                          )}
                        </div>
                        <span className={`text-[10px] font-semibold mt-1 ${isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground/40"}`}>
                          {MILESTONE_LABELS[i]}
                        </span>
                        <span className="text-[9px] text-muted-foreground mt-0.5">
                          {step.date || "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Details grid */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Shipment Details</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "File Number", value: s.fileNumber },
                    { label: "Client Ref", value: s.clientRef },
                    { label: "Last Event", value: s.lastEvent },
                    { label: "Shipper", value: s.shipper },
                    { label: "Consignee", value: s.consignee },
                    { label: "Containers", value: s.containerCount > 0 ? String(s.containerCount) : "—" },
                  ].map(item => (
                    <div key={item.label} className="bg-muted/30 rounded-lg p-3">
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{item.label}</div>
                      <div className="text-sm font-medium text-foreground mt-1 truncate">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Departure / Arrival */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Departure</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">ETD</span><span className="font-medium">{formatDate(s.etd)}</span></div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ATD</span>
                      <span className={`font-medium ${depLate === null ? "" : depLate ? "text-destructive" : "text-success"}`}>{formatDate(s.atd)}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Arrival</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">ETA</span><span className="font-medium">{formatDate(s.eta)}</span></div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ATA</span>
                      <span className={`font-medium ${arrLate === null ? "" : arrLate ? "text-destructive" : "text-success"}`}>{formatDate(s.ata)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events" className="p-6 m-0">
              <div className="space-y-3">
                {s.events.map((event, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="mt-1 shrink-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${event.completed ? "bg-success text-white" : "bg-accent text-muted-foreground"}`}>
                        {event.completed ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      </div>
                    </div>
                    <div className="flex-1 border rounded-lg p-3 bg-card">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{event.title}</span>
                        <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">{event.type}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{event.location}</span>
                        <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{event.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Invoices Tab */}
            <TabsContent value="invoices" className="p-6 m-0">
              {s.invoices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">No invoices</div>
              ) : (
                <div className="space-y-2">
                  {s.invoices.map((inv, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                      <div>
                        <div className="text-sm font-semibold text-foreground">{inv.number}</div>
                        <div className="text-xs text-muted-foreground">{inv.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-foreground">{inv.currency} {inv.amount.toLocaleString()}</div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${inv.status === "PAID" ? "bg-success/10 text-success" : inv.status === "OVERDUE" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}>{inv.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Containers Tab */}
            <TabsContent value="containers" className="p-6 m-0">
              <ContainersTab containers={s.containers} />
            </TabsContent>

            {/* Tags Tab */}
            <TabsContent value="tags" className="p-6 m-0">
              {s.tags.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">No tags</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {s.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">{tag}</span>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Remarks Tab */}
            <TabsContent value="remarks" className="p-6 m-0">
              {s.remarks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">No remarks</div>
              ) : (
                <div className="space-y-3">
                  {s.remarks.map((rem, i) => (
                    <div key={i} className="border rounded-lg p-3 bg-card">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">{rem.author}</span>
                        <span className="text-[10px] text-muted-foreground">{rem.date}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{rem.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ShipmentDetailPopup;
