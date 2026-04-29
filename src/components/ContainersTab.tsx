import { useState } from "react";
import type { Container, ContainerEvent } from "@/data/mockShipments";
import { Table, List, ChevronRight, Check, Clock, Package, Minus } from "lucide-react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  containers: Container[];
  isAir?: boolean;
}

const ContainersTab = ({ containers, isAir = false }: Props) => {
  const [view, setView] = useState<"table" | "journey">("table");

  if (containers.length === 0) {
    return <div className="text-center py-8 text-muted-foreground text-sm">No {isAir ? "packages" : "containers"}</div>;
  }

  const totalWeight = containers.reduce((s, c) => s + c.weightKg, 0);
  const totalChargeable = containers.reduce((s, c) => s + c.chargeableKg, 0);
  const totalPieces = containers.reduce((s, c) => s + c.pieces, 0);

  return (
    <div className="space-y-4">
      {/* View toggle */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {containers.length} {isAir ? "Package" : "Container"}{containers.length > 1 ? "s" : ""}
        </span>
        {!isAir && (
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
        )}
      </div>

      {isAir ? (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground whitespace-nowrap">No.</th>
                  <th className="text-right px-3 py-2 font-semibold text-muted-foreground whitespace-nowrap">Pieces</th>
                  <th className="text-right px-3 py-2 font-semibold text-muted-foreground whitespace-nowrap">Weight (kg)</th>
                  <th className="text-right px-3 py-2 font-semibold text-muted-foreground whitespace-nowrap">Chargeable (kg)</th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground whitespace-nowrap">Goods</th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground whitespace-nowrap">Dimensions</th>
                </tr>
              </thead>
              <tbody>
                {containers.map((c, i) => (
                  <tr key={i} className={`border-b last:border-b-0 ${i % 2 === 0 ? "bg-background" : "bg-muted/20"}`}>
                    <td className="px-3 py-2.5 text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-2.5 text-right font-medium">{c.pieces.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right font-medium">{c.weightKg.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right font-medium">{c.chargeableKg.toLocaleString()}</td>
                    <td className="px-3 py-2.5 max-w-[260px]"><div className="truncate" title={c.descriptionOfGoods}>{c.descriptionOfGoods}</div></td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{c.dimensions ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/40 border-t font-semibold">
                  <td className="px-3 py-2 text-muted-foreground" colSpan={1}>{containers.length} pkg{containers.length > 1 ? "s" : ""}</td>
                  <td className="px-3 py-2 text-right">{totalPieces.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">{totalWeight.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">{totalChargeable.toLocaleString()}</td>
                  <td className="px-3 py-2"></td>
                  <td className="px-3 py-2"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : view === "table" ? (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground whitespace-nowrap">No.</th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground whitespace-nowrap">Marks & Numbers</th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground whitespace-nowrap">Kind</th>
                  {EVENT_DEFS.map((def) => (
                    <th key={def.key} className="text-left px-3 py-2 font-semibold text-muted-foreground whitespace-nowrap">{def.label}</th>
                  ))}
                  <th className="text-right px-3 py-2 font-semibold text-muted-foreground whitespace-nowrap">Pieces</th>
                  <th className="text-right px-3 py-2 font-semibold text-muted-foreground whitespace-nowrap">Weight (kg)</th>
                  <th className="text-right px-3 py-2 font-semibold text-muted-foreground whitespace-nowrap">Chargeable (kg)</th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground whitespace-nowrap">Description Of Goods</th>
                </tr>
              </thead>
              <tbody>
                {containers.map((c, i) => (
                  <tr key={i} className={`border-b last:border-b-0 ${i % 2 === 0 ? "bg-background" : "bg-muted/20"}`}>
                    <td className="px-3 py-2.5 text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-foreground">{c.id}</div>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{c.type}</td>
                    {EVENT_DEFS.map((def) => {
                      const e = c.events?.[def.key];
                      return <td key={def.key} className="px-3 py-2.5 whitespace-nowrap"><EventCell e={e} /></td>;
                    })}
                    <td className="px-3 py-2.5 text-right font-medium">{c.pieces.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right font-medium">{c.weightKg.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right font-medium">{c.chargeableKg.toLocaleString()}</td>
                    <td className="px-3 py-2.5 max-w-[180px]">
                      <div className="truncate" title={c.descriptionOfGoods}>{c.descriptionOfGoods}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/40 border-t font-semibold">
                  <td className="px-3 py-2"></td>
                  <td className="px-3 py-2 text-muted-foreground">{containers.length} container{containers.length > 1 ? "s" : ""}</td>
                  <td className="px-3 py-2"></td>
                  <td colSpan={EVENT_DEFS.length} className="px-3 py-2"></td>
                  <td className="px-3 py-2 text-right">{totalPieces.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">{totalWeight.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">{totalChargeable.toLocaleString()}</td>
                  <td className="px-3 py-2"></td>
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
          <span className="text-xs text-muted-foreground">{c.pieces.toLocaleString()} pcs</span>
          <span className="text-xs text-muted-foreground">{c.weightKg.toLocaleString()} kg</span>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-7 mt-1 border rounded-lg p-4 bg-muted/20 space-y-4">
          {/* Details — mirrors the table columns */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div><span className="text-muted-foreground">Kind:</span> <span className="font-medium text-foreground">{c.type}</span></div>
            <div><span className="text-muted-foreground">Pieces:</span> <span className="font-medium text-foreground">{c.pieces.toLocaleString()}</span></div>
            <div><span className="text-muted-foreground">Weight:</span> <span className="font-medium text-foreground">{c.weightKg.toLocaleString()} kg</span></div>
            <div><span className="text-muted-foreground">Chargeable:</span> <span className="font-medium text-foreground">{c.chargeableKg.toLocaleString()} kg</span></div>
            <div className="col-span-2"><span className="text-muted-foreground">Goods:</span> <span className="font-medium text-foreground">{c.descriptionOfGoods}</span></div>
            {c.dimensions && <div className="col-span-3"><span className="text-muted-foreground">Dimensions:</span> <span className="font-medium text-foreground">{c.dimensions}</span></div>}
          </div>

          {/* Journey timeline — driven by the same 5 events shown in the table */}
          {c.events && (
            <div>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Journey</div>
              <div className="space-y-0">
                {EVENT_DEFS.map((def, j) => {
                  const e = c.events?.[def.key];
                  const status = e?.status ?? "pending";
                  const isDone = status === "completed";
                  const isCurrent = status === "current";
                  const isLast = j === EVENT_DEFS.length - 1;
                  return (
                    <div key={def.key} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                          isDone ? "border-success bg-success text-white"
                          : isCurrent ? "border-primary bg-primary text-white"
                          : "border-muted-foreground/30 text-muted-foreground/40"
                        }`}>
                          {isDone ? <Check className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                        </div>
                        {!isLast && <div className={`w-0.5 h-6 ${isDone ? "bg-success" : "bg-muted-foreground/20"}`} />}
                      </div>
                      <div className="pb-3">
                        <div className={`text-xs font-semibold ${isDone || isCurrent ? "text-foreground" : "text-muted-foreground"}`}>
                          {def.label}
                        </div>
                        <div className="text-[10px] text-muted-foreground leading-relaxed">
                          {(e?.location || e?.countryCode) && (
                            <span>
                              {e?.location}
                              {e?.location && e?.countryCode ? ", " : ""}
                              {e?.countryCode && <span className="font-semibold tracking-wider">{e.countryCode}</span>}
                            </span>
                          )}
                          {(e?.date || e?.time) && (
                            <>
                              {(e?.location || e?.countryCode) && " • "}
                              <span>{e?.date}{e?.time ? ` · ${e.time}` : ""}</span>
                            </>
                          )}
                          {!e?.date && !e?.time && !e?.location && status === "pending" && "—"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ContainersTab;

const EVENT_DEFS: { key: keyof NonNullable<Container["events"]>; label: string }[] = [
  { key: "gateIn", label: "GATE IN" },
  { key: "loaded", label: "LOADED" },
  { key: "unloaded", label: "UNLOADED" },
  { key: "gateOut", label: "GATE OUT" },
  { key: "emptyReturn", label: "EMPTY RETURN" },
];

const EventCell = ({ e }: { e?: ContainerEvent }) => {
  if (!e) return <Minus className="w-3 h-3 text-muted-foreground/50" />;

  if (e.status === "pending") {
    return (
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex"><Minus className="w-3 h-3 text-muted-foreground/50" /></div>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-[11px] max-w-[280px] whitespace-normal break-words">
            <div className="font-semibold">Pending</div>
            {e.location && <div className="text-muted-foreground">{e.location}{e.countryCode ? `, ${e.countryCode}` : ""}</div>}
            {e.note && <div className="text-muted-foreground mt-1">{e.note}</div>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const isDone = e.status === "completed";
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 cursor-default">
            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${isDone ? "bg-success text-white" : "bg-primary text-white"}`}>
              {isDone ? <Check className="w-2 h-2" /> : <Clock className="w-2 h-2" />}
            </div>
            <div className="leading-tight">
              {e.countryCode && (
                <div className={`text-[11px] font-semibold leading-tight ${isDone ? "text-foreground" : "text-primary"}`}>
                  {e.countryCode}
                </div>
              )}
              <div className="text-[10px] font-normal text-muted-foreground leading-tight">
                {e.date ?? ""}{e.time ? ` · ${e.time}` : ""}
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-[11px] max-w-[280px] whitespace-normal break-words">
          <div className="font-semibold">{isDone ? "Completed" : "In progress"}</div>
          {e.location && <div className="text-muted-foreground">{e.location}{e.countryCode ? `, ${e.countryCode}` : ""}</div>}
          {(e.date || e.time) && <div className="text-muted-foreground">{[e.date, e.time].filter(Boolean).join(" · ")}</div>}
          {e.vessel && <div className="text-muted-foreground">Vessel: {e.vessel}</div>}
          {e.reference && <div className="text-muted-foreground">Ref: {e.reference}</div>}
          {e.note && <div className="text-muted-foreground mt-1">{e.note}</div>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
