import { AppLayout } from "@/components/layout/app-layout";
import { useGetStudent, useRecomputeStudentScore, getGetStudentQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { RiskBadge, TierBadge, ActionIcon } from "@/components/shared/badges";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  ChevronLeft,
  ChevronRight,
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  GraduationCap,
  Briefcase,
  AlertCircle,
  Lightbulb,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";

export default function StudentDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: student, isLoading } = useGetStudent(id, { 
    query: { enabled: !!id } 
  });
  
  const recompute = useRecomputeStudentScore();
  
  const handleRecompute = () => {
    recompute.mutate({ id }, {
      onSuccess: (newData) => {
        toast({
          title: "Score Recomputed",
          description: "Student risk profile has been updated with latest data.",
        });
        queryClient.invalidateQueries({ queryKey: getGetStudentQueryKey(id) });
      },
      onError: () => {
        toast({
          title: "Recomputation failed",
          description: "Could not update the score. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-[200px]" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-[400px] lg:col-span-2" />
            <Skeleton className="h-[400px]" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!student) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold">Student Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested student profile could not be found.</p>
          <Link href="/students">
            <Button>Back to Students</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/students" className="text-muted-foreground hover:text-foreground flex items-center text-sm transition-colors">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Portfolio
              </Link>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{student.name}</h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-muted-foreground text-sm">{student.email}</span>
              <Separator orientation="vertical" className="h-4 hidden sm:block" />
              <RiskBadge risk={student.riskBand} />
              <span className="text-xs text-muted-foreground">
                Last scored: {formatDate(student.lastScoredAt)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleRecompute}
              disabled={recompute.isPending}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${recompute.isPending ? "animate-spin" : ""}`} />
              {recompute.isPending ? "Computing..." : "Recompute Score"}
            </Button>
            <Button>
              Contact Student
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Risk & Predictions */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card className="border-primary/20 shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Placement Probability</CardTitle>
                <CardDescription>AI-modeled likelihood of securing placement post-graduation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ScoreGauge label="3 Months" score={student.placementScore3m} />
                  <ScoreGauge label="6 Months" score={student.placementScore6m} />
                  <ScoreGauge label="12 Months" score={student.placementScore12m} />
                </div>
                
                <Separator className="my-6" />
                
                <div className="flex flex-col sm:flex-row gap-6 justify-between items-center">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Expected Salary Range</h4>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-primary">{formatCurrency(student.expectedSalaryMedian)}</span>
                      <span className="text-sm text-muted-foreground">/ month</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Range: {formatCurrency(student.expectedSalaryLow)} - {formatCurrency(student.expectedSalaryHigh)}
                    </p>
                  </div>
                  
                  <div className="flex-1 bg-muted/50 p-4 rounded-lg border border-border">
                    <h4 className="text-sm font-semibold text-foreground mb-1">Risk Narrative</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {student.riskNarrative}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Positive Factors */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    Top Positive Factors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {student.topPositiveFactors.map((factor, i) => (
                      <div key={i} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{factor.factor}</span>
                          <span className="text-xs font-bold text-emerald-500">+{factor.impact.toFixed(1)}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{factor.description}</span>
                        <Progress value={factor.impact * 10} className="h-1.5 bg-muted [&>div]:bg-emerald-500" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Negative Factors */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-destructive" />
                    Top Risk Factors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {student.topNegativeFactors.map((factor, i) => (
                      <div key={i} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{factor.factor}</span>
                          <span className="text-xs font-bold text-destructive">-{factor.impact.toFixed(1)}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{factor.description}</span>
                        <Progress value={factor.impact * 10} className="h-1.5 bg-muted [&>div]:bg-destructive" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column: Academic Info & Actions */}
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Next Best Actions</CardTitle>
                <CardDescription>AI-recommended interventions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {student.nextBestActions.map((action, i) => (
                    <div key={i} className="p-3 border border-border rounded-lg bg-card hover:bg-muted/30 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-md text-primary mt-0.5">
                          <ActionIcon type={action.type} className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col flex-1 gap-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm">{action.title}</span>
                            <Badge variant="outline" className={cn(
                              "text-[10px]", 
                              action.priority === 'high' ? 'border-destructive text-destructive' : ''
                            )}>
                              {action.priority} priority
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground leading-snug">
                            {action.description}
                          </span>
                          <Button variant="link" size="sm" className="h-6 p-0 justify-start mt-1 text-xs">
                            Initiate Action <ChevronRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-muted-foreground" />
                  Academic Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Institute</span>
                  <div className="text-right">
                    <p className="text-sm font-medium">{student.instituteName}</p>
                    <TierBadge tier={student.instituteTier} />
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Program</span>
                  <span className="text-sm font-medium">{student.program} ({student.courseType})</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">CGPA</span>
                  <span className="text-sm font-medium">{student.cgpa} / 10.0</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Graduation Year</span>
                  <span className="text-sm font-medium">{student.graduationYear}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Loan Amount</span>
                  <span className="text-sm font-bold text-foreground">{formatCurrency(student.loanAmount)}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-muted-foreground" />
                  Employability Factors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Internship</span>
                  <span className="text-sm font-medium">
                    {student.hasInternship ? `${student.internshipMonths} months (${student.internshipEmployerType})` : 'None'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Interview Stage</span>
                  <span className="text-sm font-medium">{student.interviewStage}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Portal Activity</span>
                  <span className="text-sm font-medium">{student.jobPortalActivityScore}/100</span>
                </div>
                <div className="py-2">
                  <span className="text-sm text-muted-foreground block mb-2">Certifications</span>
                  <div className="flex flex-wrap gap-2">
                    {student.certifications.length > 0 ? (
                      student.certifications.map((cert, i) => (
                        <Badge key={i} variant="secondary" className="text-xs font-normal">
                          {cert}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm">None</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function ScoreGauge({ label, score }: { label: string, score: number }) {
  // Determine color based on score (higher is better)
  let colorClass = "text-emerald-500";
  let bgClass = "[&>div]:bg-emerald-500";
  
  if (score < 50) {
    colorClass = "text-destructive";
    bgClass = "[&>div]:bg-destructive";
  } else if (score < 75) {
    colorClass = "text-amber-500";
    bgClass = "[&>div]:bg-amber-500";
  }

  return (
    <div className="flex flex-col items-center p-4 bg-muted/30 rounded-xl border border-border">
      <div className="relative w-24 h-24 flex items-center justify-center mb-2">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle 
            cx="50" cy="50" r="40" 
            stroke="currentColor" 
            strokeWidth="8" 
            fill="transparent" 
            className="text-muted"
          />
          <circle 
            cx="50" cy="50" r="40" 
            stroke="currentColor" 
            strokeWidth="8" 
            fill="transparent" 
            strokeDasharray={251.2} 
            strokeDashoffset={251.2 - (251.2 * score) / 100}
            className={colorClass}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className={`text-2xl font-bold ${colorClass}`}>{score}%</span>
        </div>
      </div>
      <span className="font-semibold text-sm">{label}</span>
    </div>
  );
}