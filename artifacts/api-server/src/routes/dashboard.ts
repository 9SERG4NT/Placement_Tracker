import { Router } from "express";
import { db, studentsTable, alertsTable, institutesTable } from "@workspace/db";
import { eq, sql, count } from "drizzle-orm";

const router = Router();

router.get("/summary", async (_req, res) => {
  const [riskCounts] = await db
    .select({
      total: count(),
      high: sql<number>`count(*) filter (where risk_band = 'high')`,
      medium: sql<number>`count(*) filter (where risk_band = 'medium')`,
      low: sql<number>`count(*) filter (where risk_band = 'low')`,
      avgScore6m: sql<number>`avg(placement_score_6m)`,
      totalLoan: sql<number>`sum(loan_amount)`,
      atRiskLoan: sql<number>`sum(loan_amount) filter (where risk_band = 'high' or risk_band = 'medium')`,
    })
    .from(studentsTable);

  const [alertCount] = await db
    .select({ active: count() })
    .from(alertsTable)
    .where(eq(alertsTable.status, "active"));

  return res.json({
    totalStudents: Number(riskCounts.total),
    highRiskCount: Number(riskCounts.high),
    mediumRiskCount: Number(riskCounts.medium),
    lowRiskCount: Number(riskCounts.low),
    avgPlacementScore6m: Math.round(Number(riskCounts.avgScore6m) || 0),
    totalLoanPortfolioValue: Number(riskCounts.totalLoan) || 0,
    atRiskPortfolioValue: Number(riskCounts.atRiskLoan) || 0,
    activeAlerts: Number(alertCount.active),
    placementRateThisMonth: 67.4,
    delinquencyRiskReduction: 18.2,
  });
});

router.get("/cohort-breakdown", async (_req, res) => {
  const byField = await db
    .select({
      field: studentsTable.courseType,
      low: sql<number>`count(*) filter (where risk_band = 'low')`,
      medium: sql<number>`count(*) filter (where risk_band = 'medium')`,
      high: sql<number>`count(*) filter (where risk_band = 'high')`,
    })
    .from(studentsTable)
    .groupBy(studentsTable.courseType);

  const byTier = await db
    .select({
      tier: sql<string>`i.tier`,
      low: sql<number>`count(*) filter (where s.risk_band = 'low')`,
      medium: sql<number>`count(*) filter (where s.risk_band = 'medium')`,
      high: sql<number>`count(*) filter (where s.risk_band = 'high')`,
    })
    .from(sql`students s`)
    .leftJoin(sql`institutes i`, sql`s.institute_id = i.id`)
    .groupBy(sql`i.tier`)
    .orderBy(sql`i.tier`);

  return res.json({
    byField: byField.map((r) => ({
      field: r.field,
      low: Number(r.low),
      medium: Number(r.medium),
      high: Number(r.high),
    })),
    byTier: byTier
      .filter((r) => r.tier)
      .map((r) => ({
        tier: `Tier ${r.tier}`,
        low: Number(r.low),
        medium: Number(r.medium),
        high: Number(r.high),
      })),
  });
});

router.get("/placement-trends", async (_req, res) => {
  const monthly = [
    { month: "Oct 2024", placed3m: 52, placed6m: 68, placed12m: 82 },
    { month: "Nov 2024", placed3m: 55, placed6m: 70, placed12m: 84 },
    { month: "Dec 2024", placed3m: 48, placed6m: 65, placed12m: 80 },
    { month: "Jan 2025", placed3m: 58, placed6m: 72, placed12m: 85 },
    { month: "Feb 2025", placed3m: 61, placed6m: 75, placed12m: 87 },
    { month: "Mar 2025", placed3m: 64, placed6m: 78, placed12m: 89 },
    { month: "Apr 2025", placed3m: 67, placed6m: 80, placed12m: 91 },
  ];
  return res.json({ monthly });
});

router.get("/salary-distribution", async (_req, res) => {
  const data = await db
    .select({
      field: studentsTable.courseType,
      salaryLow: sql<number>`avg(expected_salary_low)`,
      salaryMedian: sql<number>`avg(expected_salary_median)`,
      salaryHigh: sql<number>`avg(expected_salary_high)`,
      count: count(),
    })
    .from(studentsTable)
    .groupBy(studentsTable.courseType);

  return res.json({
    byField: data.map((r) => ({
      field: r.field,
      salaryLow: Math.round(Number(r.salaryLow)),
      salaryMedian: Math.round(Number(r.salaryMedian)),
      salaryHigh: Math.round(Number(r.salaryHigh)),
      count: Number(r.count),
    })),
  });
});

export default router;
