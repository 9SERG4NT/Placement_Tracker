import { Bell, Search, Menu, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useHealthCheck } from "@workspace/api-client-react";

export function Topbar() {
  const { data: health, isError } = useHealthCheck({
    query: { refetchInterval: 60000 }
  });

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="w-5 h-5" />
        </Button>
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search students, institutes..."
            className="w-full bg-muted/50 border-none pl-9 focus-visible:ring-1 focus-visible:bg-background"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 mr-2">
          <div className={`w-2 h-2 rounded-full ${isError ? 'bg-destructive' : 'bg-emerald-500'}`} />
          <span className="text-xs text-muted-foreground hidden sm:inline-block">API {isError ? 'Offline' : 'Online'}</span>
        </div>
        <div className="text-sm font-medium text-muted-foreground hidden lg:block mr-2">
          Portfolio: Q3 Education Loans
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive border-2 border-card"></span>
        </Button>
      </div>
    </header>
  );
}