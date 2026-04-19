import { Router } from "express";
import { db, institutesTable } from "@workspace/db";

const router = Router();

router.get("/", async (_req, res) => {
  const institutes = await db.select().from(institutesTable).orderBy(institutesTable.tier, institutesTable.name);
  return res.json(
    institutes.map((i) => ({
      id: i.id,
      name: i.name,
      tier: i.tier,
      city: i.city,
      state: i.state,
      placementRate3m: i.placementRate3m,
      placementRate6m: i.placementRate6m,
      placementRate12m: i.placementRate12m,
      avgSalary: i.avgSalary,
      recruiterCount: i.recruiterCount,
      naacGrade: i.naacGrade,
      studentCount: i.studentCount,
    }))
  );
});

export default router;
