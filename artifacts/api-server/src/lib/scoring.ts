import type { Student } from "@workspace/db";

export interface ScoreInputs {
  cgpa: number;
  instituteTier: string;
  internshipMonths: number;
  internshipEmployerType: string;
  hasInternship: boolean;
  certifications: string[];
  jobPortalActivityScore: number;
  fieldDemandScore: number;
  macroClimateIndex: number;
  placementCellEffectiveness: number;
  instituteAvg3mPlacementRate: number;
  courseType: string;
}

const TIER_WEIGHTS: Record<string, number> = { A: 1.0, B: 0.78, C: 0.55, D: 0.35 };
const EMPLOYER_WEIGHTS: Record<string, number> = { MNC: 1.0, Startup: 0.7, SME: 0.5, None: 0.0 };

const COURSE_SALARY_BASE: Record<string, { low: number; median: number; high: number }> = {
  Engineering: { low: 35000, median: 60000, high: 120000 },
  MBA: { low: 45000, median: 80000, high: 160000 },
  "Computer Science": { low: 40000, median: 70000, high: 150000 },
  "Data Science": { low: 45000, median: 75000, high: 140000 },
  Finance: { low: 40000, median: 65000, high: 130000 },
  Healthcare: { low: 30000, median: 50000, high: 90000 },
  Nursing: { low: 25000, median: 40000, high: 70000 },
  Law: { low: 30000, median: 55000, high: 110000 },
  Design: { low: 25000, median: 45000, high: 90000 },
  Arts: { low: 20000, median: 35000, high: 65000 },
};

