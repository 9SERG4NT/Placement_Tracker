import { AppLayout } from "@/components/layout/app-layout";
import { useListAlerts, useAcknowledgeAlert, getListAlertsQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SeverityBadge, RiskBadge } from "@/components/shared/badges";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  TrendingDown,
  Building
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Alerts() {
  const [status, setStatus] = useState<"active" | "acknowledged" | "resolved">("active");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useListAlerts({ status, page: 1 });
  const acknowledge = useAcknowledgeAlert();

  const handleAcknowledge = (id: number) => {
    acknowledge.mutate({ id }, {
      onSuccess: () => {
        toast({
          title: "Alert Acknowledged",
          description: "The alert has been marked as acknowledged.",
        });
        queryClient.invalidateQueries({ queryKey: getListAlertsQueryKey({ status, page: 1 }) });
      }
    });
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Early Alerts</h1>
            <p className="text-muted-foreground mt-1">Actionable intelligence for high-risk accounts.</p>
          </div>
        </div>

        <Tabs value={status} onValueChange={(v: any) => setStatus(v)} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="acknowledged">Acknowledged</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col gap-4">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                    <div className="flex gap-4">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                    <Skeleton className="h-10 w-[120px]" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : data?.alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-muted/20 rounded-lg border border-dashed border-border text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />
              <h3 className="text-lg font-semibold">No {status} alerts</h3>
              <p className="text-muted-foreground mt-1">Your portfolio is looking good right now.</p>
            </div>
          ) : (
            data?.alerts.map((alert) => (
              <Card key={alert.id} className="overflow-hidden border-l-4 transition-all hover:shadow-md" style={{
                borderLeftColor: alert.severity === 'critical' ? 'hsl(var(--destructive))' : 
                                 alert.severity === 'high' ? '#f97316' : '#f59e0b'
              }}>
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row md:items-stretch">
                    <div className="flex-1 p-5 md:p-6 flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 mb-1">
                            <SeverityBadge severity={alert.severity} />
                            <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                              {alert.alertType.replace(/_/g, ' ').toUpperCase()}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center ml-2">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatDate(alert.createdAt)}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold">{alert.message}</h3>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 bg-muted/30 p-3 rounded-md">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                            {alert.studentName.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <Link href={`/students/${alert.studentId}`} className="text-sm font-semibold hover:underline">
                              {alert.studentName}
                            </Link>
                            <span className="text-xs text-muted-foreground flex items-center">
                              <Building className="w-3 h-3 mr-1" />
                              {alert.instituteName}
                            </span>
                          </div>
                        </div>
                        
                        <div className="hidden sm:block w-px h-8 bg-border"></div>
                        
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground mb-0.5">Current Risk</span>
                          <RiskBadge risk={alert.riskBand} />
                        </div>
                        
                        <div className="hidden sm:block w-px h-8 bg-border"></div>
                        
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground mb-0.5">EMI Starts In</span>
                          <span className="text-sm font-bold text-destructive flex items-center">
                            {alert.daysToEmiStart} days
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-muted/50 p-5 md:p-6 md:w-48 flex flex-row md:flex-col items-center md:items-stretch justify-end md:justify-center gap-2 border-t md:border-t-0 md:border-l border-border">
                      {status === 'active' && (
                        <Button 
                          className="w-full" 
                          onClick={() => handleAcknowledge(alert.id)}
                          disabled={acknowledge.isPending}
                        >
                          Acknowledge
                        </Button>
                      )}
                      <Link href={`/students/${alert.studentId}`} className="w-full md:w-auto">
                        <Button variant="outline" className="w-full">
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}