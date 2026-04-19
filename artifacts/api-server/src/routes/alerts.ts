import { Router } from "express";
import { db, alertsTable, studentsTable, institutesTable } from "@workspace/db";
import { eq, and, sql, inArray } from "drizzle-orm";
import { ListAlertsQueryParams, AcknowledgeAlertParams } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const parsed = ListAlertsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid query params" });
  }
  const { status, page = 1 } = parsed.data;
  const limit = 20;
  const offset = (page - 1) * limit;

  const conditions = status ? [eq(alertsTable.status, status)] : [eq(alertsTable.status, "active")];

  const alertRows = await db
    .select()
    .from(alertsTable)
    .where(and(...conditions))
    .limit(limit)
    .offset(offset)
    .orderBy(sql`created_at desc`);

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(alertsTable)
    .where(and(...conditions));

  const studentIds = [...new Set(alertRows.map((a) => a.studentId))];
  const students =
    studentIds.length > 0
      ? await db
          .select({ id: studentsTable.id, name: studentsTable.name, instituteId: studentsTable.instituteId })
          .from(studentsTable)
          .where(inArray(studentsTable.id, studentIds))
      : [];

  const instituteIds = [...new Set(students.map((s) => s.instituteId))];
  const institutes =
    instituteIds.length > 0
      ? await db
          .select({ id: institutesTable.id, name: institutesTable.name })
          .from(institutesTable)
          .where(inArray(institutesTable.id, instituteIds))
      : [];

  const studentMap = new Map(students.map((s) => [s.id, s]));
  const instituteMap = new Map(institutes.map((i) => [i.id, i]));

  const result = alertRows.map((a) => {
    const student = studentMap.get(a.studentId);
    const institute = student ? instituteMap.get(student.instituteId) : null;
    return {
      id: a.id,
      studentId: a.studentId,
      studentName: student?.name ?? "Unknown Student",
      instituteName: institute?.name ?? "Unknown Institute",
      alertType: a.alertType,
      severity: a.severity,
      message: a.message,
      riskBand: a.riskBand,
      daysToEmiStart: a.daysToEmiStart,
      status: a.status,
      createdAt: a.createdAt.toISOString(),
    };
  });

  return res.json({ alerts: result, total: Number(totalResult.count), page });
});

router.post("/:id/acknowledge", async (req, res) => {
  const parsed = AcknowledgeAlertParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid id" });
  }

  const alert = await db.query.alertsTable.findFirst({
    where: eq(alertsTable.id, parsed.data.id),
  });
  if (!alert) {
    return res.status(404).json({ error: "Alert not found" });
  }

  const [updated] = await db
    .update(alertsTable)
    .set({ status: "acknowledged" })
    .where(eq(alertsTable.id, parsed.data.id))
    .returning();

  const student = await db.query.studentsTable.findFirst({
    where: eq(studentsTable.id, updated.studentId),
  });
  const institute = student
    ? await db.query.institutesTable.findFirst({
        where: eq(institutesTable.id, student.instituteId),
      })
    : null;

  return res.json({
    id: updated.id,
    studentId: updated.studentId,
    studentName: student?.name ?? "Unknown",
    instituteName: institute?.name ?? "Unknown",
    alertType: updated.alertType,
    severity: updated.severity,
    message: updated.message,
    riskBand: updated.riskBand,
    daysToEmiStart: updated.daysToEmiStart,
    status: updated.status,
    createdAt: updated.createdAt.toISOString(),
  });
});

export default router;
