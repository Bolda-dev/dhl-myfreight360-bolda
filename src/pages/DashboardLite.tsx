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
          <div className="grid grid-cols-1 lg:grid-cols-5 grid-rows-1 gap-4 py-2 animate-fade-in h-full">
            {/* Left column: 3 slim KPIs on top, pie filling the rest */}
            <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
              <div className="grid grid-cols-3 gap-4 shrink-0">
                <ModeKPI mode="Air" trendPct={12.3} trendUp variant="compact" title="Air in Transit" />
                <ModeKPI mode="Ocean" trendPct={2.1} trendUp={false} variant="compact" title="Ocean in transit" />
                <ModeKPI mode="Rail" trendPct={5.7} trendUp variant="compact" title="Road in transit" />
              </div>
              <div className="flex-1 min-h-0">
                <DocumentsByConsignee variant="minimal" title="Shipments by product" />
              </div>
            </div>

            {/* Right: full-height table */}
            <div className="lg:col-span-3 min-h-0 flex flex-col bg-card border rounded-xl overflow-hidden">
              <div className="flex-1 min-h-0 overflow-hidden">
                <ShipmentTable compactToolbar toolbarTitle="Last updated shipments" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLite;