import { useState, useRef, useCallback, useEffect } from "react";
import { mockShipments, type Shipment } from "@/data/mockShipments";
import { Check, AlertTriangle, MessageSquare, Tag, FileText, Activity } from "lucide-react";
import ShipmentDetailDialog from "@/components/ShipmentDetailDialog";
import InvoicesDialog from "@/components/InvoicesDialog";
import ShipmentEventsDialog from "@/components/ShipmentEventsDialog";

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
}

const createColumns = (): ColumnDef[] => [
  {
    id: "events", label: "Events", align: "center", minWidth: 60, defaultWidth: 70,
    render: (s, h) => (
      <button onClick={() => h.openEvents(s)} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border rounded hover:bg-accent transition-colors text-primary">
        <Activity className="w-3.5 h-3.5" />
        {s.events.length}
      </button>
    ),
  },
  {
    id: "fileNumber", label: "File Number", align: "left", minWidth: 100, defaultWidth: 140,
    render: (s, h) => (
      <button onClick={() => h.openDetail(s)} className="text-primary font-medium hover:underline">{s.fileNumber}</button>
    ),
  },
  { id: "houseBill", label: "House Bill", align: "left", minWidth: 80, defaultWidth: 100, render: (s) => <span className="font-medium text-foreground">{s.houseBill}</span> },
  { id: "clientRef", label: "Client Ref.", align: "left", minWidth: 100, defaultWidth: 150, render: (s) => <span className="text-muted-foreground">{s.clientRef}</span> },
  { id: "opened", label: "Opened", align: "left", minWidth: 120, defaultWidth: 160, render: (s) => <span className="text-muted-foreground whitespace-nowrap">{s.opened}</span> },
  { id: "transportMode", label: "Transport Mode", align: "left", minWidth: 100, defaultWidth: 120, render: (s) => <span className="text-foreground">{s.transportMode}</span> },
  { id: "origin", label: "Origin", align: "left", minWidth: 80, defaultWidth: 120, render: (s) => <span className="text-foreground whitespace-nowrap">{s.origin}</span> },
  { id: "destination", label: "Destination", align: "left", minWidth: 80, defaultWidth: 120, render: (s) => <span className="text-foreground whitespace-nowrap">{s.destination}</span> },
  { id: "shipper", label: "Shipper", align: "left", minWidth: 100, defaultWidth: 180, render: (s) => <span className="text-foreground text-xs">{s.shipper}</span> },
  { id: "consignee", label: "Consignee", align: "left", minWidth: 100, defaultWidth: 180, render: (s) => <span className="text-foreground text-xs">{s.consignee}</span> },
  {
    id: "exceptions", label: "Exceptions", align: "center", minWidth: 70, defaultWidth: 90,
    render: (s) => s.exceptions > 0
      ? <span className="inline-flex items-center gap-1 text-warning font-semibold text-xs"><AlertTriangle className="w-3.5 h-3.5" />{s.exceptions}</span>
      : <Check className="w-4 h-4 text-success mx-auto" />,
  },
  {
    id: "invoices", label: "Invoices", align: "center", minWidth: 70, defaultWidth: 80,
    render: (s, h) => (
      <button onClick={() => h.openInvoices(s)} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border rounded hover:bg-accent transition-colors text-primary">
        <FileText className="w-3.5 h-3.5" />{s.invoiceCount}
      </button>
    ),
  },
  {
    id: "containers", label: "Containers", align: "center", minWidth: 70, defaultWidth: 90,
    render: (s) => s.containerCount > 0
      ? <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border rounded text-foreground">{s.containerCount}</span>
      : <span className="text-muted-foreground">—</span>,
  },
  { id: "etd", label: "ETD", align: "left", minWidth: 100, defaultWidth: 140, render: (s) => <span className="text-muted-foreground whitespace-nowrap text-xs">{s.etd}</span> },
  {
    id: "atd", label: "ATD", align: "left", minWidth: 100, defaultWidth: 140,
    render: (s) => s.atd ? <span className="text-destructive font-medium whitespace-nowrap text-xs">{s.atd}</span> : <span className="text-muted-foreground">—</span>,
  },
  { id: "eta", label: "ETA", align: "left", minWidth: 100, defaultWidth: 140, render: (s) => <span className="text-muted-foreground whitespace-nowrap text-xs">{s.eta}</span> },
  {
    id: "ata", label: "ATA", align: "left", minWidth: 100, defaultWidth: 140,
    render: (s) => s.ata ? <span className="text-destructive font-medium whitespace-nowrap text-xs">{s.ata}</span> : <span className="text-muted-foreground">—</span>,
  },
  {
    id: "lastEvent", label: "Last Event", align: "left", minWidth: 80, defaultWidth: 110,
    render: (s) => (
      <span className={`text-xs font-medium ${s.lastEvent === "Delivered" ? "text-success" : s.lastEvent === "In Transit" ? "text-primary" : "text-foreground"}`}>
        {s.lastEvent}
      </span>
    ),
  },
  { id: "pickupReq", label: "Pickup Req.", align: "center", minWidth: 60, defaultWidth: 80, render: (s) => s.pickupRequest ? <Check className="w-4 h-4 text-success mx-auto" /> : null },
  { id: "pickup", label: "Pickup", align: "center", minWidth: 60, defaultWidth: 70, render: (s) => s.pickup ? <Check className="w-4 h-4 text-success mx-auto" /> : null },
  { id: "customs", label: "Customs", align: "center", minWidth: 60, defaultWidth: 70, render: (s) => s.customs ? <Check className="w-4 h-4 text-success mx-auto" /> : null },
  { id: "pod", label: "POD", align: "center", minWidth: 60, defaultWidth: 60, render: (s) => s.pod ? <Check className="w-4 h-4 text-success mx-auto" /> : null },
  { id: "tags", label: "Tags", align: "center", minWidth: 50, defaultWidth: 60, render: () => <Tag className="w-4 h-4 text-muted-foreground mx-auto" /> },
  { id: "remarks", label: "Remarks", align: "center", minWidth: 50, defaultWidth: 70, render: () => <MessageSquare className="w-4 h-4 text-muted-foreground mx-auto" /> },
];