export function computeRiskScore(inputs: ScoreInputs): {
  placementScore3m: number;
  placementScore6m: number;
  placementScore12m: number;
  riskBand: "low" | "medium" | "high";
  expectedSalaryLow: number;
  expectedSalaryMedian: number;
  expectedSalaryHigh: number;
  topPositiveFactors: { factor: string; description: string; impact: number }[];
  topNegativeFactors: { factor: string; description: string; impact: number }[];
  riskNarrative: string;
} {
  const cgpaNorm = Math.min(inputs.cgpa / 10.0, 1.0);
  const tierScore = TIER_WEIGHTS[inputs.instituteTier] ?? 0.5;
  const employerWeight = EMPLOYER_WEIGHTS[inputs.internshipEmployerType] ?? 0.0;
  const iqi = inputs.hasInternship
    ? Math.min((inputs.internshipMonths * employerWeight) / 12, 1.0)
    : 0;
  const certBonus = Math.min(inputs.certifications.length * 0.05, 0.2);
  const behaviorScore = inputs.jobPortalActivityScore / 100;
  const demandNorm = inputs.fieldDemandScore / 100;
  const macroNorm = inputs.macroClimateIndex / 100;
  const pcNorm = inputs.placementCellEffectiveness / 100;
  const instPlacement = inputs.instituteAvg3mPlacementRate / 100;

  const baseScore =
    cgpaNorm * 0.18 +
    tierScore * 0.22 +
    iqi * 0.15 +
    certBonus * 0.05 +
    behaviorScore * 0.08 +
    demandNorm * 0.12 +
    macroNorm * 0.07 +
    pcNorm * 0.08 +
    instPlacement * 0.05;

  const p3m = Math.round(Math.min(baseScore * 80, 95));
  const p6m = Math.round(Math.min(baseScore * 110, 98));
  const p12m = Math.round(Math.min(baseScore * 130, 99));

  const riskBand: "low" | "medium" | "high" =
    p6m >= 70 ? "low" : p6m >= 45 ? "medium" : "high";

  const courseSalary = COURSE_SALARY_BASE[inputs.courseType] ?? { low: 30000, median: 50000, high: 90000 };
  const salaryMultiplier = 0.6 + tierScore * 0.5 + cgpaNorm * 0.3;
  const expectedSalaryLow = Math.round(courseSalary.low * salaryMultiplier);
  const expectedSalaryMedian = Math.round(courseSalary.median * salaryMultiplier);
  const expectedSalaryHigh = Math.round(courseSalary.high * salaryMultiplier);

  const factors: { factor: string; description: string; impact: number; positive: boolean }[] = [
    {
      factor: "CGPA Score",
      description: inputs.cgpa >= 8.0 ? `Strong academic record (${inputs.cgpa}/10) indicating high learning capacity` : `Moderate CGPA of ${inputs.cgpa}/10 — could benefit from skill certifications`,
      impact: cgpaNorm * 20,
      positive: inputs.cgpa >= 7.5,
    },
    {
      factor: "Institute Tier",
      description: `Tier-${inputs.instituteTier} institute with ${Math.round(instPlacement * 100)}% average 3-month placement rate`,
      impact: tierScore * 22,
      positive: ["A", "B"].includes(inputs.instituteTier),
    },
    {
      factor: "Internship Experience",
      description: inputs.hasInternship
        ? `${inputs.internshipMonths} months at ${inputs.internshipEmployerType} — practical exposure strengthens employability`
        : "No internship experience detected — critical gap for competitive roles",
      impact: iqi * 15 + 3,
      positive: inputs.hasInternship,
    },
    {
      factor: "Field Demand",
      description: inputs.fieldDemandScore >= 60
        ? `Strong hiring demand in ${inputs.courseType} (demand index: ${inputs.fieldDemandScore}/100)`
        : `Field demand index at ${inputs.fieldDemandScore}/100 — below national average for this discipline`,
      impact: demandNorm * 12,
      positive: inputs.fieldDemandScore >= 60,
    },
    {
      factor: "Job Portal Activity",
      description: inputs.jobPortalActivityScore >= 60
        ? "Active job search behaviour — regular applications and profile updates"
        : "Low job portal engagement — student may not be actively pursuing opportunities",
      impact: behaviorScore * 8,
      positive: inputs.jobPortalActivityScore >= 60,
    },
    {
      factor: "Skill Certifications",
      description: inputs.certifications.length >= 2
        ? `${inputs.certifications.length} relevant certifications demonstrate proactive upskilling`
        : inputs.certifications.length === 1
          ? "1 certification present — additional credentials would improve competitiveness"
          : "No skill certifications — employers increasingly prioritise verified technical skills",
      impact: certBonus * 20 + 2,
      positive: inputs.certifications.length >= 2,
    },
    {
      factor: "Macro Climate",
      description: inputs.macroClimateIndex >= 55
        ? "Favourable macro-economic conditions supporting hiring in this sector"
        : "Challenging macro-economic environment may slow hiring timelines",
      impact: macroNorm * 7,
      positive: inputs.macroClimateIndex >= 55,
    },
    {
      factor: "Placement Cell",
      description: inputs.placementCellEffectiveness >= 60
        ? "Active placement cell with strong recruiter participation — good campus pipeline"
        : "Placement cell activity below benchmark — limited on-campus recruitment support",
      impact: pcNorm * 8,
      positive: inputs.placementCellEffectiveness >= 60,
    },
  ];

  const positives = factors.filter((f) => f.positive).sort((a, b) => b.impact - a.impact).slice(0, 3);
  const negatives = factors.filter((f) => !f.positive).sort((a, b) => b.impact - a.impact).slice(0, 3);

  const riskNarrative = buildNarrative(inputs, riskBand, positives, negatives, p6m);

  return {
    placementScore3m: p3m,
    placementScore6m: p6m,
    placementScore12m: p12m,
    riskBand,
    expectedSalaryLow,
    expectedSalaryMedian,
    expectedSalaryHigh,
    topPositiveFactors: positives.map((f) => ({ factor: f.factor, description: f.description, impact: Math.round(f.impact * 10) / 10 })),
    topNegativeFactors: negatives.map((f) => ({ factor: f.factor, description: f.description, impact: Math.round(f.impact * 10) / 10 })),
    riskNarrative,
  };
}

