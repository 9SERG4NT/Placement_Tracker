import { AppLayout } from "@/components/layout/app-layout";
import { useGetDashboardSummary, useGetPlacementTrends, useGetSalaryDistribution, useGetCohortBreakdown, useListAlerts } from "@workspace/api-client-react";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  TrendingDown, 
  AlertTriangle, 
  BriefcaseIcon,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { RiskBadge, SeverityBadge } from "@/components/shared/badges";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: trends, isLoading: loadingTrends } = useGetPlacementTrends();
  const { data: salaries, isLoading: loadingSalaries } = useGetSalaryDistribution();
  const { data: cohort, isLoading: loadingCohort } = useGetCohortBreakdown();
  const { data: alertsRes, isLoading: loadingAlerts } = useListAlerts({ status: "active", page: 1 });

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Portfolio risk overview and early warning indicators.</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard 
            title="Total Students" 
            value={summary?.totalStudents ? formatNumber(summary.totalStudents) : "---"} 
            icon={Users}
            loading={loadingSummary}
            trend="+12%"
            trendUp={true}
          />
          <KpiCard 
            title="High Risk Portfolio" 
            value={summary?.atRiskPortfolioValue ? formatCurrency(summary.atRiskPortfolioValue) : "---"} 
            icon={AlertTriangle}
            loading={loadingSummary}
            trend="-2.4%"
            trendUp={true} // Lower risk is good
            description={`${summary?.highRiskCount || 0} students`}
            alert={true}
          />
          <KpiCard 
            title="Avg 6m Placement Rate" 
            value={summary?.avgPlacementScore6m ? `${summary.avgPlacementScore6m}%` : "---"} 
            icon={BriefcaseIcon}
            loading={loadingSummary}
            trend="+4.1%"
            trendUp={true}
          />
          <KpiCard 
            title="Active Alerts" 
            value={summary?.activeAlerts ? formatNumber(summary.activeAlerts) : "---"} 
            icon={Activity}
            loading={loadingSummary}
            trend="+14"
            trendUp={false}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Placement Trends (3m, 6m, 12m)</CardTitle>
              <CardDescription>Historical placement rates across the portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTrends ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trends?.monthly} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                      <Line type="monotone" dataKey="placed3m" name="3 Months" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="placed6m" name="6 Months" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="placed12m" name="12 Months" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Risk Donut */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
              <CardDescription>Current portfolio health</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              {loadingSummary ? (
                <Skeleton className="h-[250px] w-[250px] rounded-full" />
              ) : (
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Low Risk', value: summary?.lowRiskCount || 0, color: 'hsl(var(--chart-2))' },
                          { name: 'Medium Risk', value: summary?.mediumRiskCount || 0, color: 'hsl(var(--chart-4))' },
                          { name: 'High Risk', value: summary?.highRiskCount || 0, color: 'hsl(var(--destructive))' },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {
                          [
                            { color: 'hsl(var(--chart-1))' }, // using primary for low risk instead of chart-2
                            { color: 'hsl(var(--chart-2))' }, // amber for medium
                            { color: 'hsl(var(--destructive))' }, // red for high
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))
                        }
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      />
                      <Legend iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cohort Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Cohort Risk by Field</CardTitle>
              <CardDescription>Risk band distribution across study fields</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingCohort ? (
                <Skeleton className="h-[250px] w-full" />
              ) : (
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cohort?.byField} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="field" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="low" stackId="a" name="Low Risk" fill="hsl(var(--chart-1))" radius={[0, 0, 4, 4]} barSize={30} />
                      <Bar dataKey="medium" stackId="a" name="Medium Risk" fill="hsl(var(--chart-2))" barSize={30} />
                      <Bar dataKey="high" stackId="a" name="High Risk" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Salary Dist Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Salary Expectations by Field</CardTitle>
              <CardDescription>Median projected INR/month</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSalaries ? (
                <Skeleton className="h-[250px] w-full" />
              ) : (
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salaries?.byField} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(val) => `₹${val/1000}k`} />
                      <YAxis type="category" dataKey="field" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                      <Tooltip 
                        cursor={{ fill: 'hsl(var(--muted))' }}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                        formatter={(value: number) => [formatCurrency(value), 'Median Salary']}
                      />
                      <Bar dataKey="salaryMedian" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

function KpiCard({ title, value, icon: Icon, loading, trend, trendUp, description, alert }: any) {
  return (
    <Card className={cn(alert && "border-destructive/50 shadow-sm shadow-destructive/10")}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-3xl font-bold tracking-tight">{value}</p>
            )}
          </div>
          <div className={cn("p-2 rounded-md", alert ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary")}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        {(trend || description) && (
          <div className="mt-4 flex items-center text-xs">
            {trend && (
              <span className={cn("flex items-center font-medium", trendUp ? "text-emerald-500" : "text-destructive")}>
                {trendUp ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {trend}
              </span>
            )}
            {trend && description && <span className="text-muted-foreground mx-2">•</span>}
            {description && <span className="text-muted-foreground">{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}