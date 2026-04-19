import { Router } from "express";
import { db, studentsTable, institutesTable } from "@workspace/db";
import { eq, like, and, sql } from "drizzle-orm";
import { CreateStudentBody, ListStudentsQueryParams, GetStudentParams } from "@workspace/api-zod";
import { computeRiskScore, generateNextBestActions } from "../lib/scoring.js";

const router = Router();

router.get("/", async (req, res) => {
  const parsed = ListStudentsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid query params" });
  }
  const { riskBand, instituteId, search, page = 1, limit = 20 } = parsed.data;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (riskBand) conditions.push(eq(studentsTable.riskBand, riskBand));
  if (instituteId) conditions.push(eq(studentsTable.instituteId, instituteId));
  if (search) conditions.push(like(studentsTable.name, `%${search}%`));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [students, institutes, countResult] = await Promise.all([
    db
      .select()
      .from(studentsTable)
      .leftJoin(institutesTable, eq(studentsTable.instituteId, institutesTable.id))
      .where(whereClause)
      .limit(limit)
      .offset(offset),
    db.select().from(institutesTable),
    db
      .select({ count: sql<number>`count(*)` })
      .from(studentsTable)
      .where(whereClause),
  ]);

  const instituteMap = new Map(institutes.map((i) => [i.id, i]));
  const total = Number(countResult[0]?.count ?? 0);

  const result = students.map(({ students: s }) => {
    const inst = instituteMap.get(s.instituteId);
    return formatStudent(s, inst ?? null);
  });

  return res.json({ students: result, total, page, limit });
});

router.post("/", async (req, res) => {
  const parsed = CreateStudentBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid body", details: parsed.error.issues });
  }
  const body = parsed.data;

  const institute = await db.query.institutesTable.findFirst({
    where: eq(institutesTable.id, body.instituteId),
  });
  if (!institute) {
    return res.status(400).json({ error: "Institute not found" });
  }

  const certifications = body.certifications ?? [];
  const scoreInputs = {
    cgpa: body.cgpa,
    instituteTier: institute.tier,
    internshipMonths: body.internshipMonths ?? 0,
    internshipEmployerType: body.internshipEmployerType ?? "None",
    hasInternship: (body.internshipMonths ?? 0) > 0,
    certifications,
    jobPortalActivityScore: 30,
    fieldDemandScore: 55,
    macroClimateIndex: 58,
    placementCellEffectiveness: institute.placementRate6m * 100,
    instituteAvg3mPlacementRate: institute.placementRate3m,
    courseType: body.courseType,
  };

  const score = computeRiskScore(scoreInputs);

  const [inserted] = await db
    .insert(studentsTable)
    .values({
      name: body.name,
      email: body.email,
      courseType: body.courseType,
      program: body.program,
      graduationYear: body.graduationYear,
      cgpa: body.cgpa,
      instituteId: body.instituteId,
      loanAmount: body.loanAmount,
      internshipMonths: body.internshipMonths ?? 0,
      internshipEmployerType: body.internshipEmployerType ?? "None",
      hasInternship: (body.internshipMonths ?? 0) > 0,
      certifications: JSON.stringify(certifications),
      jobPortalActivityScore: 30,
      fieldDemandScore: 55,
      macroClimateIndex: 58,
      placementCellEffectiveness: institute.placementRate6m * 100,
      ...score,
    })
    .returning();

  return res.status(201).json(formatStudent(inserted, institute));
});

