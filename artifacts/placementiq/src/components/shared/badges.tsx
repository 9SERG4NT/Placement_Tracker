import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { StudentInstituteTier, StudentRiskBand, AlertSeverity } from "@workspace/api-zod/src/generated/types";
import { 
  BookOpen, 
  FileText, 
  Users, 
  Briefcase, 
  MessageCircle, 
  CreditCard 
} from "lucide-react";

export function RiskBadge({ risk }: { risk: string }) {
  const styles: Record<string, string> = {
    low: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    high: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <Badge variant="outline" className={cn("uppercase text-[10px] font-bold tracking-wider", styles[risk] || styles.medium)}>
      {risk} Risk
    </Badge>
  );
}

export function TierBadge({ tier }: { tier: string }) {
  const styles: Record<string, string> = {
    A: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    B: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    C: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    D: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <Badge variant="outline" className={cn("font-bold", styles[tier] || styles.C)}>
      Tier {tier}
    </Badge>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    critical: "bg-destructive text-destructive-foreground border-transparent",
    high: "bg-orange-500 text-white border-transparent",
    medium: "bg-amber-500 text-white border-transparent",
  };

  return (
    <Badge variant="outline" className={cn("uppercase text-[10px] font-bold tracking-wider", styles[severity] || styles.medium)}>
      {severity}
    </Badge>
  );
}

export function ActionIcon({ type, className }: { type: string, className?: string }) {
  const icons: Record<string, any> = {
    skill_up: BookOpen,
    resume_improvement: FileText,
    mock_interview: Users,
    recruiter_match: Briefcase,
    counselling: MessageCircle,
    emi_restructure: CreditCard,
  };
  
  const Icon = icons[type] || FileText;
  return <Icon className={className} />;
}
