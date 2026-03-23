import dhlLogo from "@/assets/dhl-logo.png";
import { LayoutDashboard, Box, Settings, Bell, User, ChevronDown } from "lucide-react";
import { useState } from "react";
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
    <header className="h-11 bg-navbar border-b border-navbar-border flex items-center px-4 gap-1 shrink-0 z-20">
      {/* Logo + brand */}
      <div className="flex items-center gap-2 mr-6">
        <img src={dhlLogo} alt="DHL" className="h-5 object-contain" />
        <span className="text-sm font-semibold text-navbar-foreground tracking-tight">MyFreight360</span>
      </div>

      {/* Nav items */}
      <nav className="flex items-center gap-0.5 flex-1">
        {navItems.map((item) => (
          <Popover
            key={item.label}
            open={openMenu === item.label}
            onOpenChange={(v) => setOpenMenu(v ? item.label : null)}
          >
            <PopoverTrigger asChild>
              <button
                className={`h-7 px-2.5 rounded flex items-center gap-1.5 text-xs font-medium transition-colors ${
                  openMenu === item.label
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <item.icon className="w-3.5 h-3.5" />
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

      {/* User */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">John Admin</span>
        <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
          <User className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
