import { RefreshCw, Settings } from "lucide-react";
import { mockShipments } from "@/data/mockShipments";

interface Props {
  title?: string;
}

const formatNumber = (n: number) => n.toLocaleString();

const ShipmentTableLite = ({ title = "Last updated shipments" }: Props) => {
  const rows = mockShipments.map((s) => {
    const totalWeight = s.containers.reduce((sum, c) => sum + (c.weightKg ?? 0), 0);
    const lastUpdate = s.ata ?? s.atd ?? s.eta;
    return {
      id: s.id,
      fileNumber: s.fileNumber,
      consignee: s.consignee,
      totalWeight,
      lastStatus: s.lastEvent,
      lastUpdate,
    };
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 shrink-0 border-b">
        <h3 className="text-[11px] font-semibold text-muted-foreground tracking-[0.08em] uppercase">
          {title}
        </h3>
        <div className="flex-1" />
        <span className="text-[11px] text-muted-foreground">{rows.length} records</span>
        <button className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors border">
          <Settings className="w-3.5 h-3.5" />
        </button>
        <button className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors border">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 overflow-auto">
        <table className="w-full text-[13px]">
          <thead className="sticky top-0 bg-card z-10">
            <tr className="border-b">
              <th className="text-left font-semibold text-[12px] text-foreground px-3 py-2 whitespace-nowrap">File Number</th>
              <th className="text-left font-semibold text-[12px] text-foreground px-3 py-2 whitespace-nowrap">Consignee</th>
              <th className="text-right font-semibold text-[12px] text-foreground px-3 py-2 whitespace-nowrap">Total Weight</th>
              <th className="text-left font-semibold text-[12px] text-foreground px-3 py-2 whitespace-nowrap">Last Status</th>
              <th className="text-left font-semibold text-[12px] text-foreground px-3 py-2 whitespace-nowrap">Last update</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b hover:bg-accent/40 transition-colors">
                <td className="px-3 py-2 text-foreground tabular-nums whitespace-nowrap">{r.fileNumber}</td>
                <td className="px-3 py-2 text-foreground whitespace-nowrap">{r.consignee}</td>
                <td className="px-3 py-2 text-foreground tabular-nums text-right whitespace-nowrap">{formatNumber(r.totalWeight)}</td>
                <td className="px-3 py-2 text-foreground whitespace-nowrap">{r.lastStatus}</td>
                <td className="px-3 py-2 text-muted-foreground tabular-nums whitespace-nowrap">{r.lastUpdate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-3 py-1.5 border-t text-[11px] text-muted-foreground shrink-0">
        {rows.length} of {rows.length} records
      </div>
    </div>
  );
};

export default ShipmentTableLite;
