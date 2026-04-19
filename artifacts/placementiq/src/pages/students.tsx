import { AppLayout } from "@/components/layout/app-layout";
import { useListStudents, useCreateStudent, getListStudentsQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { RiskBadge, TierBadge } from "@/components/shared/badges";
import { Search, SlidersHorizontal, ChevronRight, Download, Plus } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Students() {
  const [search, setSearch] = useState("");
  const [riskBand, setRiskBand] = useState<any>("all");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useListStudents({
    search: search || undefined,
    riskBand: riskBand !== "all" ? riskBand : undefined,
    limit: 50
  });

  const createStudent = useCreateStudent();

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createStudent.mutate({
      data: {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        courseType: formData.get("courseType") as string,
        program: formData.get("program") as string,
        graduationYear: parseInt(formData.get("graduationYear") as string),
        cgpa: parseFloat(formData.get("cgpa") as string),
        instituteId: 1, // hardcoded for demo
        loanAmount: parseInt(formData.get("loanAmount") as string)
      }
    }, {
      onSuccess: () => {
        toast({ title: "Student Added", description: "Successfully created new student record." });
        setOpen(false);
        queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to add student.", variant: "destructive" });
      }
    });
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Student Portfolio</h1>
            <p className="text-muted-foreground mt-1">Monitor placement risk across all active borrowers.</p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Student</DialogTitle>
                  <DialogDescription>
                    Enter the student's academic and loan details to model their initial placement risk.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" name="name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="courseType">Course Type</Label>
                      <Input id="courseType" name="courseType" defaultValue="B.Tech" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="program">Program</Label>
                      <Input id="program" name="program" defaultValue="Computer Science" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="graduationYear">Graduation Year</Label>
                      <Input id="graduationYear" name="graduationYear" type="number" defaultValue="2025" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cgpa">CGPA (0-10)</Label>
                      <Input id="cgpa" name="cgpa" type="number" step="0.1" defaultValue="8.5" required />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="loanAmount">Loan Amount (INR)</Label>
                      <Input id="loanAmount" name="loanAmount" type="number" defaultValue="500000" required />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={createStudent.isPending}>
                      {createStudent.isPending ? "Adding..." : "Add Student"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name, email, or course..." 
                className="pl-9 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground hidden sm:block" />
              <Select value={riskBand} onValueChange={setRiskBand}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Risk Band" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risks</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[250px]">Student</TableHead>
                  <TableHead>Institute</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Loan Amount</TableHead>
                  <TableHead>Risk Band</TableHead>
                  <TableHead>6m Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                      <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : data?.students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No students found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.students.map((student) => (
                    <TableRow key={student.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold">{student.name}</span>
                          <span className="text-xs text-muted-foreground">{student.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm truncate max-w-[200px]" title={student.instituteName}>
                            {student.instituteName}
                          </span>
                          <TierBadge tier={student.instituteTier} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm">{student.program}</span>
                          <span className="text-xs text-muted-foreground">Class of {student.graduationYear}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {formatCurrency(student.loanAmount)}
                      </TableCell>
                      <TableCell>
                        <RiskBadge risk={student.riskBand} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{student.placementScore6m}%</span>
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${student.placementScore6m}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/students/${student.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            View Profile <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {data && data.total > 0 && (
            <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
              <span>Showing {data.students.length} of {data.total} students</span>
              {/* Pagination could go here */}
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}