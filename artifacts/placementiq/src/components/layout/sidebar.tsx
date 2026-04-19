import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  BellRing, 
  Building2, 
  Settings,
  HelpCircle,
  Briefcase
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/students", icon: Users, label: "Student Portfolio" },
  { href: "/alerts", icon: BellRing, label: "Early Alerts", badge: "New" },
  { href: "/institutes", icon: Building2, label: "Institutes" },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="fixed top-0 left-0 z-40 w-64 h-screen border-r border-border bg-card flex flex-col hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
          <Briefcase className="w-6 h-6" />
          <span>PlacementIQ</span>
        </div>
      </div>
      
      <div className="flex-1 py-6 px-4 flex flex-col gap-1 overflow-y-auto">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
          Menu
        </div>
        
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer group",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-primary/20 text-primary">
                    {item.badge}
                  </Badge>
                )}
              </div>
            </Link>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-border">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer">
            <HelpCircle className="w-5 h-5" />
            <span>Support</span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border flex items-center gap-3 px-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold text-sm">
            JD
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-none">John Doe</span>
            <span className="text-xs text-muted-foreground">Lending Officer</span>
          </div>
        </div>
      </div>
    </aside>
  );
}