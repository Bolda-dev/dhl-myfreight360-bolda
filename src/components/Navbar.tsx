import dhlLogo from "@/assets/dhl-logo.png";
import { LayoutDashboard, Box, Settings, Bell, User, ChevronRight } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const navItems = [
  { label: "Dashboards", icon: LayoutDashboard, submenu: ["Overview", "Analytics", "Reports"] },
  { label: "Modules", icon: Box, submenu: ["Shipments", "Warehousing", "Customs"] },
  { label: "Administration", icon: Settings, submenu: ["Users", "Roles", "Settings"] },
  { label: "Notifications", icon: Bell, submenu: ["Alerts", "Messages", "Logs"] },
];

const Navbar = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <aside className="h-full w-14 hover:w-14 bg-sidebar-background border-r border-sidebar-border flex flex-col items-center py-3 gap-1 shrink-0 z-20">
      {/* Logo */}
      <div className="w-9 h-9 flex items-center justify-center mb-4">
        <img src={dhlLogo} alt="DHL" className="w-7 h-7 object-contain" />
      </div>

      {/* Nav items */}
      <TooltipProvider delayDuration={0}>
        <nav className="flex flex-col items-center gap-1 flex-1">
          {navItems.map((item) => (
            <Popover
              key={item.label}
              open={openMenu === item.label}
              onOpenChange={(v) => setOpenMenu(v ? item.label : null)}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <button
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        openMenu === item.label
                          ? "bg-sidebar-accent text-sidebar-primary"
                          : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-primary"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                    </button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  {item.label}
                </TooltipContent>
              </Tooltip>
              <PopoverContent side="right" align="start" className="w-48 p-1.5" sideOffset={8}>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                  {item.label}
                </div>
                {item.submenu.map((sub) => (
                  <button
                    key={sub}
                    className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent transition-colors flex items-center justify-between group"
                    onClick={() => setOpenMenu(null)}
                  >
                    {sub}
                    <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          ))}
        </nav>
      </TooltipProvider>

      {/* User avatar at bottom */}
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-primary transition-colors mt-auto">
              <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            John Admin
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </aside>
  );
};

export default Navbar;
