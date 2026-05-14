import Navbar from "@/components/Navbar";
import ShipmentTable from "@/components/ShipmentTable";
import { ModeKPI, DocumentsByConsignee } from "@/components/DashboardWidgets";
import { Search, RefreshCw, Download, Filter, LayoutGrid, X } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const DashboardLite = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Navbar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <div className="shrink-0 px-6 pt-4 pb-2">
          <h1 className="text-lg font-semibold text-foreground">Dashboard Lite</h1>
        </div>

        <div className="shrink-0 px-6">
          <div className="flex items-center gap-2 px-1 py-1.5">
            {searchOpen ? (
              <div className="flex items-center gap-1.5 bg-accent rounded px-2 py-1">
                <Search className="w-3.5 h-3.5 text-muted-foreground" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search widgets..."
                  className="bg-transparent text-xs outline-none w-40 placeholder:text-muted-foreground"
                />
                <button
                  onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            )}

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

            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors border">
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Manage widgets
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <button className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors border">
              <Download className="w-3.5 h-3.5" />
            </button>
            <button className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors border">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <main className="flex-1 min-h-0 overflow-auto px-6 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 py-2 animate-fade-in">
            <ModeKPI mode="Air" trendPct={12.3} trendUp variant="compact" />
            <ModeKPI mode="Ocean" trendPct={2.1} trendUp={false} variant="compact" />
            <ModeKPI mode="Rail" trendPct={5.7} trendUp variant="compact" />
            <div className="lg:row-span-2 lg:col-start-4 lg:row-start-1">
              <DocumentsByConsignee variant="minimal" />
            </div>

            <div className="lg:col-span-3 lg:row-start-2 min-h-[400px] flex flex-col bg-card border rounded-xl overflow-hidden">
              <div className="px-4 pt-3 pb-2 border-b">
                <h3 className="text-[11px] font-semibold text-muted-foreground tracking-[0.08em] uppercase">
                  Last updated shipments
                </h3>
              </div>
              <div className="flex-1 min-h-0">
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