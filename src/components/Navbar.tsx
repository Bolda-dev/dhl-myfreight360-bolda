import brandLogo from "@/assets/brand-logo.svg";
import { Settings, Bell, User, ChevronDown } from "lucide-react";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const mainNavItems = [
  { label: "Dashboards", submenu: ["Overview", "Analytics", "Reports"] },
  { label: "Modules", submenu: ["Shipments", "Warehousing", "Customs"] },
];

const iconNavItems = [
  { label: "Administration", icon: Settings, submenu: ["Users", "Roles", "Settings"] },
  { label: "Notifications", icon: Bell, submenu: ["Alerts", "Messages", "Logs"] },
];

const Navbar = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <header className="h-11 bg-navbar border-b border-navbar-border flex items-center px-4 gap-1 shrink-0 z-20">
      {/* Logo + brand */}
      <div className="flex items-center mr-6">
        <img src={brandLogo} alt="Brand logo" className="h-6 object-contain" />
      </div>

      {/* Main nav - text only */}
      <nav className="flex items-center gap-0.5 flex-1">
        {mainNavItems.map((item) => (
          <Popover
            key={item.label}
            open={openMenu === item.label}
            onOpenChange={(v) => setOpenMenu(v ? item.label : null)}
          >
            <PopoverTrigger asChild>
              <button
                className={`h-7 px-2.5 rounded flex items-center gap-1 text-xs font-medium transition-colors ${
                  openMenu === item.label
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {item.label}
                <ChevronDown className="w-3 h-3 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-44 p-1" sideOffset={4}>
              {item.submenu.map((sub) => (
                <button
                  key={sub}
                  className="w-full text-left px-2.5 py-1.5 text-xs rounded hover:bg-accent transition-colors text-foreground"
                  onClick={() => setOpenMenu(null)}
                >
                  {sub}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        ))}
      </nav>

      {/* Right side: icon nav + user */}
      <div className="flex items-center gap-1">
        <TooltipProvider delayDuration={0}>
          {iconNavItems.map((item) => (
            <Popover
              key={item.label}
              open={openMenu === item.label}
              onOpenChange={(v) => setOpenMenu(v ? item.label : null)}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <button
                      className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${
                        openMenu === item.label
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                    </button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">{item.label}</TooltipContent>
              </Tooltip>
              <PopoverContent align="end" className="w-44 p-1" sideOffset={4}>
                {item.submenu.map((sub) => (
                  <button
                    key={sub}
                    className="w-full text-left px-2.5 py-1.5 text-xs rounded hover:bg-accent transition-colors text-foreground"
                    onClick={() => setOpenMenu(null)}
                  >
                    {sub}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          ))}
        </TooltipProvider>

        <div className="w-px h-5 bg-border mx-1" />

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">John Admin</span>
          <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
