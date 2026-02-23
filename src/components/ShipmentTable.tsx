import { useState } from "react";
import { mockShipments, type Shipment } from "@/data/mockShipments";
import { Check, AlertTriangle, MessageSquare, Tag, FileText } from "lucide-react";
import ShipmentDetailDialog from "@/components/ShipmentDetailDialog";
import InvoicesDialog from "@/components/InvoicesDialog";

const ShipmentTable = () => {
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [invoiceShipment, setInvoiceShipment] = useState<Shipment | null>(null);

  const openDetail = (s: Shipment) => {
    setSelectedShipment(s);
    setDetailOpen(true);
  };

  const openInvoices = (s: Shipment) => {
    setInvoiceShipment(s);
  };

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground font-medium">
            {mockShipments.length} records found
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm font-medium border rounded hover:bg-accent transition-colors text-foreground">
            Export
          </button>
          <button className="px-3 py-1.5 text-sm font-medium border rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-table-header border-b">
              <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">File Number</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">House Bill</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">Client Ref.</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">Opened</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">Transport Mode</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">Origin</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">Destination</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">Shipper</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">Consignee</th>
              <th className="text-center px-4 py-3 font-semibold text-foreground whitespace-nowrap">Exceptions</th>
              <th className="text-center px-4 py-3 font-semibold text-foreground whitespace-nowrap">Invoices</th>
              <th className="text-center px-4 py-3 font-semibold text-foreground whitespace-nowrap">Containers</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">ETD</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">ATD</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">ETA</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">ATA</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">Last Event</th>
              <th className="text-center px-4 py-3 font-semibold text-foreground whitespace-nowrap">Pickup Req.</th>
              <th className="text-center px-4 py-3 font-semibold text-foreground whitespace-nowrap">Pickup</th>
              <th className="text-center px-4 py-3 font-semibold text-foreground whitespace-nowrap">Customs</th>
              <th className="text-center px-4 py-3 font-semibold text-foreground whitespace-nowrap">POD</th>
              <th className="text-center px-4 py-3 font-semibold text-foreground whitespace-nowrap">Tags</th>
              <th className="text-center px-4 py-3 font-semibold text-foreground whitespace-nowrap">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {mockShipments.map((s) => (
              <tr
                key={s.id}
                className="border-b last:border-0 hover:bg-table-row-hover transition-colors"
              >
                <td className="px-4 py-3.5">
                  <button
                    onClick={() => openDetail(s)}
                    className="text-primary font-medium hover:underline"
                  >
                    {s.fileNumber}
                  </button>
                </td>
                <td className="px-4 py-3.5 font-medium text-foreground">{s.houseBill}</td>
                <td className="px-4 py-3.5 text-muted-foreground">{s.clientRef}</td>
                <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">{s.opened}</td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span className="text-foreground">{s.transportMode}</span>
                </td>
                <td className="px-4 py-3.5 text-foreground whitespace-nowrap">{s.origin}</td>
                <td className="px-4 py-3.5 text-foreground whitespace-nowrap">{s.destination}</td>
                <td className="px-4 py-3.5 text-foreground text-xs">{s.shipper}</td>
                <td className="px-4 py-3.5 text-foreground text-xs">{s.consignee}</td>
                <td className="px-4 py-3.5 text-center">
                  {s.exceptions > 0 ? (
                    <span className="inline-flex items-center gap-1 text-warning font-semibold text-xs">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {s.exceptions}
                    </span>
                  ) : (
                    <Check className="w-4 h-4 text-success mx-auto" />
                  )}
                </td>
                <td className="px-4 py-3.5 text-center">
                  <button
                    onClick={() => openInvoices(s)}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border rounded hover:bg-accent transition-colors text-primary"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    {s.invoiceCount}
                  </button>
                </td>
                <td className="px-4 py-3.5 text-center">
                  {s.containerCount > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border rounded text-foreground">
                      {s.containerCount}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap text-xs">{s.etd}</td>
                <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                  {s.atd ? (
                    <span className="text-destructive font-medium">{s.atd}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap text-xs">{s.eta}</td>
                <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                  {s.ata ? (
                    <span className="text-destructive font-medium">{s.ata}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span className={`text-xs font-medium ${
                    s.lastEvent === "Delivered"
                      ? "text-success"
                      : s.lastEvent === "In Transit"
                      ? "text-primary"
                      : "text-foreground"
                  }`}>
                    {s.lastEvent}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-center">
                  {s.pickupRequest && <Check className="w-4 h-4 text-success mx-auto" />}
                </td>
                <td className="px-4 py-3.5 text-center">
                  {s.pickup && <Check className="w-4 h-4 text-success mx-auto" />}
                </td>
                <td className="px-4 py-3.5 text-center">
                  {s.customs && <Check className="w-4 h-4 text-success mx-auto" />}
                </td>
                <td className="px-4 py-3.5 text-center">
                  {s.pod && <Check className="w-4 h-4 text-success mx-auto" />}
                </td>
                <td className="px-4 py-3.5 text-center">
                  <Tag className="w-4 h-4 text-muted-foreground mx-auto" />
                </td>
                <td className="px-4 py-3.5 text-center">
                  <MessageSquare className="w-4 h-4 text-muted-foreground mx-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-3 border-t text-sm text-muted-foreground">
        <span>Showing 1 to {mockShipments.length} of {mockShipments.length} entries</span>
        <div className="flex items-center gap-1">
          <button className="px-3 py-1 border rounded text-muted-foreground hover:bg-accent transition-colors" disabled>
            Previous
          </button>
          <button className="px-3 py-1 border rounded bg-primary text-primary-foreground font-medium">
            1
          </button>
          <button className="px-3 py-1 border rounded text-muted-foreground hover:bg-accent transition-colors" disabled>
            Next
          </button>
        </div>
      </div>

      {/* Dialogs */}
      <ShipmentDetailDialog
        shipment={selectedShipment}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
      {invoiceShipment && (
        <InvoicesDialog
          invoices={invoiceShipment.invoices}
          houseBill={invoiceShipment.houseBill}
          open={!!invoiceShipment}
          onClose={() => setInvoiceShipment(null)}
        />
      )}
    </div>
  );
};

export default ShipmentTable;
