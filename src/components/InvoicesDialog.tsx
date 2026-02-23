import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Invoice } from "@/data/mockShipments";

interface InvoicesDialogProps {
  invoices: Invoice[];
  houseBill: string;
  open: boolean;
  onClose: () => void;
}

const statusStyles: Record<string, string> = {
  PAID: "bg-success/15 text-success",
  ISSUED: "bg-primary/15 text-primary",
  OVERDUE: "bg-destructive/15 text-destructive",
};

const InvoicesDialog = ({ invoices, houseBill, open, onClose }: InvoicesDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-3">
            Invoices
            <span className="text-sm font-normal text-muted-foreground">{houseBill}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-table-header">
                <th className="text-left px-4 py-3 font-semibold text-foreground">Invoice Number</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Date</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">Amount</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Currency</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Description</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.number} className="border-b last:border-0 hover:bg-table-row-hover transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{inv.number}</td>
                  <td className="px-4 py-3 text-muted-foreground">{inv.date}</td>
                  <td className="px-4 py-3 text-right font-medium text-foreground tabular-nums">
                    {inv.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{inv.currency}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold ${statusStyles[inv.status] || ""}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{inv.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoicesDialog;