function buildNarrative(
  inputs: ScoreInputs,
  riskBand: string,
  positives: { factor: string }[],
  negatives: { factor: string }[],
  p6m: number
): string {
  const riskLabel = riskBand === "low" ? "Low" : riskBand === "medium" ? "Medium" : "High";
  const topPos = positives[0]?.factor ?? "academic profile";
  const topNeg = negatives[0]?.factor ?? "limited behavioral signals";

  if (riskBand === "low") {
    return `${riskLabel} placement risk. This student has a strong ${p6m}% probability of securing employment within 6 months. Key strengths include ${topPos.toLowerCase()} and overall market positioning. Lender intervention is not immediately required — standard portfolio monitoring recommended.`;
  } else if (riskBand === "medium") {
    return `${riskLabel} placement risk. Placement probability within 6 months is ${p6m}%. While ${topPos.toLowerCase()} provides a positive foundation, ${topNeg.toLowerCase()} is creating drag on placement readiness. Targeted interventions — particularly skill-up programs and increased job portal engagement — could meaningfully improve outcomes before EMI start.`;
  } else {
    return `${riskLabel} placement risk — early intervention required. At only ${p6m}% placement probability within 6 months, this student is at meaningful risk of delayed placement impacting loan repayment. Primary risk drivers include ${topNeg.toLowerCase()}${negatives[1] ? ` and ${negatives[1].factor.toLowerCase()}` : ""}. Immediate next-best-actions and potential EMI restructuring should be evaluated by the relationship manager.`;
  }
}

export function generateNextBestActions(
  inputs: ScoreInputs,
  riskBand: string
): { type: string; title: string; description: string; priority: string }[] {
  const actions: { type: string; title: string; description: string; priority: string }[] = [];

  if (!inputs.hasInternship || inputs.internshipMonths < 3) {
    actions.push({
      type: "skill_up",
      title: "Industry Project / Internship Programme",
      description: "Connect with a short-term industry project or virtual internship to build practical experience before job applications.",
      priority: riskBand === "high" ? "high" : "medium",
    });
  }

  if (inputs.certifications.length < 2) {
    actions.push({
      type: "skill_up",
      title: `Upskill: ${inputs.courseType} Certification`,
      description: `Pursue 1-2 role-relevant certifications (e.g., AWS, CFA, Google Analytics) to stand out in the ${inputs.courseType} job market.`,
      priority: "high",
    });
  }

  if (inputs.jobPortalActivityScore < 60) {
    actions.push({
      type: "resume_improvement",
      title: "Resume & LinkedIn Optimisation",
      description: "Profile review and keyword optimisation to improve recruiter visibility on Naukri, LinkedIn, and sector-specific portals.",
      priority: riskBand === "high" ? "high" : "medium",
    });
  }

  actions.push({
    type: "mock_interview",
    title: "Mock Interview Coaching",
    description: `Structured mock interview sessions with industry mentors in ${inputs.courseType} to sharpen communication and technical competency.`,
    priority: riskBand === "high" ? "high" : "low",
  });

  if (inputs.fieldDemandScore >= 50) {
    actions.push({
      type: "recruiter_match",
      title: "Recruiter Connect Programme",
      description: "Introduction to pre-screened recruiters actively hiring in the student's field and region through the lender's talent network.",
      priority: "medium",
    });
  }

  if (riskBand === "high") {
    actions.push({
      type: "counselling",
      title: "Career Counselling Session",
      description: "One-on-one career counselling to realign job-search strategy, explore adjacent roles, and set realistic placement timelines.",
      priority: "high",
    });
    actions.push({
      type: "emi_restructure",
      title: "EMI Restructuring Review",
      description: "Evaluate EMI start-date deferment or moratorium options to reduce financial pressure and allow focused job search.",
      priority: "high",
    });
  }

  return actions.slice(0, 6);
}
