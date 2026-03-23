import { useState, useRef, useCallback } from "react";
import { mockShipments, CITY_FLAGS, type Shipment, type Remark } from "@/data/mockShipments";
import { Check, AlertTriangle, MessageSquare, Tag, FileText, Plane, Sailboat, TramFront, CircleDot, Search, RefreshCw, Download, X } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import ShipmentDetailSidebar from "@/components/ShipmentDetailSidebar";
import InvoicesDialog from "@/components/InvoicesDialog";
import ShipmentEventsDialog from "@/components/ShipmentEventsDialog";
import TagsDialog from "@/components/TagsDialog";
import RemarksDialog from "@/components/RemarksDialog";

// --- helpers ---
const TruncatedCell = ({ text, maxW = 100 }: { text: string; maxW?: number }) => (
  <TooltipProvider delayDuration={200}>
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="block truncate" style={{ maxWidth: maxW }}>{text}</span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs">{text}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const modeIcon: Record<string, React.ReactNode> = {
  Air: <Plane className="w-3 h-3" />,
  Ocean: <Sailboat className="w-3 h-3" />,
  Rail: <TramFront className="w-3 h-3" />,
};

const modeColor: Record<string, string> = {
  Air: "bg-primary/10 text-primary",
  Ocean: "bg-primary/10 text-primary",
  Rail: "bg-primary/10 text-primary",
};

const eventChipColor: Record<string, string> = {
  Delivered: "bg-success/10 text-success",
  "In Transit": "bg-primary/10 text-primary",
  "Pickup Scheduled": "bg-warning/10 text-warning",
};

// --- column definition ---
interface ColumnDef {
  id: string;
  label: string;
  align: "left" | "center";
  minWidth: number;
  defaultWidth: number;
  render: (s: Shipment, helpers: TableHelpers) => React.ReactNode;
}

interface TableHelpers {
  openDetail: (s: Shipment) => void;
  openInvoices: (s: Shipment) => void;
  openEvents: (s: Shipment) => void;
  openTags: (s: Shipment) => void;
  openRemarks: (s: Shipment) => void;
}