router.get("/:id", async (req, res) => {
  const parsed = GetStudentParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid id" });
  }

  const student = await db.query.studentsTable.findFirst({
    where: eq(studentsTable.id, parsed.data.id),
  });
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  const institute = await db.query.institutesTable.findFirst({
    where: eq(institutesTable.id, student.instituteId),
  });

  const certifications = JSON.parse(student.certifications || "[]") as string[];
  const scoreInputs = {
    cgpa: student.cgpa,
    instituteTier: institute?.tier ?? "C",
    internshipMonths: student.internshipMonths,
    internshipEmployerType: student.internshipEmployerType,
    hasInternship: student.hasInternship,
    certifications,
    jobPortalActivityScore: student.jobPortalActivityScore,
    fieldDemandScore: student.fieldDemandScore,
    macroClimateIndex: student.macroClimateIndex,
    placementCellEffectiveness: student.placementCellEffectiveness,
    instituteAvg3mPlacementRate: institute?.placementRate3m ?? 0.5,
    courseType: student.courseType,
  };

  const scoreDetails = computeRiskScore(scoreInputs);
  const nextBestActions = generateNextBestActions(scoreInputs, student.riskBand);

  return res.json({
    ...formatStudent(student, institute ?? null),
    internshipMonths: student.internshipMonths,
    internshipEmployerType: student.internshipEmployerType,
    hasInternship: student.hasInternship,
    certifications,
    jobPortalActivityScore: student.jobPortalActivityScore,
    interviewStage: student.interviewStage,
    fieldDemandScore: student.fieldDemandScore,
    macroClimateIndex: student.macroClimateIndex,
    placementCellEffectiveness: student.placementCellEffectiveness,
    instituteAvg3mPlacementRate: institute?.placementRate3m ?? 0.5,
    topPositiveFactors: scoreDetails.topPositiveFactors,
    topNegativeFactors: scoreDetails.topNegativeFactors,
    nextBestActions,
    riskNarrative: scoreDetails.riskNarrative,
  });
});

router.post("/:id/score", async (req, res) => {
  const id = Number(req.params.id);
  const student = await db.query.studentsTable.findFirst({
    where: eq(studentsTable.id, id),
  });
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  const institute = await db.query.institutesTable.findFirst({
    where: eq(institutesTable.id, student.instituteId),
  });

  const certifications = JSON.parse(student.certifications || "[]") as string[];
  const scoreInputs = {
    cgpa: student.cgpa,
    instituteTier: institute?.tier ?? "C",
    internshipMonths: student.internshipMonths,
    internshipEmployerType: student.internshipEmployerType,
    hasInternship: student.hasInternship,
    certifications,
    jobPortalActivityScore: student.jobPortalActivityScore,
    fieldDemandScore: student.fieldDemandScore,
    macroClimateIndex: student.macroClimateIndex,
    placementCellEffectiveness: student.placementCellEffectiveness,
    instituteAvg3mPlacementRate: institute?.placementRate3m ?? 0.5,
    courseType: student.courseType,
  };

  const score = computeRiskScore(scoreInputs);

  const [updated] = await db
    .update(studentsTable)
    .set({ ...score, lastScoredAt: new Date() })
    .where(eq(studentsTable.id, id))
    .returning();

  return res.json({
    studentId: updated.id,
    riskBand: updated.riskBand,
    placementScore3m: updated.placementScore3m,
    placementScore6m: updated.placementScore6m,
    placementScore12m: updated.placementScore12m,
    expectedSalaryLow: updated.expectedSalaryLow,
    expectedSalaryMedian: updated.expectedSalaryMedian,
    expectedSalaryHigh: updated.expectedSalaryHigh,
    scoredAt: updated.lastScoredAt.toISOString(),
  });
});

function formatStudent(s: typeof studentsTable.$inferSelect, inst: typeof institutesTable.$inferSelect | null) {
  return {
    id: s.id,
    name: s.name,
    email: s.email,
    courseType: s.courseType,
    program: s.program,
    graduationYear: s.graduationYear,
    cgpa: s.cgpa,
    instituteId: s.instituteId,
    instituteName: inst?.name ?? "Unknown",
    instituteTier: inst?.tier ?? "C",
    loanAmount: s.loanAmount,
    riskBand: s.riskBand,
    placementScore3m: s.placementScore3m,
    placementScore6m: s.placementScore6m,
    placementScore12m: s.placementScore12m,
    expectedSalaryLow: s.expectedSalaryLow,
    expectedSalaryMedian: s.expectedSalaryMedian,
    expectedSalaryHigh: s.expectedSalaryHigh,
    lastScoredAt: s.lastScoredAt.toISOString(),
    createdAt: s.createdAt.toISOString(),
  };
}

export default router;