const ShipmentTable = () => {
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [invoiceShipment, setInvoiceShipment] = useState<Shipment | null>(null);
  const [eventsShipment, setEventsShipment] = useState<Shipment | null>(null);

  const [columns, setColumns] = useState<ColumnDef[]>(createColumns);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const w: Record<string, number> = {};
    createColumns().forEach((c) => (w[c.id] = c.defaultWidth));
    return w;
  });

  // Drag reorder state
  const [draggedCol, setDraggedCol] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  // Resize state
  const resizing = useRef<{ colId: string; startX: number; startWidth: number } | null>(null);

  const handleResizeStart = useCallback((e: React.MouseEvent, colId: string) => {
    e.preventDefault();
    e.stopPropagation();
    resizing.current = { colId, startX: e.clientX, startWidth: columnWidths[colId] };

    const onMove = (ev: MouseEvent) => {
      if (!resizing.current) return;
      const diff = ev.clientX - resizing.current.startX;
      const col = columns.find((c) => c.id === resizing.current!.colId);
      const newW = Math.max(col?.minWidth ?? 50, resizing.current.startWidth + diff);
      setColumnWidths((prev) => ({ ...prev, [resizing.current!.colId]: newW }));
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
  const handleDragStart = (colId: string) => setDraggedCol(colId);
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

  const helpers: TableHelpers = {
    openDetail: (s) => { setSelectedShipment(s); setDetailOpen(true); },
    openInvoices: (s) => setInvoiceShipment(s),
    openEvents: (s) => setEventsShipment(s),
  };

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b">
        <span className="text-sm text-muted-foreground font-medium">{mockShipments.length} records found</span>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm font-medium border rounded hover:bg-accent transition-colors text-foreground">Export</button>
          <button className="px-3 py-1.5 text-sm font-medium border rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">Refresh</button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="text-sm" style={{ minWidth: "100%" }}>
          <thead>
            <tr className="bg-table-header border-b">
              {columns.map((col) => (
                <th
                  key={col.id}
                  draggable
                  onDragStart={() => handleDragStart(col.id)}
                  onDragOver={(e) => handleDragOver(e, col.id)}
                  onDragEnd={handleDragEnd}
                  onDrop={() => handleDrop(col.id)}
                  className={`relative group font-semibold text-foreground whitespace-nowrap select-none ${
                    col.align === "center" ? "text-center" : "text-left"
                  } ${dragOverCol === col.id ? "bg-accent" : ""}`}
                  style={{ width: columnWidths[col.id], minWidth: col.minWidth, padding: "12px 16px" }}
                >
                  <span className="cursor-grab active:cursor-grabbing">{col.label}</span>
                  {/* Resize handle */}
                  <div
                    onMouseDown={(e) => handleResizeStart(e, col.id)}
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize opacity-0 group-hover:opacity-100 hover:bg-primary/40 transition-opacity"
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockShipments.map((s) => (
              <tr key={s.id} className="border-b last:border-0 hover:bg-table-row-hover transition-colors">
                {columns.map((col) => (
                  <td
                    key={col.id}
                    className={col.align === "center" ? "text-center" : ""}
                    style={{ width: columnWidths[col.id], minWidth: col.minWidth, padding: "14px 16px" }}
                  >
                    {col.render(s, helpers)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-3 border-t text-sm text-muted-foreground">
        <span>Showing 1 to {mockShipments.length} of {mockShipments.length} entries</span>
        <div className="flex items-center gap-1">
          <button className="px-3 py-1 border rounded text-muted-foreground hover:bg-accent transition-colors" disabled>Previous</button>
          <button className="px-3 py-1 border rounded bg-primary text-primary-foreground font-medium">1</button>
          <button className="px-3 py-1 border rounded text-muted-foreground hover:bg-accent transition-colors" disabled>Next</button>
        </div>
      </div>

      {/* Dialogs */}
      <ShipmentDetailDialog shipment={selectedShipment} open={detailOpen} onClose={() => setDetailOpen(false)} />
      {invoiceShipment && (
        <InvoicesDialog invoices={invoiceShipment.invoices} houseBill={invoiceShipment.houseBill} open={!!invoiceShipment} onClose={() => setInvoiceShipment(null)} />
      )}
      <ShipmentEventsDialog shipment={eventsShipment} open={!!eventsShipment} onClose={() => setEventsShipment(null)} />
    </div>
  );
};

export default ShipmentTable;
