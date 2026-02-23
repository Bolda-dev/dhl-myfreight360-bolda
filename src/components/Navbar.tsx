import dhlLogo from "@/assets/dhl-logo.png";
import { ChevronDown, User } from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Dashboards", hasDropdown: true },
  { label: "Modules", hasDropdown: true },
  { label: "Administration", hasDropdown: true },
  { label: "Notifications", hasDropdown: true },
];

const Navbar = () => {
  const [activeItem, setActiveItem] = useState<string | null>(null);

  return (
    <header className="h-14 border-b border-navbar-border bg-card flex items-center px-6 justify-between shrink-0">
      <div className="flex items-center gap-3">
        <img src={dhlLogo} alt="DHL" className="h-7 object-contain" />
        <span className="text-base font-semibold text-foreground tracking-tight">
          MyFreight360
        </span>
      </div>

      <nav className="hidden md:flex items-center gap-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setActiveItem(activeItem === item.label ? null : item.label)}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded transition-colors"
          >
            {item.label}
            {item.hasDropdown && <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-accent transition-colors cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="text-sm font-medium text-foreground hidden sm:inline">
            John Admin
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
