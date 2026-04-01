import { useState, useRef, useCallback } from "react";
import { mockShipments, CITY_CODES, COUNTRY_CODES, type Shipment, type Remark } from "@/data/mockShipments";
import { Check, AlertTriangle, MessageSquare, Tag, FileText, Plane, Ship, Truck, Search, RefreshCw, Download, X, Columns3, CircleCheck, Circle, Container } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import ShipmentDetailSidebar from "@/components/ShipmentDetailSidebar";
import InvoicesDialog from "@/components/InvoicesDialog";
import ShipmentEventsDialog from "@/components/ShipmentEventsDialog";
import TagsDialog from "@/components/TagsDialog";
import RemarksDialog from "@/components/RemarksDialog";
import ColumnManagerDialog, { type ActionVisibility } from "@/components/ColumnManagerDialog";

// --- helpers ---
const HighlightText = ({ text, query, className = "" }: { text: string; query: string; className?: string }) => {
  if (!query || query.length < 1) return <span className={className}>{text}</span>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        regex.test(part) ? <mark key={i} className="bg-yellow-200 text-inherit rounded-sm px-0.5">{part}</mark> : part
      )}
    </span>
  );
};

const TruncatedCell = ({ text, maxW = 100, query = "" }: { text: string; maxW?: number; query?: string }) => (
  <TooltipProvider delayDuration={200}>
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="block truncate" style={{ maxWidth: maxW }}>
          <HighlightText text={text} query={query} />
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs">{text}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const modeIcon: Record<string, React.ReactNode> = {
  Air: <Plane className="w-3.5 h-3.5" />,
  Ocean: <Ship className="w-3.5 h-3.5" />,
  Rail: <Truck className="w-3.5 h-3.5" />,
};

const modeColor: Record<string, string> = {
  Air: "bg-[hsl(var(--mode-air)/.08)] text-[hsl(var(--mode-air))]",
  Ocean: "bg-[hsl(var(--mode-ocean)/.08)] text-[hsl(var(--mode-ocean))]",
  Rail: "bg-[hsl(var(--mode-rail)/.08)] text-[hsl(var(--mode-rail))]",
};

const eventChipStyle: Record<string, string> = {
  Delivered: "bg-success/10 text-success border-success/20",
  "In Transit": "bg-primary/10 text-primary border-primary/20",
  "Pickup Scheduled": "bg-warning/10 text-warning border-warning/20",
  "Arrived at Port": "bg-primary/10 text-primary border-primary/20",
  "Departed": "bg-primary/10 text-primary border-primary/20",
  "Out for Delivery": "bg-warning/10 text-warning border-warning/20",
  "In Air Transit": "bg-primary/10 text-primary border-primary/20",
  "Vessel Delayed": "bg-destructive/10 text-destructive border-destructive/20",
};

// Helper: compare dates to determine if late
const isDateLate = (estimated: string | null | undefined, actual: string | null | undefined): boolean | null => {
  if (!estimated || !actual) return null;
  const eDate = new Date(estimated);
  const aDate = new Date(actual);
  return aDate > eDate;
};

// Action column IDs
const ACTION_COL_IDS = ["exceptions", "containers", "invoices", "tags", "remarks"];

const ACTION_TOOLTIPS: Record<string, string> = {
  exceptions: "Exceptions — shipment alerts",
  containers: "Containers — container details",
  invoices: "Invoices — related documents",
  tags: "Tags — categorize shipment",
  remarks: "Remarks — comments & notes",
};

// Milestone labels
const MILESTONE_LABELS = ["PKP", "DPT", "ARR", "POD"] as const;
const MILESTONE_FULL = ["Pickup", "Departed", "Arrived at destination", "Proof of Delivery"];

