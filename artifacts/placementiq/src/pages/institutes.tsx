import { AppLayout } from "@/components/layout/app-layout";
import { useListInstitutes } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { TierBadge } from "@/components/shared/badges";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, MapPin, Users, Building } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

export default function Institutes() {
  const [search, setSearch] = useState("");
  const { data: institutes, isLoading } = useListInstitutes();

  const filteredInstitutes = institutes?.filter(inst => 
    inst.name.toLowerCase().includes(search.toLowerCase()) || 
    inst.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Partner Institutes</h1>
            <p className="text-muted-foreground mt-1">Track aggregate placement performance across educational partners.</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search institutes by name or city..." 
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[300px]">Institute</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Active Loans</TableHead>
                  <TableHead>6m Placement Rate</TableHead>
                  <TableHead>Avg Salary</TableHead>
                  <TableHead className="text-right">Top Recruiters</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredInstitutes?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No institutes found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInstitutes?.map((institute) => (
                    <TableRow key={institute.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div className="flex items-start gap-3">
                          <div className="bg-primary/10 p-2 rounded-md shrink-0 mt-1">
                            <Building2 className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-sm leading-tight">{institute.name}</span>
                            <div className="flex items-center gap-2">
                              <TierBadge tier={institute.tier} />
                              <span className="text-[10px] text-muted-foreground border border-border px-1.5 py-0.5 rounded">
                                NAAC {institute.naacGrade}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 mr-1" />
                          {institute.city}, {institute.state}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 font-medium">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          {formatNumber(institute.studentCount)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{institute.placementRate6m}%</span>
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${institute.placementRate6m}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {formatCurrency(institute.avgSalary)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5 text-sm font-medium">
                          <Building className="w-4 h-4 text-muted-foreground" />
                          {institute.recruiterCount} companies
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}