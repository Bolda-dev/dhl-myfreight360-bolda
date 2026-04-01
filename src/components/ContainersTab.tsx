import { useState } from "react";
import type { Container } from "@/data/mockShipments";
import { Table, List, ChevronDown, ChevronRight, Check, Clock, Package } from "lucide-react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

interface Props {
  containers: Container[];
}

const ContainersTab = ({ containers }: Props) => {
  const [view, setView] = useState<"table" | "journey">("table");

  if (containers.length === 0) {
    return <div className="text-center py-8 text-muted-foreground text-sm">No containers</div>;
  }

  const totalWeight = containers.reduce((s, c) => s + c.weightKg, 0);
  const totalVolume = containers.reduce((s, c) => s + c.volumeCbm, 0);

  return (
    <div className="space-y-4">
      {/* View toggle */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {containers.length} Container{containers.length > 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
          <button
            onClick={() => setView("table")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === "table" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Table className="w-3.5 h-3.5" />
            Table
          </button>
          <button
            onClick={() => setView("journey")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === "journey" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <List className="w-3.5 h-3.5" />
            Journey
          </button>
        </div>
      </div>

      {view === "table" ? (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground whitespace-nowrap">No.</th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground whitespace-nowrap">Marks & Numbers</th>
                  <th className="text-center px-3 py-2 font-semibold text-muted-foreground whitespace-nowrap">Qty</th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground whitespace-nowrap">Kind</th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground whitespace-nowrap">Description Of Goods</th>
                  <th className="text-right px-3 py-2 font-semibold text-muted-foreground whitespace-nowrap">Weight (kg)</th>
                  <th className="text-right px-3 py-2 font-semibold text-muted-foreground whitespace-nowrap">Vol (cbm)</th>
                  <th className="text-center px-3 py-2 font-semibold text-muted-foreground whitespace-nowrap">Storage</th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground whitespace-nowrap">Port/Depot</th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground whitespace-nowrap">Customs</th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground whitespace-nowrap">Logistic</th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground whitespace-nowrap">Inland</th>
                </tr>
              </thead>
              <tbody>
                {containers.map((c, i) => (
                  <tr key={i} className={`border-b last:border-b-0 ${i % 2 === 0 ? "bg-background" : "bg-muted/20"}`}>
                    <td className="px-3 py-2.5 text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-foreground">{c.id}</div>
                    </td>
                    <td className="px-3 py-2.5 text-center">{c.quantity}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{c.type}</td>
                    <td className="px-3 py-2.5 max-w-[180px]">
                      <div className="truncate" title={c.descriptionOfGoods}>{c.descriptionOfGoods}</div>
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium">{c.weightKg.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right">{c.volumeCbm}</td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${c.storageStatus === "Okay" ? "bg-success/10 text-success" : c.storageStatus === "Alert" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}`}>
                        {c.storageStatus}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{c.portDepotStatus}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{c.customsStatus}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{c.logisticStatus}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{c.inlandStatus}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/40 border-t font-semibold">
                  <td className="px-3 py-2"></td>
                  <td className="px-3 py-2"></td>
                  <td className="px-3 py-2 text-center">{containers.length}</td>
                  <td className="px-3 py-2"></td>
                  <td className="px-3 py-2"></td>
                  <td className="px-3 py-2 text-right">{totalWeight.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">{totalVolume}</td>
                  <td colSpan={5} className="px-3 py-2"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {containers.map((c, i) => (
            <ContainerJourneyCard key={i} container={c} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};

const ContainerJourneyCard = ({ container: c, index }: { container: Container; index: number }) => {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className="w-full flex items-center gap-3 p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors text-left">
          <div className={`transition-transform ${open ? "rotate-90" : ""}`}>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
          <Package className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground flex-1">{c.id}</span>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-primary/10 text-primary">{c.type}</span>
          <span className="text-xs text-muted-foreground">{c.weightKg.toLocaleString()} kg</span>
          <span className="text-xs text-muted-foreground">{c.volumeCbm} cbm</span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${c.storageStatus === "Okay" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
            {c.storageStatus}
          </span>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-7 mt-1 border rounded-lg p-4 bg-muted/20 space-y-4">
          {/* Details */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div><span className="text-muted-foreground">Goods:</span> <span className="font-medium text-foreground">{c.descriptionOfGoods}</span></div>
            <div><span className="text-muted-foreground">Customs:</span> <span className="font-medium text-foreground">{c.customsStatus}</span></div>
            <div><span className="text-muted-foreground">Port/Depot:</span> <span className="font-medium text-foreground">{c.portDepotStatus}</span></div>
            <div><span className="text-muted-foreground">Logistic:</span> <span className="font-medium text-foreground">{c.logisticStatus}</span></div>
            <div><span className="text-muted-foreground">Inland:</span> <span className="font-medium text-foreground">{c.inlandStatus}</span></div>
          </div>

          {/* Journey timeline */}
          <div>
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Journey</div>
            <div className="space-y-0">
              {c.journey.map((step, j) => (
                <div key={j} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${step.completed ? "border-success bg-success text-white" : "border-muted-foreground/30 text-muted-foreground/40"}`}>
                      {step.completed ? <Check className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                    </div>
                    {j < c.journey.length - 1 && <div className={`w-0.5 h-6 ${step.completed ? "bg-success" : "bg-muted-foreground/20"}`} />}
                  </div>
                  <div className="pb-3">
                    <div className={`text-xs font-semibold ${step.completed ? "text-foreground" : "text-muted-foreground"}`}>{step.status}</div>
                    <div className="text-[10px] text-muted-foreground">{step.location} • {step.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ContainersTab;