// Helper: format date to "Sep 22, 2025"
const formatDate = (d: string | null | undefined): string | null => {
  if (!d) return null;
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return d.split(" ")[0];
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

// Helper: get last event date from events array
const getLastEventDate = (s: Shipment): string => {
  const completed = s.events.filter(e => e.completed);
  return completed.length > 0 ? completed[completed.length - 1].date : "";
};

// --- column definition ---
interface ColumnDef {
  id: string;
  label: string;
  align: "left" | "center";
  minWidth: number;
  defaultWidth: number;
  isAction?: boolean;
  render: (s: Shipment, helpers: TableHelpers, searchQuery?: string) => React.ReactNode;
}

interface TableHelpers {
  openDetail: (s: Shipment) => void;
  openInvoices: (s: Shipment) => void;
  openEvents: (s: Shipment) => void;
  openTags: (s: Shipment) => void;
  openRemarks: (s: Shipment) => void;
}

const createColumns = (): ColumnDef[] => [
  // --- Mode (leftmost) ---
  {
    id: "transportMode", label: "Mode", align: "left", minWidth: 75, defaultWidth: 90,
    render: (s) => (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold whitespace-nowrap ${modeColor[s.transportMode]}`}>
        {modeIcon[s.transportMode]}{s.transportMode === "Rail" ? "Road" : s.transportMode === "Ocean" ? "Sea" : s.transportMode}
      </span>
    ),
  },
  // HBL / MBL (2 lines)
  {
    id: "hblMbl", label: "HBL / MBL", align: "left", minWidth: 100, defaultWidth: 130,
    render: (s, _h, q = "") => (
      <div className="leading-tight">
        <div className="text-xs font-medium text-foreground">H: <HighlightText text={s.houseBill} query={q} /></div>
        <div className="text-[11px] text-muted-foreground"><HighlightText text={s.masterBill} query={q} /></div>
      </div>
    ),
  },
  // Origin → Dest (2 lines: codes + country)
  {
    id: "originDest", label: "ORIGIN / DEST", align: "left", minWidth: 120, defaultWidth: 150,
    render: (s, _h, q = "") => {
      const oCode = CITY_CODES[s.origin] || s.origin.slice(0, 3);
      const dCode = CITY_CODES[s.destination] || s.destination.slice(0, 3);
      const oCountry = COUNTRY_CODES[s.origin] || "";
      const dCountry = COUNTRY_CODES[s.destination] || "";
      return (
        <div className="flex items-center gap-2 text-xs">
          <div className="text-center">
            <div className="font-semibold text-foreground"><HighlightText text={oCode} query={q} /></div>
            <div className="text-[10px] text-muted-foreground"><HighlightText text={oCountry} query={q} /></div>
          </div>
          <span className="text-muted-foreground">→</span>
          <div className="text-center">
            <div className="font-semibold text-foreground"><HighlightText text={dCode} query={q} /></div>
            <div className="text-[10px] text-muted-foreground"><HighlightText text={dCountry} query={q} /></div>
          </div>
        </div>
      );
    },
  },
  // Departure ETD / ATD (2 lines) with color logic
  {
    id: "departure", label: "DEPARTURE\n(ETD/ATD)", align: "left", minWidth: 110, defaultWidth: 140,
    render: (s) => {
      const late = isDateLate(s.etd, s.atd);
      const atdColor = late === null ? "text-muted-foreground" : late ? "text-destructive font-semibold" : "text-success font-semibold";
      return (
        <div className="leading-tight text-xs">
          <div className="text-muted-foreground whitespace-nowrap">
            <span className="text-[10px] text-muted-foreground/70">ETD:</span> {formatDate(s.etd) || "—"}
          </div>
          <div className="whitespace-nowrap">
            <span className="text-[10px] text-muted-foreground/70">ATD:</span>{" "}
            {s.atd ? <span className={atdColor}>{formatDate(s.atd)}</span> : <span className="text-muted-foreground">—</span>}
          </div>
        </div>
      );
    },
  },
  // Arrival ETA / ATA (2 lines) with color logic
  {
    id: "arrival", label: "ARRIVAL\n(ETA/ATA)", align: "left", minWidth: 110, defaultWidth: 140,
    render: (s) => {
      const late = isDateLate(s.eta, s.ata);
      const ataColor = late === null ? "text-muted-foreground" : late ? "text-destructive font-semibold" : "text-success font-semibold";
      return (
        <div className="leading-tight text-xs">
          <div className="text-muted-foreground whitespace-nowrap">
            <span className="text-[10px] text-muted-foreground/70">ETA:</span> {formatDate(s.eta) || "—"}
          </div>
          <div className="whitespace-nowrap">
            <span className="text-[10px] text-muted-foreground/70">ATA:</span>{" "}
            {s.ata ? <span className={ataColor}>{formatDate(s.ata)}</span> : <span className="text-muted-foreground">—</span>}
          </div>
        </div>
      );
    },
  },
  // Shipper / Consignee (2 lines)
  {
    id: "shipperConsignee", label: "SHIPPER / CONSIGNEE", align: "left", minWidth: 130, defaultWidth: 180,
    render: (s, _h, q = "") => (
      <div className="leading-tight">
        <div className="text-xs font-medium text-foreground"><TruncatedCell text={s.shipper} maxW={165} query={q} /></div>
        <div className="text-[11px] text-muted-foreground"><TruncatedCell text={s.consignee} maxW={165} query={q} /></div>
      </div>
    ),
  },
  // Client Ref
  {
    id: "clientRef", label: "CLIENT\nREF", align: "left", minWidth: 80, defaultWidth: 100,
    render: (s, _h, q = "") => <TruncatedCell text={s.clientRef} maxW={90} query={q} />,
  },
  // Last Event (badge + date, tooltip with full details)
  {
    id: "lastEvent", label: "LAST EVENT", align: "left", minWidth: 130, defaultWidth: 160,
    render: (s) => {
      const completedEvents = s.events.filter(e => e.completed);
      const lastEvt = completedEvents.length > 0 ? completedEvents[completedEvents.length - 1] : null;
      const chipClass = eventChipStyle[s.lastEvent] || "bg-muted text-foreground border-border";
      // Extract date only (no time)
      const dateOnly = lastEvt?.date?.replace(/,?\s*\d{1,2}:\d{2}\s*(AM|PM)?/i, "") || "";
      return (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="leading-tight cursor-default">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${chipClass}`}>
                  {s.lastEvent}
                </span>
                {dateOnly && (
                  <div className="mt-1 text-[10px] text-muted-foreground">{dateOnly}</div>
                )}
              </div>
            </TooltipTrigger>
            {lastEvt && (
              <TooltipContent side="top" className="text-xs max-w-xs">
                <div className="font-semibold">{lastEvt.title}</div>
                <div className="text-muted-foreground">{lastEvt.description}</div>
                <div className="text-muted-foreground">{lastEvt.location} — {lastEvt.date}</div>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  // Milestones (unified progress bar)
  {
    id: "milestones", label: "MILESTONES", align: "left", minWidth: 200, defaultWidth: 240,
    render: (s) => {
      const steps = s.statusSteps.slice(1); // skip "Order Accepted"
      const getTimingStatus = (step: typeof steps[0]): "ontime" | "delayed" | "late" | null => {
        if (!step.completed && !step.active) return null;
        if (!step.date) return step.completed ? "ontime" : null;
        const desc = (step.description || "").toLowerCase();
        if (desc.includes("delay") || desc.includes("late")) return "late";
        return "ontime";
      };
      const timingColor = (status: "ontime" | "delayed" | "late" | null) => {
        if (status === "ontime") return "text-success";
        if (status === "delayed") return "text-warning";
        if (status === "late") return "text-destructive";
        return "text-muted-foreground";
      };
      const timingLabel = (status: "ontime" | "delayed" | "late" | null) => {
        if (status === "ontime") return "On Time";
        if (status === "delayed") return "Delayed";
        if (status === "late") return "Late";
        return "Pending";
      };

      // Find last completed index for the progress line
      let lastCompletedIdx = -1;
      steps.forEach((step, i) => { if (step.completed) lastCompletedIdx = i; });

      const circleSize = 20; // w-5 h-5 = 20px
      const gap = 24; // spacing between circle centers minus circle size
      const totalWidth = steps.length * circleSize + (steps.length - 1) * gap;

      return (
        <div className="relative" style={{ width: totalWidth, height: 36 }}>
          {/* Background line (full width, centered vertically on circles) */}
          <div
            className="absolute bg-muted-foreground/20 rounded-full"
            style={{ left: circleSize / 2, right: circleSize / 2, top: (circleSize / 2) - 1, height: 2 }}
          />
          {/* Completed progress line */}
          {lastCompletedIdx >= 0 && (
            <div
              className="absolute bg-success rounded-full"
              style={{
                left: circleSize / 2,
                width: lastCompletedIdx * (circleSize + gap),
                top: (circleSize / 2) - 1,
                height: 2,
              }}
            />
          )}
          {/* Circles + labels */}
          {steps.map((step, i) => {
            const timing = getTimingStatus(step);
            const isCompleted = step.completed;
            const isActive = step.active;
            const xPos = i * (circleSize + gap);

            return (
              <TooltipProvider key={i} delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="absolute flex flex-col items-center cursor-default" style={{ left: xPos, top: 0, width: circleSize }}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors z-[1]
                        ${isCompleted
                          ? "border-success bg-success text-white"
                          : isActive
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-muted-foreground/25 bg-background text-muted-foreground/30"
                        }`}>
                        {isCompleted ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <div className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-primary" : "bg-muted-foreground/25"}`} />
                        )}
                      </div>
                      <span className={`text-[9px] font-semibold leading-none mt-0.5 ${isCompleted ? "text-foreground" : isActive ? "text-primary" : "text-muted-foreground/40"}`}>
                        {MILESTONE_LABELS[i] || step.label.slice(0, 3).toUpperCase()}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs max-w-[200px]">
                    <div className="font-semibold mb-0.5">{MILESTONE_FULL[i] || step.label}</div>
                    {step.date && (
                      <div className={`font-medium ${timingColor(timing)}`}>
                        {step.date} • {timingLabel(timing)}
                      </div>
                    )}
                    {step.location && <div className="text-muted-foreground">{step.location}</div>}
                    {step.description && <div className="text-muted-foreground mt-0.5">{step.description}</div>}
                    {!step.date && !isCompleted && !isActive && (
                      <div className="text-muted-foreground italic">Not yet reached</div>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      );
    },
  },
  // --- Actions (far right, no header label) ---
  {
    id: "exceptions", label: "Exc.", align: "left", minWidth: 40, defaultWidth: 42, isAction: true,
    render: (s) => s.exceptions > 0
      ? <span className="inline-flex items-center gap-0.5 text-warning font-semibold text-xs"><AlertTriangle className="w-3 h-3" />{s.exceptions}</span>
      : <span className="inline-flex items-center text-muted-foreground/30"><AlertTriangle className="w-3 h-3" /></span>,
  },
  {
    id: "containers", label: "Cnt.", align: "left", minWidth: 40, defaultWidth: 42, isAction: true,
    render: (s) => s.containerCount > 0
      ? <span className="inline-flex items-center gap-0.5 text-primary font-semibold text-xs"><Container className="w-3 h-3" />{s.containerCount}</span>
      : <span className="inline-flex items-center text-muted-foreground/30"><Container className="w-3 h-3" /></span>,
  },
  {
    id: "invoices", label: "Inv.", align: "left", minWidth: 40, defaultWidth: 42, isAction: true,
    render: (s, h) => {
      const hasInvoices = s.invoiceCount > 0;
      return (
        <button onClick={() => h.openInvoices(s)} className={`inline-flex items-center gap-0.5 text-xs font-medium rounded px-1 py-0.5 transition-colors ${hasInvoices ? "text-primary hover:text-primary/80 hover:bg-accent" : "text-muted-foreground/30"}`}>
          <FileText className="w-3 h-3" />{hasInvoices ? s.invoiceCount : ""}
        </button>
      );
    },
  },
  {
    id: "tags", label: "Tags", align: "left", minWidth: 40, defaultWidth: 42, isAction: true,
    render: (s, h) => {
      const hasTags = s.tags.length > 0;
      return (
        <button onClick={() => h.openTags(s)} className={`inline-flex items-center gap-0.5 text-xs rounded px-1 py-0.5 transition-colors ${hasTags ? "text-primary hover:text-primary/80 hover:bg-accent" : "text-muted-foreground/30"}`}>
          <Tag className="w-3 h-3" />
          {hasTags && <span className="font-medium">{s.tags.length}</span>}
        </button>
      );
    },
  },
  {
    id: "remarks", label: "Rem.", align: "left", minWidth: 40, defaultWidth: 42, isAction: true,
    render: (s, h) => {
      const hasRemarks = s.remarks.length > 0;
      return (
        <button onClick={() => h.openRemarks(s)} className={`inline-flex items-center gap-0.5 text-xs rounded px-1 py-0.5 transition-colors ${hasRemarks ? "text-primary hover:text-primary/80 hover:bg-accent" : "text-muted-foreground/30"}`}>
          <MessageSquare className="w-3 h-3" />
          {hasRemarks && <span className="font-medium">{s.remarks.length}</span>}
        </button>
      );
    },
  },
];

const ALL_COLUMNS = createColumns();
const DATA_COLUMNS = ALL_COLUMNS.filter((c) => !c.isAction);
const ACTION_COLUMNS = ALL_COLUMNS.filter((c) => c.isAction);

const ShipmentTable = () => {
  const STATUS_FILTERS = ["All", "In Transit", "Delivered", "Delayed"] as const;

  const [shipments, setShipments] = useState<Shipment[]>(mockShipments);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [invoiceShipment, setInvoiceShipment] = useState<Shipment | null>(null);
  const [eventsShipment, setEventsShipment] = useState<Shipment | null>(null);
  const [tagsShipment, setTagsShipment] = useState<Shipment | null>(null);
  const [remarksShipment, setRemarksShipment] = useState<Shipment | null>(null);
  const [activeStatus, setActiveStatus] = useState<string>("All");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [columnManagerOpen, setColumnManagerOpen] = useState(false);
  const [actionVisibility, setActionVisibility] = useState<ActionVisibility>({
    exceptions: true, containers: true, invoices: true, tags: true, remarks: true,
  });
  const [mergeOriginDest, setMergeOriginDest] = useState(false);

  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(() => DATA_COLUMNS.map((c) => c.id));
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const w: Record<string, number> = {};
    ALL_COLUMNS.forEach((c) => (w[c.id] = c.defaultWidth));
    return w;
  });

  // Only data columns are reorderable/hideable; action columns always pinned right
  const visibleDataColumns = visibleColumnIds.map((id) => DATA_COLUMNS.find((c) => c.id === id)!).filter(Boolean);
  const visibleColumns = [...visibleDataColumns, ...ACTION_COLUMNS];

  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Drag reorder
  const [draggedCol, setDraggedCol] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  // Resize
  const resizing = useRef<{ colId: string; startX: number; startWidth: number } | null>(null);

  const handleResizeStart = useCallback((e: React.MouseEvent, colId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = columnWidths[colId];
    resizing.current = { colId, startX, startWidth };

    const col = ALL_COLUMNS.find((c) => c.id === colId);
    const minW = col?.minWidth ?? 40;

    const onMove = (ev: MouseEvent) => {
      const diff = ev.clientX - startX;
      const newW = Math.max(minW, startWidth + diff);
      setColumnWidths((prev) => ({ ...prev, [colId]: newW }));
    };
    const onUp = () => {
      resizing.current = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [columnWidths]);

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, colId: string) => {
    setDraggedCol(colId);
    e.dataTransfer.effectAllowed = "move";
    const th = e.currentTarget as HTMLElement;
    const ghost = th.cloneNode(true) as HTMLElement;
    ghost.style.opacity = "0.7";
    ghost.style.position = "absolute";
    ghost.style.top = "-9999px";
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 20, 20);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };
  const handleDragOver = (e: React.DragEvent, colId: string) => { e.preventDefault(); setDragOverCol(colId); };
  const handleDragEnd = () => { setDraggedCol(null); setDragOverCol(null); };
  const handleDrop = (targetColId: string) => {
    if (!draggedCol || draggedCol === targetColId) return;
    setVisibleColumnIds((prev) => {
      const fromIdx = prev.indexOf(draggedCol);
      const toIdx = prev.indexOf(targetColId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
    setDraggedCol(null);
    setDragOverCol(null);
  };

  // Tags save
  const handleTagsSave = (tags: string[]) => {
    if (!tagsShipment) return;
    setShipments((prev) => prev.map((s) => s.id === tagsShipment.id ? { ...s, tags } : s));
    setTagsShipment((prev) => prev ? { ...prev, tags } : null);
  };

  // Remarks add
  const handleRemarkAdd = (text: string) => {
    if (!remarksShipment) return;
    const newRemark: Remark = {
      id: `r-${Date.now()}`,
      author: "John Smith",
      text,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
    };
    setShipments((prev) => prev.map((s) => s.id === remarksShipment.id ? { ...s, remarks: [...s.remarks, newRemark] } : s));
    setRemarksShipment((prev) => prev ? { ...prev, remarks: [...prev.remarks, newRemark] } : null);
  };

  const helpers: TableHelpers = {
    openDetail: (s) => { setSelectedShipment(s); setDetailOpen(true); },
    openInvoices: (s) => setInvoiceShipment(s),
    openEvents: (s) => setEventsShipment(s),
    openTags: (s) => setTagsShipment(s),
    openRemarks: (s) => setRemarksShipment(s),
  };

  const filteredShipments = shipments.filter((s) => {
    const matchesStatus = activeStatus === "All"
      || s.lastEvent === activeStatus
      || (activeStatus === "Delayed" && s.events.some(e => (e.description || "").toLowerCase().includes("delay")));
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      s.houseBill.toLowerCase().includes(q) ||
      s.masterBill.toLowerCase().includes(q) ||
      s.clientRef.toLowerCase().includes(q) ||
      s.shipper.toLowerCase().includes(q) ||
      s.consignee.toLowerCase().includes(q) ||
      s.origin.toLowerCase().includes(q) ||
      s.destination.toLowerCase().includes(q) ||
      (CITY_CODES[s.origin] || "").toLowerCase().includes(q) ||
      (CITY_CODES[s.destination] || "").toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const isActionCol = (id: string) => ACTION_COL_IDS.includes(id);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-1 py-1.5 shrink-0">
        {searchOpen ? (
          <div className="flex items-center gap-1.5 bg-accent rounded px-2 py-1">
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shipments..."
              className="bg-transparent text-xs outline-none w-40 placeholder:text-muted-foreground"
            />
            <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="text-muted-foreground hover:text-foreground">
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button onClick={() => setSearchOpen(true)} className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            <Search className="w-3.5 h-3.5" />
          </button>
        )}

        <div className="flex items-center gap-1">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                activeStatus === status
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <span className="text-[11px] text-muted-foreground">{filteredShipments.length} records</span>

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={() => setColumnManagerOpen(true)} className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors border">
                <Columns3 className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Manage columns</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <button className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors border">
          <Download className="w-3.5 h-3.5" />
        </button>
        <button className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors border">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Table card */}
      <div className="bg-card rounded-lg border shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 min-h-0 overflow-auto" ref={scrollRef}>
          <table className="text-[13px]" style={{ minWidth: "100%" }}>
            <thead className="sticky top-0 z-10">
              <tr className="bg-table-header border-b">
                {visibleColumns.map((col) => {
                  const isAction = isActionCol(col.id);
                  return (
                    <th
                      key={col.id}
                      draggable={!isAction}
                      onDragStart={(e) => !isAction && handleDragStart(e, col.id)}
                      onDragOver={(e) => !isAction && handleDragOver(e, col.id)}
                      onDragEnd={handleDragEnd}
                      onDrop={() => !isAction && handleDrop(col.id)}
                      className={`relative group font-semibold text-foreground whitespace-nowrap select-none text-left ${
                        dragOverCol === col.id ? "bg-accent" : ""
                      } ${draggedCol === col.id ? "opacity-40" : ""}`}
                      style={{ width: columnWidths[col.id], minWidth: col.minWidth, padding: "8px 8px" }}
                    >
                      {isAction ? (
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-xs text-muted-foreground">&nbsp;</span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">{ACTION_TOOLTIPS[col.id]}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="cursor-grab active:cursor-grabbing text-xs whitespace-pre-line leading-tight">{col.label}</span>
                      )}
                      {!isAction && (
                        <div
                          onMouseDown={(e) => handleResizeStart(e, col.id)}
                          className="absolute right-0 top-0 bottom-0 w-[3px] cursor-col-resize opacity-0 group-hover:opacity-100 bg-primary/30 hover:bg-primary/50 transition-opacity"
                          style={{ zIndex: 10 }}
                        />
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {filteredShipments.map((s) => (
                <tr
                  key={s.id}
                  className={`border-b last:border-0 hover:bg-table-row-hover transition-colors cursor-pointer ${draggedCol ? "pointer-events-none" : ""}`}
                  onClick={(e) => { if ((e.target as HTMLElement).closest('button')) return; setSelectedShipment(s); setDetailOpen(true); }}
                >
                  {visibleColumns.map((col) => (
                    <td
                      key={col.id}
                      className={`${draggedCol === col.id ? "opacity-40" : ""}`}
                      style={{ width: columnWidths[col.id], minWidth: col.minWidth, padding: "8px 8px" }}
                    >
                      {col.render(s, helpers, searchQuery)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-3 py-1 border-t text-[11px] text-muted-foreground shrink-0">
          <span>{filteredShipments.length} of {shipments.length} records</span>
        </div>
      </div>

      {/* Dialogs & Sidebar */}
      <ShipmentDetailSidebar shipment={selectedShipment} open={detailOpen} onClose={() => setDetailOpen(false)} />
      {invoiceShipment && (
        <InvoicesDialog invoices={invoiceShipment.invoices} houseBill={invoiceShipment.houseBill} open={!!invoiceShipment} onClose={() => setInvoiceShipment(null)} />
      )}
      <ShipmentEventsDialog shipment={eventsShipment} open={!!eventsShipment} onClose={() => setEventsShipment(null)} />
      {tagsShipment && (
        <TagsDialog tags={tagsShipment.tags} houseBill={tagsShipment.houseBill} open={!!tagsShipment} onClose={() => setTagsShipment(null)} onSave={handleTagsSave} />
      )}
      {remarksShipment && (
        <RemarksDialog remarks={remarksShipment.remarks} houseBill={remarksShipment.houseBill} open={!!remarksShipment} onClose={() => setRemarksShipment(null)} onAdd={handleRemarkAdd} />
      )}
      <ColumnManagerDialog
        open={columnManagerOpen}
        onClose={() => setColumnManagerOpen(false)}
        allColumns={DATA_COLUMNS.map((c) => ({ id: c.id, label: c.label }))}
        visibleColumnIds={visibleColumnIds}
        onSave={setVisibleColumnIds}
      />
    </div>
  );
};

export default ShipmentTable;