const createColumns = (): ColumnDef[] => [
  {
    id: "events", label: "Events", align: "left", minWidth: 50, defaultWidth: 58,
    render: (s, h) => (
      <button onClick={() => h.openEvents(s)} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:bg-accent rounded px-1.5 py-0.5 transition-colors">
        <CircleDot className="w-3.5 h-3.5" />
        {s.events.length}
      </button>
    ),
  },
  {
    id: "fileNumber", label: "File No.", align: "left", minWidth: 80, defaultWidth: 110,
    render: (s) => (
      <span className="text-primary font-medium text-xs">
        <TruncatedCell text={s.fileNumber} maxW={95} />
      </span>
    ),
  },
  {
    id: "houseBill", label: "House Bill", align: "left", minWidth: 70, defaultWidth: 82,
    render: (s) => <span className="font-medium text-foreground text-xs">{s.houseBill}</span>,
  },
  {
    id: "clientRef", label: "Client Ref.", align: "left", minWidth: 80, defaultWidth: 110,
    render: (s) => <TruncatedCell text={s.clientRef} maxW={95} />,
  },
  {
    id: "opened", label: "Opened", align: "left", minWidth: 80, defaultWidth: 95,
    render: (s) => {
      const short = s.opened.split(" ")[0];
      return (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild><span className="text-muted-foreground text-xs whitespace-nowrap">{short}</span></TooltipTrigger>
            <TooltipContent side="top" className="text-xs">{s.opened}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    id: "transportMode", label: "Mode", align: "left", minWidth: 65, defaultWidth: 90,
    render: (s) => (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${modeColor[s.transportMode]}`}>
        {modeIcon[s.transportMode]}{s.transportMode}
      </span>
    ),
  },
  {
    id: "origin", label: "Origin", align: "left", minWidth: 80, defaultWidth: 105,
    render: (s) => (
      <span className="text-foreground text-xs whitespace-nowrap">
        {CITY_FLAGS[s.origin] || ""} {s.origin.charAt(0) + s.origin.slice(1).toLowerCase()}
      </span>
    ),
  },
  {
    id: "destination", label: "Dest.", align: "left", minWidth: 80, defaultWidth: 105,
    render: (s) => (
      <span className="text-foreground text-xs whitespace-nowrap">
        {CITY_FLAGS[s.destination] || ""} {s.destination.charAt(0) + s.destination.slice(1).toLowerCase()}
      </span>
    ),
  },
  {
    id: "shipper", label: "Shipper", align: "left", minWidth: 80, defaultWidth: 120,
    render: (s) => <TruncatedCell text={s.shipper} maxW={110} />,
  },
  {
    id: "consignee", label: "Consignee", align: "left", minWidth: 80, defaultWidth: 120,
    render: (s) => <TruncatedCell text={s.consignee} maxW={110} />,
  },
  {
    id: "exceptions", label: "Exc.", align: "left", minWidth: 45, defaultWidth: 50,
    render: (s) => s.exceptions > 0
      ? <span className="inline-flex items-center gap-0.5 text-warning font-semibold text-xs"><AlertTriangle className="w-3 h-3" />{s.exceptions}</span>
      : <Check className="w-3.5 h-3.5 text-success" />,
  },
  {
    id: "invoices", label: "Inv.", align: "left", minWidth: 45, defaultWidth: 50,
    render: (s, h) => (
      <button onClick={() => h.openInvoices(s)} className="inline-flex items-center gap-0.5 text-xs font-medium text-primary hover:bg-accent rounded px-1.5 py-0.5 transition-colors">
        <FileText className="w-3 h-3" />{s.invoiceCount}
      </button>
    ),
  },
  {
    id: "containers", label: "Cnt.", align: "left", minWidth: 40, defaultWidth: 45,
    render: (s) => s.containerCount > 0
      ? <span className="text-xs font-medium text-foreground">{s.containerCount}</span>
      : <span className="text-muted-foreground text-xs">—</span>,
  },
  {
    id: "etd", label: "ETD", align: "left", minWidth: 70, defaultWidth: 82,
    render: (s) => {
      const short = s.etd.split(" ")[0];
      return (
        <TooltipProvider delayDuration={200}><Tooltip><TooltipTrigger asChild>
          <span className="text-muted-foreground text-xs whitespace-nowrap">{short}</span>
        </TooltipTrigger><TooltipContent side="top" className="text-xs">{s.etd}</TooltipContent></Tooltip></TooltipProvider>
      );
    },
  },
  {
    id: "atd", label: "ATD", align: "left", minWidth: 70, defaultWidth: 82,
    render: (s) => {
      if (!s.atd) return <span className="text-muted-foreground text-xs">—</span>;
      const short = s.atd.split(" ")[0];
      return (
        <TooltipProvider delayDuration={200}><Tooltip><TooltipTrigger asChild>
          <span className="text-destructive font-medium text-xs whitespace-nowrap">{short}</span>
        </TooltipTrigger><TooltipContent side="top" className="text-xs">{s.atd}</TooltipContent></Tooltip></TooltipProvider>
      );
    },
  },
  {
    id: "eta", label: "ETA", align: "left", minWidth: 70, defaultWidth: 82,
    render: (s) => {
      const short = s.eta.split(" ")[0];
      return (
        <TooltipProvider delayDuration={200}><Tooltip><TooltipTrigger asChild>
          <span className="text-muted-foreground text-xs whitespace-nowrap">{short}</span>
        </TooltipTrigger><TooltipContent side="top" className="text-xs">{s.eta}</TooltipContent></Tooltip></TooltipProvider>
      );
    },
  },
  {
    id: "ata", label: "ATA", align: "left", minWidth: 70, defaultWidth: 82,
    render: (s) => {
      if (!s.ata) return <span className="text-muted-foreground text-xs">—</span>;
      const short = s.ata.split(" ")[0];
      return (
        <TooltipProvider delayDuration={200}><Tooltip><TooltipTrigger asChild>
          <span className="text-destructive font-medium text-xs whitespace-nowrap">{short}</span>
        </TooltipTrigger><TooltipContent side="top" className="text-xs">{s.ata}</TooltipContent></Tooltip></TooltipProvider>
      );
    },
  },
  {
    id: "lastEvent", label: "Last Event", align: "left", minWidth: 100, defaultWidth: 120,
    render: (s) => (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${eventChipColor[s.lastEvent] || "bg-muted text-foreground"}`}>
        {s.lastEvent}
      </span>
    ),
  },
  { id: "pickupReq", label: "P.Req", align: "left", minWidth: 40, defaultWidth: 45, render: (s) => s.pickupRequest ? <Check className="w-3.5 h-3.5 text-success" /> : null },
  { id: "pickup", label: "P.Up", align: "left", minWidth: 40, defaultWidth: 45, render: (s) => s.pickup ? <Check className="w-3.5 h-3.5 text-success" /> : null },
  { id: "customs", label: "Cust.", align: "left", minWidth: 40, defaultWidth: 45, render: (s) => s.customs ? <Check className="w-3.5 h-3.5 text-success" /> : null },
  { id: "pod", label: "POD", align: "left", minWidth: 40, defaultWidth: 45, render: (s) => s.pod ? <Check className="w-3.5 h-3.5 text-success" /> : null },
  {
    id: "tags", label: "Tags", align: "left", minWidth: 55, defaultWidth: 70,
    render: (s, h) => (
      <button onClick={() => h.openTags(s)} className="inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-primary hover:bg-accent rounded px-1.5 py-0.5 transition-colors">
        <Tag className="w-3 h-3" />
        {s.tags.length > 0 && <span className="font-medium">{s.tags.length}</span>}
      </button>
    ),
  },
  {
    id: "remarks", label: "Rem.", align: "left", minWidth: 45, defaultWidth: 55,
    render: (s, h) => (
      <button onClick={() => h.openRemarks(s)} className="inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-primary hover:bg-accent rounded px-1.5 py-0.5 transition-colors">
        <MessageSquare className="w-3 h-3" />
        {s.remarks.length > 0 && <span className="font-medium">{s.remarks.length}</span>}
      </button>
    ),
  },
];

const ShipmentTable = () => {
  const STATUS_FILTERS = ["All", "In Transit", "Delivered", "Pickup Scheduled"] as const;

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

  const [columns, setColumns] = useState<ColumnDef[]>(createColumns);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const w: Record<string, number> = {};
    createColumns().forEach((c) => (w[c.id] = c.defaultWidth));
    return w;
  });

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

    const col = columns.find((c) => c.id === colId);
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
  }, [columnWidths, columns]);

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, colId: string) => {
    setDraggedCol(colId);
    e.dataTransfer.effectAllowed = "move";
    // Create a ghost element that shows the full column
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
    setColumns((prev) => {
      const fromIdx = prev.findIndex((c) => c.id === draggedCol);
      const toIdx = prev.findIndex((c) => c.id === targetColId);
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
    const matchesStatus = activeStatus === "All" || s.lastEvent === activeStatus;
    const matchesSearch = !searchQuery || 
      s.fileNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.houseBill.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.clientRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.shipper.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.consignee.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.destination.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="bg-card rounded-lg border shadow-sm flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b shrink-0">
        {/* Search */}
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

        {/* Status filters */}
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

        {/* Record count */}
        <span className="text-[11px] text-muted-foreground">{filteredShipments.length} records</span>

        {/* Export + Refresh */}
        <button className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors border">
          <Download className="w-3.5 h-3.5" />
        </button>
        <button className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors border">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Scrollable table area */}
      <div className="flex-1 min-h-0 overflow-auto" ref={scrollRef}>
        <table className="text-[13px]" style={{ minWidth: "100%" }}>
          <thead className="sticky top-0 z-10">
            <tr className="bg-table-header border-b">
              {columns.map((col) => (
                <th
                  key={col.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, col.id)}
                  onDragOver={(e) => handleDragOver(e, col.id)}
                  onDragEnd={handleDragEnd}
                  onDrop={() => handleDrop(col.id)}
                  className={`relative group font-semibold text-foreground whitespace-nowrap select-none ${
                    col.align === "center" ? "text-center" : "text-left"
                  } ${dragOverCol === col.id ? "bg-accent" : ""} ${draggedCol === col.id ? "opacity-40" : ""}`}
                  style={{ width: columnWidths[col.id], minWidth: col.minWidth, padding: "10px 10px" }}
                >
                  <span className="cursor-grab active:cursor-grabbing text-xs">{col.label}</span>
                  <div
                    onMouseDown={(e) => handleResizeStart(e, col.id)}
                    className="absolute right-0 top-0 bottom-0 w-[3px] cursor-col-resize opacity-0 group-hover:opacity-100 bg-primary/30 hover:bg-primary/50 transition-opacity"
                    style={{ zIndex: 10 }}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shipments.map((s) => (
              <tr
                key={s.id}
                className={`border-b last:border-0 hover:bg-table-row-hover transition-colors cursor-pointer ${draggedCol ? "pointer-events-none" : ""}`}
                onClick={(e) => { if ((e.target as HTMLElement).closest('button')) return; setSelectedShipment(s); setDetailOpen(true); }}
              >
                {columns.map((col) => (
                  <td
                    key={col.id}
                    className={`${col.align === "center" ? "text-center" : ""} ${draggedCol === col.id ? "opacity-40" : ""}`}
                    style={{ width: columnWidths[col.id], minWidth: col.minWidth, padding: "10px 10px" }}
                  >
                    {col.render(s, helpers)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-1.5 border-t text-xs text-muted-foreground shrink-0">
        <span>{shipments.length} records</span>
      </div>

      {/* Sidebar detail */}
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
    </div>
  );
};

export default ShipmentTable;
