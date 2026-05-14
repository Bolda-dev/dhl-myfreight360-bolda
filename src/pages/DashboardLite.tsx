import Navbar from "@/components/Navbar";
import ShipmentTable from "@/components/ShipmentTable";
import { ModeKPI, DocumentsByConsignee } from "@/components/DashboardWidgets";
import { RefreshCw, Download, Filter } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const DashboardLite = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Navbar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <div className="shrink-0 px-6 pt-4 pb-2">
          <h1 className="text-lg font-semibold text-foreground">Dashboard Lite</h1>
        </div>

        <div className="shrink-0 px-6">
          <div className="flex items-center gap-2 px-1 py-1.5">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="h-7 px-2 rounded flex items-center gap-1.5 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                    <Filter className="w-3.5 h-3.5" />
                    Filters
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Filter dashboard
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex-1" />

            <span className="text-[11px] text-muted-foreground">5 widgets</span>

            <button className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors border">
              <Download className="w-3.5 h-3.5" />
            </button>
            <button className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors border">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <main className="flex-1 min-h-0 overflow-hidden px-6 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 py-2 animate-fade-in h-full">
            {/* Left: 2x2 quad of squares */}
            <div className="grid grid-cols-2 grid-rows-2 gap-4 min-h-0">
              <ModeKPI mode="Air" trendPct={12.3} trendUp variant="compact" title="Air in Transit" />
              <ModeKPI mode="Ocean" trendPct={2.1} trendUp={false} variant="compact" title="Ocean in transit" />
              <ModeKPI mode="Rail" trendPct={5.7} trendUp variant="compact" title="Road in transit" />
              <DocumentsByConsignee variant="minimal" title="Shipments by product" />
            </div>

            {/* Right: full-height table */}
            <div className="min-h-0 flex flex-col bg-card border rounded-xl overflow-hidden">
              <div className="px-4 pt-3 pb-2 border-b shrink-0">
                <h3 className="text-[11px] font-semibold text-muted-foreground tracking-[0.08em] uppercase">
                  Last updated shipments
                </h3>
              </div>
              <div className="flex-1 min-h-0 overflow-auto">
                <ShipmentTable />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLite;